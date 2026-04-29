import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database.types'

type MonthlyDraw = Database['public']['Tables']['monthly_draws']['Row']

export default async function DrawsPage() {
  const supabase = await createClient()

  const { data: draws } = await supabase
    .from('monthly_draws')
    .select('*')
    .order('draw_month', { ascending: false }) as { data: MonthlyDraw[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Draw Management</h1>
        <p className="text-muted-foreground">Configure and manage monthly draws</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Draws</CardTitle>
          <CardDescription>Monthly draw history and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {draws?.map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">Algorithm: {draw.algorithm}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={draw.status === 'published' ? 'success' : 'secondary'}>
                    {draw.status}
                  </Badge>
                  {draw.winning_numbers && (
                    <div className="flex gap-1">
                      {draw.winning_numbers.map((num: number) => (
                        <span key={num} className="px-2 py-1 bg-muted rounded text-xs">
                          {num}
                        </span>
                      ))}
                    </div>
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
