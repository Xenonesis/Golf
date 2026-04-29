'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export async function createDonation(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const charityId = formData.get('charity_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const isAnonymous = formData.get('is_anonymous') === 'true'
  const message = formData.get('message') as string || null
  
  if (!charityId || !amount || amount < 1) {
    return { error: 'Invalid donation amount or charity' }
  }
  
  // Verify charity exists and is active
  const { data: charity, error: charityError } = await supabase
    .from('charities')
    .select('id, name')
    .eq('id', charityId)
    .eq('is_active', true)
    .single()
  
  if (charityError || !charity) {
    return { error: 'Charity not found or inactive' }
  }
  
  const charityName = (charity as any).name
  
  try {
    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation to ${charityName}`,
              description: message ? `Message: ${message}` : undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donations?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charityId}?canceled=true`,
      metadata: {
        charity_id: charityId,
        user_id: user?.id || '',
        is_anonymous: isAnonymous.toString(),
        message: message || '',
        donor_name: isAnonymous ? 'Anonymous' : (user?.user_metadata?.full_name || 'Anonymous'),
        donor_email: user?.email || '',
      },
    })
    
    // Create donation record
    const { error: dbError } = await (supabase as any)
      .from('donations')
      .insert({
        user_id: user?.id || null,
        charity_id: charityId,
        amount: amount,
        currency: 'USD',
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'pending',
        is_anonymous: isAnonymous,
        donor_name: isAnonymous ? 'Anonymous' : (user?.user_metadata?.full_name || null),
        donor_email: user?.email || null,
        message: message,
      })
    
    if (dbError) {
      console.error('Failed to create donation record:', dbError)
    }
    
    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Donation creation error:', error)
    return { error: 'Failed to create donation. Please try again.' }
  }
}

export async function updateDonationStatus(paymentIntentId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await (supabase as any)
    .from('donations')
    .update({ status })
    .eq('stripe_payment_intent_id', paymentIntentId)
  
  if (error) {
    console.error('Failed to update donation status:', error)
    return { error: error.message }
  }
  
  // If completed, update charity's total_donations
  if (status === 'completed') {
    const { data: donation } = await supabase
      .from('donations')
      .select('amount, charity_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()
    
    if (donation) {
      await (supabase as any).rpc('increment_charity_donations', {
        p_charity_id: (donation as any).charity_id,
        p_amount: (donation as any).amount
      })
    }
  }
  
  revalidatePath('/charities')
  return { success: true }
}

export async function getUserDonations() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      charities (
        id,
        name,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  return { donations }
}
