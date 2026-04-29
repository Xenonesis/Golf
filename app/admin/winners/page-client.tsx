'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { approveWinner, rejectWinner, markWinnerAsPaid } from '@/app/actions/admin'
import type { Database } from '@/types/database.types'

type WinnerVerification = Database['public']['Tables']['winner_verifications']['Row'] & {
  draw_participants?: any
}

export default function WinnersPage({ initialVerifications }: { initialVerifications: WinnerVerification[] }) {
  const [verifications, setVerifications] = useState(initialVerifications)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setProcessing(id)
    const result = await approveWinner(id, 'Approved by admin')
    if (result.success) {
      refreshData()
    }
    setProcessing(null)
  }

  async function handleReject(id: string) {
    setProcessing(id)
    const result = await rejectWinner(id, 'Rejected - insufficient proof')
    if (result.success) {
      refreshData()
    }
    setProcessing(null)
  }

  async function handleMarkPaid(id: string) {
    setProcessing(id)
    const result = await markWinnerAsPaid(id)
    if (result.success) {
      refreshData()
    }
    setProcessing(null)
  }

  async function refreshData() {
    const supabase = createClient()
    const { data } = await (supabase as any)
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
    setVerifications(data || [])
  }

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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        verification.status === 'approved' ? 'success' :
                        verification.status === 'rejected' ? 'destructive' :
                        verification.status === 'paid' ? 'default' :
                        'secondary'
                      }
                    >
                      {verification.status}
                    </Badge>
                    {verification.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(verification.id)}
                          disabled={processing === verification.id}
                        >
                          {processing === verification.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(verification.id)}
                          disabled={processing === verification.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {verification.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(verification.id)}
                        disabled={processing === verification.id}
                      >
                        {processing === verification.id ? 'Processing...' : 'Mark Paid'}
                      </Button>
                    )}
                  </div>
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
