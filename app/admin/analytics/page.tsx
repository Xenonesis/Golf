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

  // Prize pool statistics
  const { data: draws } = await (supabase as any)
    .from('monthly_draws')
    .select('jackpot_amount, status')
    .order('draw_month', { ascending: false })
  
  const totalPrizePool = draws?.reduce((sum: number, draw: any) => sum + (draw.jackpot_amount || 0), 0) || 0
  const publishedDraws = draws?.filter((d: any) => d.status === 'published' || d.status === 'completed').length || 0

  // Charity contribution stats
  const { data: charities } = await (supabase as any)
    .from('charities')
    .select('name, total_donations')
    .eq('is_active', true)
  
  const totalCharityDonations = charities?.reduce((sum: number, charity: any) => sum + (charity.total_donations || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      {/* Core Metrics */}
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

      {/* Prize Pool Statistics - NEW per PRD Section 11 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Prize Pool Statistics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Prize Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">${totalPrizePool.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Published Draws</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{publishedDraws}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Jackpot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${publishedDraws > 0 ? (totalPrizePool / publishedDraws).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charity Contributions - NEW per PRD Section 11 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Charity Contributions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">${totalCharityDonations.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Charities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{charities?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Individual Charity Breakdown */}
        {charities && charities.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Donations by Charity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {charities.map((charity: any) => (
                  <div key={charity.name} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">{charity.name}</span>
                    <span className="text-lg font-bold">${(charity.total_donations || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
