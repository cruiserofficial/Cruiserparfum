import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const session = req.auth
  const { pathname, origin } = req.nextUrl

  if (session?.user?.role === 'customer' && session.user.profileComplete === false) {
    const url = new URL('/complete-profile', origin)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    '/((?!api|admin|login|register|complete-profile|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
}
