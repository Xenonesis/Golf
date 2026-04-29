'use client'

import { useState } from 'react'
import { deleteScore } from '@/app/actions/scores'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Score {
  id: string
  score: number
  play_date: string
  course_name: string | null
}

interface ScoreListProps {
  scores: Score[]
}

export function ScoreList({ scores }: ScoreListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteScore(id)
    setDeleting(null)
  }

  if (!scores || scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Scores</CardTitle>
          <CardDescription>No scores yet. Add your first score above!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Scores ({scores.length}/5)</CardTitle>
        <CardDescription>Your last 5 Stableford scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-lg px-3 py-1">
                  {score.score}
                </Badge>
                <div>
                  <p className="font-medium">{score.course_name || 'Unknown Course'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(score.play_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(score.id)}
                disabled={deleting === score.id}
              >
                {deleting === score.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ))}
        </div>
        {scores.length >= 5 && (
          <p className="text-sm text-muted-foreground mt-4 p-3 bg-yellow-50 rounded-md">
            Note: You've reached the maximum of 5 scores. Adding a new score will replace the oldest one.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
