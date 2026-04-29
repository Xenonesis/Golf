'use client'

import { useState } from 'react'
import { addScore } from '@/app/actions/scores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ScoreForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setSuccess(false)
    const result = await addScore(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      setSuccess(true)
      setPending(false)
      // Reset form
      ;(document.getElementById('score-form') as HTMLFormElement)?.reset()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Score</CardTitle>
        <CardDescription>Enter your Stableford score (1-45)</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="score-form" action={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="score" className="text-sm font-medium">Score *</label>
              <Input
                id="score"
                name="score"
                type="number"
                min="1"
                max="45"
                required
                placeholder="35"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="play_date" className="text-sm font-medium">Date *</label>
              <Input
                id="play_date"
                name="play_date"
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="course_name" className="text-sm font-medium">Course Name *</label>
            <Input
              id="course_name"
              name="course_name"
              type="text"
              required
              placeholder="Augusta National"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Great day on the course..."
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Score added successfully!
            </div>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Adding...' : 'Add Score'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
