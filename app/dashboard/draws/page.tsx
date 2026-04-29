import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NumberPicker } from '@/components/draws/number-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database.types'

type MonthlyDraw = Database['public']['Tables']['monthly_draws']['Row']
type DrawParticipant = Database['public']['Tables']['draw_participants']['Row']

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get current month's draw
  const now = new Date()
  const drawMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: currentDraw } = await supabase
    .from('monthly_draws')
    .select('*')
    .eq('draw_month', drawMonth)
    .single() as { data: MonthlyDraw | null }

  // Check if user participated
  const { data: participation } = currentDraw
    ? await supabase
        .from('draw_participants')
        .select('*')
        .eq('user_id', user.id)
        .eq('draw_id', currentDraw.id)
        .single() as { data: DrawParticipant | null }
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monthly Draw</h1>
        <p className="text-muted-foreground">Participate for a chance to win rewards</p>
      </div>

      {/* Prize Pool Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Pool Distribution</CardTitle>
          <CardDescription>How the prize pool is shared among winners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary border text-center">
              <div className="text-2xl font-bold mb-1">40%</div>
              <div className="text-sm font-medium">5 Numbers Match</div>
              <div className="text-xs text-muted-foreground mt-1">Jackpot Winner</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary border text-center">
              <div className="text-2xl font-bold mb-1">35%</div>
              <div className="text-sm font-medium">4 Numbers Match</div>
              <div className="text-xs text-muted-foreground mt-1">Second Prize</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary border text-center">
              <div className="text-2xl font-bold mb-1">25%</div>
              <div className="text-sm font-medium">3 Numbers Match</div>
              <div className="text-xs text-muted-foreground mt-1">Third Prize</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            If no winner matches all numbers, the jackpot rolls over to next month.
          </p>
        </CardContent>
      </Card>

      {currentDraw?.status === 'published' && currentDraw.winning_numbers && (
        <Card>
          <CardHeader>
            <CardTitle>This Month's Winning Numbers</CardTitle>
            <CardDescription>Draw results are in!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {currentDraw.winning_numbers.map((num) => (
                <Badge key={num} variant="default" className="text-lg px-4 py-2">
                  {num}
                </Badge>
              ))}
            </div>
            {participation && (
              <div className="mt-4">
                <p className="text-sm font-medium">Your numbers:</p>
                <div className="flex gap-2 mt-2">
                  {participation.selected_numbers?.map((num) => (
                    <Badge key={num} variant={currentDraw.winning_numbers?.includes(num) ? 'success' : 'secondary'}>
                      {num}
                    </Badge>
                  ))}
                </div>
                {participation.is_winner && (
                  <p className="text-green-600 dark:text-green-400 font-medium mt-2">🎉 You're a winner!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!participation && currentDraw?.status === 'draft' && <NumberPicker />}

      {participation && (
        <Card>
          <CardHeader>
            <CardTitle>You're Entered!</CardTitle>
            <CardDescription>Your numbers for this month&apos;s draw</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {participation.selected_numbers?.map((num) => (
                <Badge key={num} variant="secondary" className="text-lg px-3 py-1">
                  {num}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Good luck! Results will be published at the end of the month.
            </p>
          </CardContent>
        </Card>
      )}

      {!currentDraw && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Draw</CardTitle>
            <CardDescription>The next draw will be available soon.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
