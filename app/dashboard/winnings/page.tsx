import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      draw_participants (
        prize_amount,
        matched_count,
        monthly_draws (draw_month)
      )
    `)
    .eq('participant_id', '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Winnings</h1>
        <p className="text-muted-foreground">Track your draw winnings and verifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
          <CardDescription>Status of your winning submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications && verifications.length > 0 ? (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      Draw: {new Date((v.draw_participants as any)?.monthly_draws?.draw_month).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matches: {(v.draw_participants as any)?.matched_count}
                    </p>
                  </div>
                  <Badge
                    variant={
                      v.status === 'approved' ? 'success' :
                      v.status === 'rejected' ? 'destructive' :
                      v.status === 'paid' ? 'default' :
                      'secondary'
                    }
                  >
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No winnings yet. Keep participating in draws!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
