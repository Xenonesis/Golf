'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateUserRole, updateUserSubscription, deleteUserScore } from '@/app/actions/admin'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  subscriptions?: Database['public']['Tables']['subscriptions']['Row'][] | null
  golf_scores?: Database['public']['Tables']['golf_scores']['Row'][] | null
}

export default function UsersPage({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleUpdateRole(userId: string, newRole: string) {
    setProcessing(userId)
    const result = await updateUserRole(userId, newRole as any)
    if (result.success) {
      // Refresh users
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          subscriptions (status, plan),
          golf_scores (*)
        `)
        .order('created_at', { ascending: false })
      setUsers(data || [])
    }
    setProcessing(null)
  }

  async function handleUpdateSubscription(userId: string, status: string) {
    setProcessing(userId)
    const result = await updateUserSubscription(userId, status as any)
    if (result.success) {
      // Refresh users
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          subscriptions (status, plan),
          golf_scores (*)
        `)
        .order('created_at', { ascending: false })
      setUsers(data || [])
    }
    setProcessing(null)
  }

  async function handleDeleteScore(scoreId: string) {
    if (!confirm('Are you sure you want to delete this score?')) return
    
    const result = await deleteUserScore(scoreId)
    if (result.success) {
      // Refresh users
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          subscriptions (status, plan),
          golf_scores (*)
        `)
        .order('created_at', { ascending: false })
      setUsers(data || [])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users?.length || 0} total users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    {user.subscriptions && user.subscriptions.length > 0 ? (
                      <Badge variant={(user.subscriptions[0] as any)?.status === 'active' ? 'success' : 'secondary'}>
                        {(user.subscriptions[0] as any)?.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No subscription</Badge>
                    )}
                  </div>
                </div>

                {/* Role Management */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Button 
                    size="sm" 
                    variant={user.role === 'admin' ? 'default' : 'outline'}
                    disabled={processing === user.id || user.role === 'admin'}
                    onClick={() => handleUpdateRole(user.id, 'admin')}
                  >
                    Admin
                  </Button>
                  <Button 
                    size="sm" 
                    variant={user.role === 'subscriber' ? 'default' : 'outline'}
                    disabled={processing === user.id || user.role === 'subscriber'}
                    onClick={() => handleUpdateRole(user.id, 'subscriber')}
                  >
                    Subscriber
                  </Button>
                  <Button 
                    size="sm" 
                    variant={user.role === 'public' ? 'default' : 'outline'}
                    disabled={processing === user.id || user.role === 'public'}
                    onClick={() => handleUpdateRole(user.id, 'public')}
                  >
                    Public
                  </Button>
                </div>

                {/* Subscription Management */}
                {user.subscriptions && user.subscriptions.length > 0 && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Subscription:</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={processing === user.id}
                      onClick={() => handleUpdateSubscription(user.id, 'active')}
                    >
                      Active
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={processing === user.id}
                      onClick={() => handleUpdateSubscription(user.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Golf Scores */}
                {user.golf_scores && user.golf_scores.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Golf Scores ({user.golf_scores.length}):</p>
                    <div className="space-y-1">
                      {user.golf_scores.map((score: any) => (
                        <div key={score.id} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span>{score.score} - {new Date(score.play_date).toLocaleDateString()} {score.course_name && `(${score.course_name})`}</span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={processing === user.id}
                            onClick={() => handleDeleteScore(score.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
