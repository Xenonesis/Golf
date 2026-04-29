import { createClient } from '@/lib/supabase/server'
import DrawsPage from './page-client'
import type { Database } from '@/types/database.types'

type MonthlyDraw = Database['public']['Tables']['monthly_draws']['Row']

export default async function DrawsPageWrapper() {
  const supabase = await createClient()

  const { data: draws } = await (supabase as any)
    .from('monthly_draws')
    .select('*')
    .order('draw_month', { ascending: false }) as { data: MonthlyDraw[] | null }

  return <DrawsPage initialDraws={draws || []} />
}
