'use client'

import { useState } from 'react'
import { createDonation } from '@/app/actions/donations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DonationFormProps {
  charityId: string
  charityName: string
}

export function DonationForm({ charityId, charityName }: DonationFormProps) {
  const [amount, setAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await createDonation(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.url) {
      // Redirect to Stripe checkout
      window.location.href = result.url
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>
          Support {charityName} with a one-time donation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="charity_id" value={charityId} />
          
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Donation Amount (USD) *
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Leave an encouraging message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              value="true"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_anonymous" className="text-sm">
              Make this donation anonymous
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Donate Now'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by Stripe
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
