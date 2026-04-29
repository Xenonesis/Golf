import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedPaths = ['/dashboard', '/scores', '/draws', '/charity', '/billing', '/winnings']
  const adminPaths = ['/admin']

  const pathname = request.nextUrl.pathname

  // Check if accessing protected routes
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  const isAdminPath = adminPaths.some((path) =>
    pathname.startsWith(path)
  )

  // Redirect to login if not authenticated and accessing protected routes
  if (!user && (isProtectedPath || isAdminPath)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Admin-only route protection
  if (isAdminPath && user) {
    // Fetch user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Redirect non-admin users to dashboard or unauthorized page
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
