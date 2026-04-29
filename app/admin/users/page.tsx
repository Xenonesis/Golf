import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions (
        status,
        plan
      )
    `)
    .order('created_at', { ascending: false })

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
          <div className="space-y-3">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
