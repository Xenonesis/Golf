'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get or create Stripe customer
  const { data: customerRecord } = await (supabase as any)
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId: string

  if (customerRecord?.stripe_customer_id) {
    customerId = customerRecord.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: {
        userId: user.id,
      },
    })

    customerId = customer.id

    await (supabase as any).from('subscriptions').insert({
      user_id: user.id,
      stripe_customer_id: customerId,
      plan: 'monthly',
      status: 'pending',
    })
  }

  const headerList = await headers()
  const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      userId: user.id,
      priceId: priceId,
    },
    allow_promotion_codes: true,
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  redirect(session.url)
}

export async function redirectToCustomerPortal() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  if (!session.url) {
    throw new Error('Failed to create portal session')
  }

  redirect(session.url)
}

export async function updateContributionPercentage(percentage: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Validate percentage (minimum 10%, maximum 50%)
  if (percentage < 10 || percentage > 50) {
    throw new Error('Contribution percentage must be between 10% and 50%')
  }

  const { error } = await (supabase as any)
    .from('subscriptions')
    .update({ charity_contribution_percentage: percentage })
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to update contribution percentage')
  }

  return { success: true }
}
