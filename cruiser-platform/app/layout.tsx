import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Montserrat } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { PopupBanner } from '@/components/PopupBanner'
import { Providers } from '@/components/Providers'
import { SITE } from '@/lib/constants'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'cruiser parfum',
    'parfum mewah',
    'extrait de parfum',
    'luxury perfume indonesia',
    'eternity parfum',
    'noctis parfum',
    'liberea parfum',
    'cruiser official',
  ],
  authors: [{ name: 'CRUISER', url: SITE.url }],
  creator: 'CRUISER',
  publisher: 'CRUISER',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ['/og-image.jpg'],
    creator: '@cruiserofficial',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen bg-obsidian text-cream font-serif antialiased">
        <Providers>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <PopupBanner />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141414',
                color: '#F5F0E8',
                border: '1px solid rgba(201,168,76,0.2)',
                fontFamily: 'var(--font-montserrat)',
                fontSize: '13px',
              },
            }}
          />
        </ThemeProvider>
        </Providers>
        <Script id="chaport-live-chat" strategy="afterInteractive">
          {`
            (function(w,d,v3){
              w.chaportConfig = { appId: '6a3575a19cf653e38146f3d8' };
              if(w.chaport)return;v3=w.chaport={};v3._q=[];v3._l={};
              v3.q=function(){v3._q.push(arguments)};
              v3.on=function(e,fn){if(!v3._l[e])v3._l[e]=[];v3._l[e].push(fn)};
              var s=d.createElement('script');s.type='text/javascript';s.async=true;
              s.src='https://app.chaport.com/javascripts/insert.js';
              var ss=d.getElementsByTagName('script')[0];ss.parentNode.insertBefore(s,ss)
            })(window, document);
          `}
        </Script>
      </body>
    </html>
  )
}
