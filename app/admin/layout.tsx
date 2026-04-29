import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check admin role
  const { data: profile }: { data: any } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Admin Sidebar */}
          <aside className="w-64 space-y-1">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="w-full justify-start">Users</Button>
            </Link>
            <Link href="/admin/draws">
              <Button variant="ghost" size="sm" className="w-full justify-start">Draws</Button>
            </Link>
            <Link href="/admin/charities">
              <Button variant="ghost" size="sm" className="w-full justify-start">Charities</Button>
            </Link>
            <Link href="/admin/winners">
              <Button variant="ghost" size="sm" className="w-full justify-start">Winners</Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm" className="w-full justify-start">Analytics</Button>
            </Link>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
