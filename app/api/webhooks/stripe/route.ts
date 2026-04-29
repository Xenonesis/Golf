import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  // Find user by Stripe customer ID
  const { data: customerRecord } = await supabaseAdmin
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!customerRecord) {
    throw new Error(`Customer not found: ${customerId}`)
  }

  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    throw new Error('No price found in subscription')
  }

  // Insert subscription record
  await supabaseAdmin.from('subscriptions').insert({
    user_id: customerRecord.user_id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    quantity: subscription.items.data[0]?.quantity || 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })

  console.log(`Subscription created: ${subscription.id} for user ${customerRecord.user_id}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  const { data: subscriptionRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!subscriptionRecord) {
    throw new Error(`Subscription not found: ${subscription.id}`)
  }

  const priceId = subscription.items.data[0]?.price.id

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId || undefined,
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

  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`)
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
