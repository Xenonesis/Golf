import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/database.types'

type MonthlyDraw = Database['public']['Tables']['monthly_draws']['Row']

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get stats
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: subscriptionCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: charityCount } = await supabase
    .from('charities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: draws } = await supabase
    .from('monthly_draws')
    .select('*')
    .order('draw_month', { ascending: false })
    .limit(1) as { data: MonthlyDraw[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subscriptionCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Charities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{charityCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {draws && draws.length > 0 && (() => {
        const latestDraw = draws[0]
        return (
          <Card>
            <CardHeader>
              <CardTitle>Latest Draw</CardTitle>
              <CardDescription>{new Date(latestDraw.draw_month).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm capitalize">Status: {latestDraw.status}</p>
              {latestDraw.winning_numbers && (
                <div className="flex gap-2 mt-2">
                  {latestDraw.winning_numbers.map((num: number) => (
                    <span key={num} className="px-3 py-1 bg-primary text-primary-foreground rounded">
                      {num}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
