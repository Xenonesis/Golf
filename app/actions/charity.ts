'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function selectCharity(charityId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if already selected
  const { data: existing } = await supabase
    .from('user_charity_selections')
    .select('id')
    .eq('user_id', user.id)
    .eq('charity_id', charityId)
    .single()

  if (existing) {
    return { error: 'Already selected this charity' }
  }

  // Delete existing selection if any
  await supabase
    .from('user_charity_selections')
    .delete()
    .eq('user_id', user.id)

  // Insert new selection
  const { error } = await (supabase as any)
    .from('user_charity_selections')
    .insert({
      user_id: user.id,
      charity_id: charityId,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charity')
  return { success: true }
}

export async function updateContributionPercentage(percentage: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (percentage < 10 || percentage > 100) {
    return { error: 'Contribution must be between 10% and 100%' }
  }

  const { error } = await (supabase as any)
    .from('subscriptions')
    .update({ charity_contribution_percentage: percentage })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charity')
  return { success: true }
}
