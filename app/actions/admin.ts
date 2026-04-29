'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DrawConfigSchema } from '@/lib/validation'

// ============================================
// USER MANAGEMENT
// ============================================

export async function updateUserRole(userId: string, role: 'public' | 'subscriber' | 'admin') {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserSubscription(userId: string, status: 'active' | 'cancelled' | 'expired') {
  const supabase = await createClient()

  // Get current subscription
  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return { error: 'No subscription found' }
  }

  const { error } = await (supabase as any)
    .from('subscriptions')
    .update({ status })
    .eq('id', subscription.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ============================================
// DRAW MANAGEMENT
// ============================================

export async function createDraw(drawMonth: string, algorithm: 'random' | 'weighted' = 'random', jackpotAmount: number = 0) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('monthly_draws')
    .insert({
      draw_month: drawMonth,
      algorithm,
      jackpot_amount: jackpotAmount,
      status: 'draft'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/draws')
  return { success: true }
}

export async function updateDraw(drawId: string, updates: { algorithm?: 'random' | 'weighted'; jackpot_amount?: number }) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('monthly_draws')
    .update(updates)
    .eq('id', drawId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/draws')
  return { success: true }
}

export async function simulateDraw(drawId: string): Promise<{ winningNumbers: number[]; winners: any[] }> {
  const supabase = await createClient()

  // Get draw details
  const { data: draw } = await (supabase as any)
    .from('monthly_draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (!draw) {
    throw new Error('Draw not found')
  }

  // Generate winning numbers based on algorithm
  let winningNumbers: number[]
  
  if ((draw as any).algorithm === 'weighted') {
    // TODO: Implement weighted algorithm based on frequency
    // For now, use random as fallback
    winningNumbers = generateRandomNumbers()
  } else {
    winningNumbers = generateRandomNumbers()
  }

  // Get all participants for this draw
  const { data: participants } = await supabase
    .from('draw_participants')
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq('draw_id', drawId)

  // Calculate matches and determine winners
  const winners: any[] = []
  
  participants?.forEach((participant: any) => {
    const selectedNumbers = participant.selected_numbers || []
    const matchedNumbers = selectedNumbers.filter((num: number) => 
      winningNumbers.includes(num)
    )
    const matchCount = matchedNumbers.length

    if (matchCount >= 3) {
      winners.push({
        ...participant,
        matchCount,
        matchedNumbers
      })
    }
  })

  return { winningNumbers, winners }
}

export async function publishDraw(drawId: string, winningNumbers: number[]) {
  const supabase = await createClient()

  // Validate winning numbers
  if (winningNumbers.length !== 5 || new Set(winningNumbers).size !== 5) {
    return { error: 'Must provide exactly 5 unique numbers' }
  }

  // Update draw with winning numbers and publish
  const { error } = await (supabase as any)
    .from('monthly_draws')
    .update({
      winning_numbers: winningNumbers,
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', drawId)

  if (error) {
    return { error: error.message }
  }

  // Determine winners and calculate prizes
  await determineWinners(drawId, winningNumbers)

  revalidatePath('/admin/draws')
  revalidatePath('/dashboard/draws')
  return { success: true }
}

async function determineWinners(drawId: string, winningNumbers: number[]) {
  const supabase = await createClient()

  // Get all participants
  const { data: participants } = await (supabase as any)
    .from('draw_participants')
    .select('*')
    .eq('draw_id', drawId)

  if (!participants) return

  // Get draw info for prize calculation
  const { data: draw } = await (supabase as any)
    .from('monthly_draws')
    .select('jackpot_amount')
    .eq('id', drawId)
    .single()

  const jackpotAmount = (draw as any)?.jackpot_amount || 0

  // Calculate matches for each participant
  for (const participant of participants) {
    const selectedNumbers = (participant as any).selected_numbers || []
    const matchedCount = selectedNumbers.filter((num: number) => 
      winningNumbers.includes(num)
    ).length

    let isWinner = false
    let matchType = 0
    let prizeAmount = 0

    if (matchedCount === 5) {
      isWinner = true
      matchType = 5
      // 40% of jackpot for 5-match
      prizeAmount = jackpotAmount * 0.4
    } else if (matchedCount === 4) {
      isWinner = true
      matchType = 4
      // 35% of jackpot for 4-match
      prizeAmount = jackpotAmount * 0.35
    } else if (matchedCount === 3) {
      isWinner = true
      matchType = 3
      // 25% of jackpot for 3-match
      prizeAmount = jackpotAmount * 0.25
    }

    // Update participant record
    await (supabase as any)
      .from('draw_participants')
      .update({
        matched_count: matchedCount,
        match_type: matchType,
        is_winner: isWinner,
        prize_amount: isWinner ? prizeAmount : 0
      })
      .eq('id', (participant as any).id)

    // Create winner verification record if winner
    if (isWinner) {
      await (supabase as any)
        .from('winner_verifications')
        .insert({
          participant_id: (participant as any).id,
          status: 'pending'
        })
    }
  }
}

function generateRandomNumbers(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 50) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

// ============================================
// CHARITY MANAGEMENT
// ============================================

export async function addCharity(name: string, description: string, category: string, website?: string, isFeatured: boolean = false) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('charities')
    .insert({
      name,
      description,
      category,
      website,
      is_featured: isFeatured,
      is_active: true
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function updateCharity(charityId: string, updates: { name?: string; description?: string; category?: string; website?: string; is_featured?: boolean; is_active?: boolean }) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('charities')
    .update(updates)
    .eq('id', charityId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function deleteCharity(charityId: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('charities')
    .delete()
    .eq('id', charityId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

// ============================================
// WINNER VERIFICATION
// ============================================

export async function approveWinner(verificationId: string, adminNotes?: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('winner_verifications')
    .update({
      status: 'approved',
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', verificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/winners')
  return { success: true }
}

export async function rejectWinner(verificationId: string, adminNotes?: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('winner_verifications')
    .update({
      status: 'rejected',
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', verificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/winners')
  return { success: true }
}

export async function markWinnerAsPaid(verificationId: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('winner_verifications')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', verificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/winners')
  return { success: true }
}
