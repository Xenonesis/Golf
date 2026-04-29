import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScoreForm } from '@/components/scores/score-form'
import { ScoreList } from '@/components/scores/score-list'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch last 5 scores
  const { data: scores } = await (supabase as any)
    .rpc('get_last_5_scores', { p_user_id: user.id })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Score Management</h1>
        <p className="text-muted-foreground">Track your golf performance</p>
      </div>

      <ScoreForm />
      <ScoreList scores={scores || []} />
    </div>
  )
}
