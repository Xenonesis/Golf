'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ScoreSchema } from '@/lib/validation'
import { spendCredits } from '@/lib/credits'

const SCORE_ENTRY_COST = 1 // 1 credit per score entry

export async function addScore(formData: FormData) {
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

  // Check and spend credits
  const creditResult = await spendCredits(
    user.id,
    SCORE_ENTRY_COST,
    `Golf score entry: ${result.data.score} at ${result.data.course_name}`,
    undefined,
    'golf_score'
  )

  if (!creditResult.success) {
    return { error: creditResult.error }
  }

  const { error } = await (supabase as any).from('golf_scores').insert({
    user_id: user.id,
    ...result.data,
  })

  if (error) {
    // Refund credits if score insert fails
    const { error: refundError } = await (supabase as any)
      .from('user_credits')
      .update({
        current_balance: creditResult.balance! + SCORE_ENTRY_COST,
        total_spent: ((await (supabase as any).from('user_credits').select('total_spent').eq('user_id', user.id).single()).data?.total_spent || 0) - SCORE_ENTRY_COST
      })
      .eq('user_id', user.id)

    if (refundError) {
      console.error('Failed to refund credits:', refundError)
    }

    if (error.code === '23505') {
      return { error: 'A score for this date already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { success: true, remainingCredits: creditResult.balance }
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
