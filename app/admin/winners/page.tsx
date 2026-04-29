import { createClient } from '@/lib/supabase/server'
import WinnersPage from './page-client'
import type { Database } from '@/types/database.types'

type WinnerVerification = Database['public']['Tables']['winner_verifications']['Row'] & {
  draw_participants?: any
}

export default async function WinnersPageWrapper() {
  const supabase = await createClient()

  const { data: verifications } = await (supabase as any)
    .from('winner_verifications')
    .select(`
      *,
      draw_participants (
        user_id,
        prize_amount,
        profiles (full_name)
      )
    `)
    .order('created_at', { ascending: false }) as { data: WinnerVerification[] | null }

  return <WinnersPage initialVerifications={verifications || []} />
}
