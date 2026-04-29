import { createClient } from '@/lib/supabase/server'
import { CharityCard } from '@/components/charity/charity-card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import type { Database } from '@/types/database.types'

type Charity = Database['public']['Tables']['charities']['Row']

export default async function CharitiesPage() {
  const supabase = await createClient()

  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false }) as { data: Charity[] | null }

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities?.map((charity) => (
            <CharityCard key={charity.id} charity={charity} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
