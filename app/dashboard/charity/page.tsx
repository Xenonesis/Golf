import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CharityCard } from '@/components/charity/charity-card'
import { selectCharity, createCharity } from '@/app/actions/charity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const website_url = formData.get('website_url') as string

    await createCharity({ name, description, category, website_url })
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

      {/* Create New Charity Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Own Charity</CardTitle>
          <CardDescription>Add a new charity to support</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Charity Name *</label>
                <Input id="name" name="name" required placeholder="Enter charity name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category *</label>
                <select
                  id="category"
                  name="category"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="environment">Environment</option>
                  <option value="sports">Sports</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the charity's mission..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="website_url" className="text-sm font-medium">Website URL</label>
              <Input id="website_url" name="website_url" type="url" placeholder="https://example.com" />
            </div>
            <Button type="submit">Create Charity</Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Charities */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Charities</h2>
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
    </div>
  )
}
