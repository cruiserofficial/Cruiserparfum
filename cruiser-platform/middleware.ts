import { NextResponse } from 'next/server'
import { auth } from '@/auth'

let maintenanceCache: { value: boolean; expiresAt: number } | null = null

async function isMaintenanceOn(origin: string): Promise<boolean> {
  if (maintenanceCache && maintenanceCache.expiresAt > Date.now()) {
    return maintenanceCache.value
  }
  try {
    const res = await fetch(new URL('/api/site-status', origin), { cache: 'no-store' })
    const data = await res.json() as { maintenanceMode?: boolean }
    const value = data.maintenanceMode === true
    maintenanceCache = { value, expiresAt: Date.now() + 10_000 }
    return value
  } catch {
    return maintenanceCache?.value ?? false
  }
}

export default auth(async (req) => {
  const session = req.auth
  const { pathname, origin } = req.nextUrl

  if (session?.user?.role === 'customer' && session.user.profileComplete === false) {
    const url = new URL('/complete-profile', origin)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (session?.user?.role !== 'admin' && await isMaintenanceOn(origin)) {
    return NextResponse.redirect(new URL('/maintenance', origin))
  }
})

export const config = {
  matcher: [
    '/((?!api|admin|login|register|complete-profile|maintenance|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
}
