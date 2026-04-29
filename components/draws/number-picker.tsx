'use client'

import { useState, useEffect } from 'react'
import { participateInDraw } from '@/app/actions/draws'
import { getCreditData } from '@/app/actions/credits'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins } from 'lucide-react'

export function NumberPicker() {
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const DRAW_ENTRY_COST = 2

  // Fetch current credit balance on mount
  useEffect(() => {
    const fetchCredits = async () => {
      const creditData = await getCreditData()
      if (creditData) {
        setCurrentBalance(creditData.currentBalance)
      }
    }
    fetchCredits()
  }, [])

  function toggleNumber(num: number) {
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num))
    } else if (selected.length < 5) {
      setSelected([...selected, num].sort((a, b) => a - b))
    }
  }

  async function handleSubmit() {
    setPending(true)
    setError(null)
    const result = await participateInDraw(selected)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      setSuccess(true)
      setPending(false)
      setSelected([])
      // Update balance after successful entry
      if (result.remainingCredits !== undefined) {
        setCurrentBalance(result.remainingCredits)
      }
      // Refresh credit data
      const creditData = await getCreditData()
      if (creditData) {
        setCurrentBalance(creditData.currentBalance)
      }
    }
  }

  const numbers = Array.from({ length: 50 }, (_, i) => i + 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pick Your Numbers</CardTitle>
            <CardDescription>Select 5 unique numbers (1-50) for this month's draw</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            {currentBalance} credits
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-2 mb-6">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              disabled={selected.length >= 5 && !selected.includes(num)}
              className={`
                aspect-square rounded-md text-sm font-medium transition-colors
                ${selected.includes(num)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                }
                ${(selected.length >= 5 && !selected.includes(num)) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium mb-2">Selected: {selected.join(', ') || 'None'}</p>
          <p className="text-xs text-muted-foreground">{selected.length}/5 numbers picked</p>
          {selected.length === 5 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Entry cost:</span>
              <Badge variant="secondary" className="font-semibold">
                {DRAW_ENTRY_COST} credits
              </Badge>
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md mb-4 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-md mb-4 border border-green-200 dark:border-green-800">
            Successfully entered the draw! Remaining credits: {currentBalance}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={selected.length !== 5 || pending || currentBalance < DRAW_ENTRY_COST}
          className="w-full"
        >
          {pending ? 'Submitting...' : 
           currentBalance < DRAW_ENTRY_COST ? 'Insufficient Credits' :
           selected.length === 5 ? 'Enter Draw' : 'Pick 5 Numbers'}
        </Button>
        {currentBalance < DRAW_ENTRY_COST && (
          <p className="text-xs text-center mt-2 text-muted-foreground">
            You need {DRAW_ENTRY_COST} credits to enter. <a href="/dashboard/credits" className="text-primary hover:underline">View your credits</a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
