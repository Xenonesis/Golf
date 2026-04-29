import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDonations } from '@/app/actions/donations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DonationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getUserDonations()
  
  if (result?.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Donations</h1>
          <p className="text-muted-foreground">View your donation history</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-red-600">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const donations = result?.donations || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Donations</h1>
        <p className="text-muted-foreground">View your donation history and impact</p>
      </div>

      {donations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Donations Yet</CardTitle>
            <CardDescription>
              You haven&apos;t made any donations yet. Browse charities to make a difference!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/charities" className="text-primary hover:underline">
              Browse Charities →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {donations.map((donation: any) => (
            <Card key={donation.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {donation.charities?.name || 'Unknown Charity'}
                    </CardTitle>
                    <CardDescription>
                      {new Date(donation.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      donation.status === 'completed'
                        ? 'success'
                        : donation.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {donation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold">
                      ${Number(donation.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">
                      {donation.charities?.category || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">
                      {donation.is_anonymous ? 'Anonymous' : 'Named'}
                    </p>
                  </div>
                </div>
                {donation.message && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Your Message:</p>
                    <p className="text-sm italic">&quot;{donation.message}&quot;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
