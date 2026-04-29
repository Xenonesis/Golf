import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WinnerVerificationForm } from '@/components/winnings/winner-verification-form'
import type { Database } from '@/types/database.types'

type WinnerVerification = Database['public']['Tables']['winner_verifications']['Row'] & {
  draw_participants?: any
}

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's winning participations
  const { data: winningParticipations } = await (supabase as any)
    .from('draw_participants')
    .select(`
      *,
      monthly_draws (
        id,
        draw_month,
        winning_numbers,
        jackpot_amount
      )
    `)
    .eq('user_id', user.id)
    .eq('is_winner', true)
    .order('created_at', { ascending: false })

  // Get existing verifications for these participations
  const participationIds = (winningParticipations || []).map((p: any) => p.id)
  const { data: verifications } = participationIds.length > 0
    ? await (supabase as any)
        .from('winner_verifications')
        .select('*')
        .in('participant_id', participationIds)
    : { data: [] }

  // Create a map of participant_id to verification
  const verificationMap = new Map()
  verifications?.forEach((v: any) => {
    verificationMap.set(v.participant_id, v)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Winnings</h1>
        <p className="text-muted-foreground">Track your draw winnings and submit verification</p>
      </div>

      {!winningParticipations || winningParticipations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Winnings Yet</CardTitle>
            <CardDescription>
              You haven't won any draws yet. Keep participating for a chance to win!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {winningParticipations.map((participation: any) => {
            const verification = verificationMap.get(participation.id)
            const draw = participation.monthly_draws
            
            return (
              <Card key={participation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        Draw: {new Date(draw.draw_month).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </CardTitle>
                      <CardDescription>
                        You matched {participation.matched_count} numbers!
                      </CardDescription>
                    </div>
                    <Badge variant="success" className="text-sm">
                      Winner - ${Number(participation.prize_amount || 0).toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Winning Numbers:</p>
                      <div className="flex gap-2 flex-wrap">
                        {draw.winning_numbers?.map((num: number) => (
                          <Badge key={num} variant="default" className="text-sm px-3 py-1">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Your Numbers:</p>
                      <div className="flex gap-2 flex-wrap">
                        {participation.selected_numbers?.map((num: number) => (
                          <Badge 
                            key={num} 
                            variant={draw.winning_numbers?.includes(num) ? 'success' : 'secondary'}
                            className="text-sm px-3 py-1"
                          >
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {verification ? (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Verification Status</p>
                            <Badge
                              variant={
                                verification.status === 'approved' ? 'success' :
                                verification.status === 'rejected' ? 'destructive' :
                                verification.status === 'paid' ? 'default' :
                                'secondary'
                              }
                              className="mt-1"
                            >
                              {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                            </Badge>
                          </div>
                          {verification.proof_image_url && (
                            <a 
                              href={verification.proof_image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Proof
                            </a>
                          )}
                        </div>
                        {verification.admin_notes && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Admin Notes:</p>
                            <p className="text-sm">{verification.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <WinnerVerificationForm participantId={participation.id} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
