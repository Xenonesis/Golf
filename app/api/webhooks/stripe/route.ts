import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { addCredits } from '@/lib/credits'

// Initialize Supabase with service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map Stripe price IDs to monthly credit allocations
const CREDIT_ALLOCATIONS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_test']: 20,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_test']: 30,
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature')!

  let event: any

  try {
    // Verify webhook signature using raw body
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Idempotency: Check if event was already processed
  const { data: existingEvent } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  // Log the event for audit trail
  await supabaseAdmin.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
    processed: false,
  })

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await supabaseAdmin
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)

    // Mark event as failed
    await supabaseAdmin
      .from('webhook_events')
      .update({
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('stripe_event_id', event.id)

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.userId

  if (!userId) {
    throw new Error('No userId in session metadata')
  }

  console.log(`Checkout completed for user ${userId}, session: ${session.id}`)
}

async function handleSubscriptionCreated(subscription: any) {
  const customerId = subscription.customer

  // Find user by Stripe customer ID from subscriptions table
  const { data: subscriptionRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscriptionRecord) {
    throw new Error(`Customer not found: ${customerId}`)
  }

  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    throw new Error('No price found in subscription')
  }

  const monthlyCredits = CREDIT_ALLOCATIONS[priceId] || 20

  // Check if this is user's first subscription
  const { data: creditRecord } = await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', subscriptionRecord.user_id)
    .single()

  let bonusCredits = 0
  let firstSubscriptionBonusApplied = false

  if (creditRecord && !creditRecord.first_subscription_bonus_claimed) {
    // Award 2X the monthly credits as one-time bonus
    bonusCredits = monthlyCredits * 2
    firstSubscriptionBonusApplied = true

    // Add bonus credits
    await addCredits(
      subscriptionRecord.user_id,
      bonusCredits,
      'first_subscription_bonus',
      `First subscription bonus - 2X ${monthlyCredits} credits`
    )

    // Update credit record to mark bonus as claimed
    await supabaseAdmin
      .from('user_credits')
      .update({
        first_subscription_bonus_claimed: true,
        monthly_allowance: monthlyCredits
      })
      .eq('user_id', subscriptionRecord.user_id)
  } else if (creditRecord) {
    // Just update monthly allowance for existing subscribers
    await supabaseAdmin
      .from('user_credits')
      .update({
        monthly_allowance: monthlyCredits
      })
      .eq('user_id', subscriptionRecord.user_id)
  }

  // Upsert subscription record with credit info
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: subscriptionRecord.user_id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    monthly_credits: monthlyCredits,
    first_subscription_bonus_applied: firstSubscriptionBonusApplied,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'stripe_subscription_id'
  })

  console.log(`Subscription created: ${subscription.id} for user ${subscriptionRecord.user_id}, credits: ${monthlyCredits}, bonus: ${bonusCredits}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  const { data: subscriptionRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!subscriptionRecord) {
    throw new Error(`Subscription not found: ${subscription.id}`)
  }

  const priceId = subscription.items.data[0]?.price.id
  const monthlyCredits = priceId ? (CREDIT_ALLOCATIONS[priceId] || 20) : undefined

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId || undefined,
      monthly_credits: monthlyCredits,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      ended_at: subscription.ended_at
        ? new Date(subscription.ended_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionRecord.id)

  // Update credit allowance if plan changed
  if (monthlyCredits && subscription.status === 'active') {
    await supabaseAdmin
      .from('user_credits')
      .update({
        monthly_allowance: monthlyCredits
      })
      .eq('user_id', subscriptionRecord.user_id)
  }

  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}, credits: ${monthlyCredits}`)
}

async function handleSubscriptionDeleted(subscription: any) {
  const { data: subscriptionRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!subscriptionRecord) {
    console.warn(`Subscription not found for deletion: ${subscription.id}`)
    return
  }

  // Mark subscription as canceled/expired
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionRecord.id)

  console.log(`Subscription deleted: ${subscription.id} for user ${subscriptionRecord.user_id}`)
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription

  if (!subscriptionId) {
    return // Not a subscription invoice
  }

  console.log(`Payment succeeded for subscription: ${subscriptionId}`)
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription

  if (!subscriptionId) {
    return
  }

  const { data: subscriptionRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (subscriptionRecord) {
    console.log(`Payment failed for subscription: ${subscriptionId}, user: ${subscriptionRecord.user_id}`)
  }
}
