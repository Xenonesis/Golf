import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import { getUserCredits } from '@/lib/credits'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // Fetch subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: Subscription | null }

  // Fetch credit balance
  const credits = await getUserCredits(user.id)

  // Fetch last 5 scores
  const { data: scores } = await (supabase as any)
    .rpc('get_last_5_scores', { p_user_id: user.id })

  // Fetch charity selection
  const { data: charitySelection } = await supabase
    .from('user_charity_selections')
    .select('*, charities(name, logo_url)')
    .eq('user_id', user.id)
    .single() as { data: any | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'Golfer'}!</h1>
          <p className="text-muted-foreground">Manage your golf performance and rewards</p>
        </div>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Your current plan and access level</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{subscription.plan} Plan</p>
                <p className="text-sm text-muted-foreground capitalize">Status: {subscription.status}</p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">No active subscription</p>
              <Link href="/pricing">
                <Button>Subscribe Now</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scores Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{scores?.length || 0}/5</p>
            <p className="text-sm text-muted-foreground">Last 5 Stableford scores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${credits.currentBalance === 0 ? 'text-red-500' : credits.currentBalance < 5 ? 'text-yellow-500' : 'text-green-500'}`}>
              {credits.currentBalance}
            </p>
            <p className="text-sm text-muted-foreground">{credits.monthlyAllowance} monthly allowance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Charity Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {charitySelection?.charities?.name || 'Not selected'}
            </p>
            <p className="text-sm text-muted-foreground">Your contribution partner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Draw Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/draws">
              <Button className="w-full">View Draws</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/scores">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Add Score</CardTitle>
              <CardDescription>Enter your latest Stableford score</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/credits">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Manage Credits
              </CardTitle>
              <CardDescription>View balance and transaction history</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/charity">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Select Charity</CardTitle>
              <CardDescription>Choose where your contribution goes</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
