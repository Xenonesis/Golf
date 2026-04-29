import { createClient } from '@/lib/supabase/server'
import { CharityCard } from '@/components/charity/charity-card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database.types'

type Charity = Database['public']['Tables']['charities']['Row']

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with filters
  let query = supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)

  // Apply category filter
  if (params.category) {
    query = query.eq('category', params.category)
  }

  // Apply search filter
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data: charities } = await query.order('is_featured', { ascending: false }) as { data: Charity[] | null }

  // Get unique categories for filter
  const categories = ['education', 'health', 'environment', 'sports', 'community', 'other']

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12 max-w-3xl">
          <h1 className="mb-3">Our Charities</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Support these amazing organizations through your subscription
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search charities..."
              defaultValue={params.search}
              className="max-w-md"
              formAction="/charities"
              name="search"
            />
            {params.search && (
              <a href="/charities">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  Clear Search
                </Badge>
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <a href="/charities">
              <Badge 
                variant={!params.category ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                All
              </Badge>
            </a>
            {categories.map((category) => (
              <a
                key={category}
                href={`/charities?category=${category}${params.search ? `&search=${params.search}` : ''}`}
              >
                <Badge
                  variant={params.category === category ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                >
                  {category}
                </Badge>
              </a>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {charities?.length || 0} {charities?.length === 1 ? 'charity' : 'charities'}
          {params.category && ` in ${params.category}`}
          {params.search && ` matching "${params.search}"`}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities && charities.length > 0 ? (
            charities.map((charity) => (
              <CharityCard key={charity.id} charity={charity} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No charities found matching your criteria.</p>
              <a href="/charities" className="text-primary hover:underline mt-2 inline-block">
                View all charities
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
