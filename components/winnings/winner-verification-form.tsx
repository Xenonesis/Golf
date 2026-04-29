'use client'

import { useState } from 'react'
import { submitWinnerVerification } from '@/app/actions/winners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface WinnerVerificationFormProps {
  participantId: string
}

export function WinnerVerificationForm({ participantId }: WinnerVerificationFormProps) {
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!proofImage) {
      setError('Please upload proof of your win')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('participant_id', participantId)
    formData.append('proof_image', proofImage)

    const result = await submitWinnerVerification(formData)
    
    if (result?.error) {
      setError(result.error)
      setUploading(false)
    } else {
      setSuccess(true)
      setUploading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✓ Verification submitted successfully! An admin will review your submission.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="proof_image">Upload Proof of Win</Label>
        <Input
          id="proof_image"
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setProofImage(e.target.files?.[0] || null)}
          disabled={uploading}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload a screenshot or photo showing your win (e.g., scorecard, certificate)
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={uploading || !proofImage} className="w-full">
        {uploading ? 'Uploading...' : 'Submit Verification'}
      </Button>
    </form>
  )
}
