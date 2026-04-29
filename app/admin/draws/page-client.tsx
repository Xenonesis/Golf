'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { simulateDraw, publishDraw, createDraw } from '@/app/actions/admin'
import type { Database } from '@/types/database.types'

type MonthlyDraw = Database['public']['Tables']['monthly_draws']['Row']

export default function DrawsPage({ initialDraws }: { initialDraws: MonthlyDraw[] }) {
  const [draws, setDraws] = useState(initialDraws)
  const [simulating, setSimulating] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [simulationResult, setSimulationResult] = useState<{ winningNumbers: number[]; winners: any[] } | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDrawMonth, setNewDrawMonth] = useState('')
  const [newDrawAlgorithm, setNewDrawAlgorithm] = useState<'random' | 'weighted'>('random')
  const [newDrawJackpot, setNewDrawJackpot] = useState(0)

  async function handleSimulate(drawId: string) {
    setSimulating(drawId)
    try {
      const result = await simulateDraw(drawId)
      setSimulationResult(result)
    } catch (error) {
      console.error('Simulation failed:', error)
    }
    setSimulating(null)
  }

  async function handlePublish(drawId: string, winningNumbers: number[]) {
    setPublishing(drawId)
    const result = await publishDraw(drawId, winningNumbers)
    if (result.success) {
      // Refresh draws
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('monthly_draws')
        .select('*')
        .order('draw_month', { ascending: false })
      setDraws(data || [])
      setSimulationResult(null)
    }
    setPublishing(null)
  }

  async function handleCreateDraw() {
    const result = await createDraw(newDrawMonth, newDrawAlgorithm, newDrawJackpot)
    if (result.success) {
      setShowCreateForm(false)
      setNewDrawMonth('')
      setNewDrawAlgorithm('random')
      setNewDrawJackpot(0)
      // Refresh draws
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('monthly_draws')
        .select('*')
        .order('draw_month', { ascending: false })
      setDraws(data || [])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Draw Management</h1>
          <p className="text-muted-foreground">Configure and manage monthly draws</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Draw'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Draw</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Draw Month</label>
              <Input
                type="month"
                value={newDrawMonth}
                onChange={(e) => setNewDrawMonth(e.target.value)}
                placeholder="Select month"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Algorithm</label>
              <select
                className="w-full p-2 border rounded"
                value={newDrawAlgorithm}
                onChange={(e) => setNewDrawAlgorithm(e.target.value as 'random' | 'weighted')}
              >
                <option value="random">Random</option>
                <option value="weighted">Weighted</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Jackpot Amount ($)</label>
              <Input
                type="number"
                value={newDrawJackpot}
                onChange={(e) => setNewDrawJackpot(Number(e.target.value))}
                min="0"
              />
            </div>
            <Button onClick={handleCreateDraw}>Create Draw</Button>
          </CardContent>
        </Card>
      )}

      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>Preview of draw outcome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Winning Numbers:</p>
              <div className="flex gap-2">
                {simulationResult.winningNumbers.map((num) => (
                  <Badge key={num} variant="default" className="text-lg px-3 py-1">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Potential Winners: {simulationResult.winners.length}</p>
              {simulationResult.winners.slice(0, 5).map((winner: any) => (
                <div key={winner.id} className="text-sm text-muted-foreground">
                  {(winner.profiles as any)?.full_name}: {winner.matchCount} matches
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePublish(
                  draws.find(d => d.status === 'draft')?.id || '',
                  simulationResult.winningNumbers
                )}
                disabled={publishing !== null}
              >
                {publishing ? 'Publishing...' : 'Publish These Results'}
              </Button>
              <Button variant="outline" onClick={() => setSimulationResult(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Draws</CardTitle>
          <CardDescription>Monthly draw history and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {draws.map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">Algorithm: {draw.algorithm}</p>
                  <p className="text-sm text-muted-foreground">Jackpot: ${draw.jackpot_amount || 0}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={draw.status === 'published' ? 'success' : draw.status === 'draft' ? 'secondary' : 'outline'}>
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
                  {draw.status === 'draft' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSimulate(draw.id)}
                        disabled={simulating === draw.id}
                      >
                        {simulating === draw.id ? 'Simulating...' : 'Simulate'}
                      </Button>
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
