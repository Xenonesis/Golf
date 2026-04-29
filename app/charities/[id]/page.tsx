import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database.types'

// Dynamic import for donation form - only loaded when needed
const DonationForm = dynamic(
  () => import('@/components/charity/donation-form').then((mod) => ({ default: mod.DonationForm })),
  { loading: () => null }
)

type Charity = Database['public']['Tables']['charities']['Row']

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single() as { data: Charity | null }

  if (!charity) {
    notFound()
  }

  // Get count of users supporting this charity
  const { count: supporterCount } = await supabase
    .from('user_charity_selections')
    .select('*', { count: 'exact', head: true })
    .eq('charity_id', id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <a href="/charities" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
            ← Back to all charities
          </a>

          {/* Charity Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{charity.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {charity.category}
                    </Badge>
                    {charity.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed">
                {charity.description || 'No description available.'}
              </p>

              {charity.website_url && (
                <div>
                  <a
                    href={charity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website →
                  </a>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">
                    ${Number(charity.total_donations || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supporters</p>
                  <p className="text-2xl font-bold">{supporterCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>
                  When you select this charity, a portion of your subscription goes directly to support their mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h3 className="font-semibold mb-2">How it works:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Minimum 10% of your subscription goes to this charity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>You can increase your contribution percentage in your dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Your support helps fund their programs and initiatives</span>
                      </li>
                    </ul>
                  </div>

                  <a href="/dashboard/charity">
                    <Button className="w-full">
                      Select This Charity
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Independent Donation Form */}
            <DonationForm charityId={charity.id} charityName={charity.name} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
