'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserCredits } from '@/lib/credits'

export async function getCreditData() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Get current credit balance
  const credits = await getUserCredits(user.id)

  // Get transaction history (last 20 transactions)
  try {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching credit transactions:', error.message)
      // Return data with empty transactions if table doesn't exist yet
      return {
        ...credits,
        transactions: [],
      }
    }

    return {
      ...credits,
      transactions: transactions || [],
    }
  } catch (err) {
    console.error('Failed to fetch transactions:', err)
    return {
      ...credits,
      transactions: [],
    }
  }
}
