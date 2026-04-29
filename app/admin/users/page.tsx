import { createClient } from '@/lib/supabase/server'
import UsersPage from './page-client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  subscriptions?: Database['public']['Tables']['subscriptions']['Row'][] | null
  golf_scores?: Database['public']['Tables']['golf_scores']['Row'][] | null
}

export default async function UsersPageWrapper() {
  const supabase = await createClient()

  const { data: users } = await (supabase as any)
    .from('profiles')
    .select(`
      *,
      subscriptions (status, plan),
      golf_scores (*)
    `)
    .order('created_at', { ascending: false }) as { data: Profile[] | null }

  return <UsersPage initialUsers={users || []} />
}
