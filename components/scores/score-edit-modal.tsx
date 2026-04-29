'use client'

import { useState } from 'react'
import { updateScore } from '@/app/actions/scores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ScoreEditModalProps {
  score: {
    id: string
    score: number
    play_date: string
    course_name: string | null
    notes?: string | null
  }
  onClose: () => void
  onSuccess: () => void
}

export function ScoreEditModal({ score, onClose, onSuccess }: ScoreEditModalProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    
    const result = await updateScore(score.id, formData)
    
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      onSuccess()
      setPending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Score</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="score" className="text-sm font-medium">Score *</label>
            <Input
              id="score"
              name="score"
              type="number"
              min="1"
              max="45"
              defaultValue={score.score}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="play_date" className="text-sm font-medium">Date *</label>
            <Input
              id="play_date"
              name="play_date"
              type="date"
              defaultValue={score.play_date}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="course_name" className="text-sm font-medium">Course Name *</label>
            <Input
              id="course_name"
              name="course_name"
              defaultValue={score.course_name || ''}
              required
              placeholder="Enter course name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
            <Input
              id="notes"
              name="notes"
              defaultValue={score.notes || ''}
              placeholder="Any additional notes"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
