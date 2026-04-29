'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ScoreSchema } from '@/lib/validation'

export async function addScore(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return { error: 'Active subscription required to add scores' }
  }

  const rawData = {
    score: Number(formData.get('score')),
    play_date: formData.get('play_date') as string,
    course_name: formData.get('course_name') as string,
    notes: formData.get('notes') as string | undefined,
  }

  const result = ScoreSchema.safeParse(rawData)
  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() }
  }

  const { error } = await (supabase as any).from('golf_scores').insert({
    user_id: user.id,
    ...result.data,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A score for this date already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function deleteScore(scoreId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await (supabase as any)
    .from('golf_scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function updateScore(scoreId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    score: Number(formData.get('score')),
    play_date: formData.get('play_date') as string,
    course_name: formData.get('course_name') as string,
    notes: formData.get('notes') as string | undefined,
  }

  const result = ScoreSchema.safeParse(rawData)
  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() }
  }

  const { error } = await (supabase as any)
    .from('golf_scores')
    .update(result.data)
    .eq('id', scoreId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { success: true }
}
