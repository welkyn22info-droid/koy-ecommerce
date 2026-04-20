import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'KOY by m&m | Buzos Oversized Anime y Cine — Colombia',
  description: 'Buzos oversized con estampados únicos de anime y cine, bajo demanda. Diseños exclusivos para los verdaderos fans. Envíos a todo Colombia.',
  keywords: ['buzos oversized', 'anime', 'cine', 'KOY', 'streetwear Colombia', 'estampados', 'ropa fandom'],
  openGraph: {
    title: 'KOY by m&m — Buzos Oversized Anime y Cine',
    description: 'Diseños exclusivos de anime y cine en buzos oversized de alta calidad. Envíos a todo Colombia.',
    type: 'website',
    locale: 'es_CO',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
