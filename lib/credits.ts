import { createClient } from '@supabase/supabase-js'

export type CreditTransactionType =
  | 'signup_bonus'
  | 'monthly_grant'
  | 'subscription_grant'
  | 'first_subscription_bonus'
  | 'spend'
  | 'refund'

export interface CreditBalance {
  currentBalance: number
  totalEarned: number
  totalSpent: number
  monthlyAllowance: number
}

export async function getUserCredits(userId: string): Promise<CreditBalance> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('user_credits')
    .select('current_balance, total_earned, total_spent, monthly_allowance')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return {
      currentBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      monthlyAllowance: 10
    }
  }

  return {
    currentBalance: Number(data.current_balance),
    totalEarned: Number(data.total_earned),
    totalSpent: Number(data.total_spent),
    monthlyAllowance: Number(data.monthly_allowance)
  }
}

export async function spendCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ success: boolean; error?: string; balance?: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get current balance
  const { data: creditRecord, error: fetchError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError || !creditRecord) {
    return { success: false, error: 'Credit record not found' }
  }

  const currentBalance = Number(creditRecord.current_balance)

  if (currentBalance < amount) {
    return {
      success: false,
      error: `Insufficient credits. You have ${currentBalance} credits but need ${amount}.`
    }
  }

  // Deduct credits
  const newBalance = currentBalance - amount

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      current_balance: newBalance,
      total_spent: creditRecord.total_spent + amount
    })
    .eq('user_id', userId)

  if (updateError) {
    return { success: false, error: 'Failed to spend credits' }
  }

  // Log transaction
  const { error: logError } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: -amount,
    type: 'spend',
    description,
    reference_id: referenceId,
    reference_type: referenceType,
    balance_after: newBalance
  })

  if (logError) {
    console.error('Failed to log credit transaction:', logError)
  }

  return { success: true, balance: newBalance }
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description: string
): Promise<{ success: boolean; error?: string; balance?: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: creditRecord, error: fetchError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError || !creditRecord) {
    return { success: false, error: 'Credit record not found' }
  }

  const newBalance = Number(creditRecord.current_balance) + amount

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      current_balance: newBalance,
      total_earned: creditRecord.total_earned + amount
    })
    .eq('user_id', userId)

  if (updateError) {
    return { success: false, error: 'Failed to add credits' }
  }

  // Log transaction
  const { error: logError } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    balance_after: newBalance
  })

  if (logError) {
    console.error('Failed to log credit transaction:', logError)
  }

  return { success: true, balance: newBalance }
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string; balance?: number }> {
  return addCredits(userId, amount, 'refund', description)
}
