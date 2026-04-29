import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function WinnersPage() {
  const supabase = await createClient()

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      draw_participants (
        user_id,
        prize_amount,
        profiles (full_name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Winner Verification</h1>
        <p className="text-muted-foreground">Review and approve winner submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>Winners awaiting proof review</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications && verifications.length > 0 ? (
            <div className="space-y-3">
              {verifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {(verification.draw_participants as any)?.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prize: ${(verification.draw_participants as any)?.prize_amount || 0}
                    </p>
                  </div>
                  <Badge
                    variant={
                      verification.status === 'approved' ? 'success' :
                      verification.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {verification.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No pending verifications</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
