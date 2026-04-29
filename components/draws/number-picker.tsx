'use client'

import { useState } from 'react'
import { participateInDraw } from '@/app/actions/draws'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NumberPicker() {
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

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
    }
  }

  const numbers = Array.from({ length: 50 }, (_, i) => i + 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pick Your Numbers</CardTitle>
        <CardDescription>Select 5 unique numbers (1-50) for this month&apos;s draw</CardDescription>
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

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Selected: {selected.join(', ') || 'None'}</p>
          <p className="text-xs text-muted-foreground">{selected.length}/5 numbers picked</p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
            Successfully entered the draw!
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={selected.length !== 5 || pending}
          className="w-full"
        >
          {pending ? 'Submitting...' : selected.length === 5 ? 'Enter Draw' : 'Pick 5 Numbers'}
        </Button>
      </CardContent>
    </Card>
  )
}
