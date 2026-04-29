import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Get various stats
  const { count: totalUsers } = await (supabase as any).from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeSubscriptions } = await (supabase as any).from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: totalScores } = await (supabase as any).from('golf_scores').select('*', { count: 'exact', head: true })
  const { count: totalParticipants } = await (supabase as any).from('draw_participants').select('*', { count: 'exact', head: true })
  const { count: totalWinners } = await (supabase as any).from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'approved')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeSubscriptions || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scores Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalScores || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Draw Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalParticipants || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verified Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalWinners || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalUsers ? Math.round(((activeSubscriptions || 0) / totalUsers) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
