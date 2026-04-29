'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DrawNumbersSchema } from '@/lib/validation'
import { spendCredits } from '@/lib/credits'

const DRAW_ENTRY_COST = 2 // 2 credits per draw entry

export async function participateInDraw(numbers: number[]) {
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
    return { error: 'Active subscription required to participate' }
  }

  // Validate numbers
  const result = DrawNumbersSchema.safeParse({ numbers })
  if (!result.success) {
    return { error: 'Invalid numbers selection' }
  }

  // Get current month's draw
  const now = new Date()
  const drawMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: currentDraw } = await supabase
    .from('monthly_draws')
    .select('id')
    .eq('draw_month', drawMonth)
    .single()

  const draw = currentDraw as any

  if (!draw) {
    return { error: 'No active draw for this month' }
  }

  // Check if already participated
  const { data: existing } = await (supabase as any)
    .from('draw_participants')
    .select('id')
    .eq('user_id', user.id)
    .eq('draw_id', draw.id)
    .single()

  if (existing) {
    return { error: 'Already participated in this month\'s draw' }
  }

  // Check and spend credits
  const creditResult = await spendCredits(
    user.id,
    DRAW_ENTRY_COST,
    `Draw participation: ${numbers.join(', ')}`,
    undefined,
    'draw_entry'
  )

  if (!creditResult.success) {
    return { error: creditResult.error }
  }

  // Insert participation
  const { error } = await (supabase as any)
    .from('draw_participants')
    .insert({
      user_id: user.id,
      draw_id: draw.id,
      selected_numbers: numbers,
    })

  if (error) {
    // Refund credits if participation insert fails
    await (supabase as any)
      .from('user_credits')
      .update({
        current_balance: creditResult.balance! + DRAW_ENTRY_COST,
        total_spent: ((await (supabase as any).from('user_credits').select('total_spent').eq('user_id', user.id).single()).data?.total_spent || 0) - DRAW_ENTRY_COST
      })
      .eq('user_id', user.id)

    return { error: error.message }
  }

  revalidatePath('/dashboard/draws')
  return { success: true, remainingCredits: creditResult.balance }
}
