import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CharityCard } from '@/components/charity/charity-card'
import { selectCharity } from '@/app/actions/charity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/database.types'

type Charity = Database['public']['Tables']['charities']['Row']
type UserCharitySelection = Database['public']['Tables']['user_charity_selections']['Row']

export default async function CharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all active charities
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false }) as { data: Charity[] | null }

  // Fetch user's current selection
  const { data: currentSelection } = await supabase
    .from('user_charity_selections')
    .select('charity_id')
    .eq('user_id', user.id)
    .single() as { data: UserCharitySelection | null }

  async function handleSelect(charityId: string) {
    'use server'
    await selectCharity(charityId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select Your Charity</h1>
        <p className="text-muted-foreground">Choose where your contribution goes (minimum 10%)</p>
      </div>

      {currentSelection && (
        <Card>
          <CardHeader>
            <CardTitle>Current Selection</CardTitle>
            <CardDescription>You&apos;re currently supporting this charity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {charities?.find(c => c.id === currentSelection.charity_id)?.name || 'Loading...'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities?.map((charity) => (
          <form key={charity.id} action={handleSelect.bind(null, charity.id)}>
            <CharityCard
              charity={charity}
              selected={currentSelection?.charity_id === charity.id}
              onSelect={() => {}}
            />
          </form>
        ))}
      </div>
    </div>
  )
}
