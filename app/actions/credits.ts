'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserCredits } from '@/lib/credits'

export async function getCreditData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get current credit balance
  const credits = await getUserCredits(user.id)

  // Get transaction history (last 20 transactions)
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching credit transactions:', error)
  }

  return {
    ...credits,
    transactions: transactions || [],
  }
}
