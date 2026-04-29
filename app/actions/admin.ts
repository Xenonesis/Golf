'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DrawConfigSchema } from '@/lib/validation'
import { generateRandomWinningNumbers, generateWeightedWinningNumbers, calculatePrizeDistribution } from '@/lib/draw-algorithm'
import { sendDrawResultsNotification, sendWinnerVerificationReminder } from '@/lib/notifications'

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
    // Get all participant numbers for weighted calculation
    const { data: participants } = await supabase
      .from('draw_participants')
      .select('selected_numbers')
      .eq('draw_id', drawId)
    
    const participantNumbers = participants?.map((p: any) => p.selected_numbers || []) || []
    
    if (participantNumbers.length > 0) {
      // Use weighted algorithm that favors less common numbers
      winningNumbers = generateWeightedWinningNumbers(participantNumbers)
    } else {
      // Fallback to random if no participants
      winningNumbers = generateRandomWinningNumbers()
    }
  } else {
    // Pure random algorithm
    winningNumbers = generateRandomWinningNumbers()
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
    .select('jackpot_amount, rollover_from')
    .eq('id', drawId)
    .single()

  let jackpotAmount = (draw as any)?.jackpot_amount || 0

  // Add rollover from previous draw if exists
  if ((draw as any)?.rollover_from) {
    const { data: previousDraw } = await (supabase as any)
      .from('monthly_draws')
      .select('jackpot_amount')
      .eq('id', (draw as any).rollover_from)
      .single()
    
    if (previousDraw) {
      // Add 40% of previous draw's jackpot (the rollover amount)
      jackpotAmount += (previousDraw as any).jackpot_amount * 0.4
    }
  }

  // Calculate matches for each participant
  const winnersByTier = { tier5: 0, tier4: 0, tier3: 0 }
  const winnerParticipants: any[] = []

  for (const participant of participants) {
    const selectedNumbers = (participant as any).selected_numbers || []
    const matchedCount = selectedNumbers.filter((num: number) => 
      winningNumbers.includes(num)
    ).length

    let isWinner = false
    let matchType = 0

    if (matchedCount === 5) {
      isWinner = true
      matchType = 5
      winnersByTier.tier5++
    } else if (matchedCount === 4) {
      isWinner = true
      matchType = 4
      winnersByTier.tier4++
    } else if (matchedCount === 3) {
      isWinner = true
      matchType = 3
      winnersByTier.tier3++
    }

    if (isWinner) {
      winnerParticipants.push({
        ...participant,
        matchedCount,
        matchType
      })
    }

    // Update participant record with match info (prize calculated below)
    await (supabase as any)
      .from('draw_participants')
      .update({
        matched_count: matchedCount,
        match_type: matchType,
        is_winner: isWinner,
        prize_amount: 0 // Will be updated after prize calculation
      })
      .eq('id', (participant as any).id)
  }

  // Calculate prize distribution based on PRD rules
  const prizeDistribution = calculatePrizeDistribution(jackpotAmount, winnersByTier)

  // Update winners with their prize amounts
  for (const winner of winnerParticipants) {
    let prizeAmount = 0
    
    if (winner.matchType === 5) {
      prizeAmount = prizeDistribution.tier5Prize
    } else if (winner.matchType === 4) {
      prizeAmount = prizeDistribution.tier4Prize
    } else if (winner.matchType === 3) {
      prizeAmount = prizeDistribution.tier3Prize
    }

    // Update prize amount
    await (supabase as any)
      .from('draw_participants')
      .update({
        prize_amount: prizeAmount
      })
      .eq('id', winner.id)

    // Create winner verification record
    await (supabase as any)
      .from('winner_verifications')
      .insert({
        participant_id: winner.id,
        status: 'pending'
      })

    // Send verification reminder email
    try {
      await sendWinnerVerificationReminder(winner.id)
    } catch (error) {
      console.error(`Failed to send verification reminder to winner ${winner.id}:`, error)
    }
  }

  // Update draw with rollover amount if no 5-match winner
  if (winnersByTier.tier5 === 0 && prizeDistribution.rollover > 0) {
    await (supabase as any)
      .from('monthly_draws')
      .update({
        jackpot_amount: prizeDistribution.rollover
      })
      .eq('id', drawId)
  }

  // Send draw results notification to all participants
  try {
    await sendDrawResultsNotification(drawId)
  } catch (error) {
    console.error('Failed to send draw results notifications:', error)
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
