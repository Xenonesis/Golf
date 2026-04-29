import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database.types'

type Charity = Database['public']['Tables']['charities']['Row']

export default async function AdminCharitiesPage() {
  const supabase = await createClient()

  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false }) as { data: Charity[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Charity Management</h1>
        <p className="text-muted-foreground">Manage available charities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Charities</CardTitle>
          <CardDescription>{charities?.length || 0} charities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {charities?.map((charity) => (
              <div key={charity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{charity.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{charity.category}</p>
                </div>
                <div className="flex gap-2">
                  {charity.is_featured && <Badge variant="secondary">Featured</Badge>}
                  <Badge variant={charity.is_active ? 'success' : 'outline'}>
                    {charity.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
