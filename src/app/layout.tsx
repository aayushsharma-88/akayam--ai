import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#080A0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Akayam AI',
    template: '%s — Akayam AI',
  },
  description:
    'Akayam AI is a universal AI workspace. Chat, generate images, analyze documents, create visualizations, and more — all in one intelligent platform.',
  keywords: ['AI', 'artificial intelligence', 'chat', 'image generation', 'voice AI', 'Akayam'],
  authors: [{ name: 'Akayam AI' }],
  creator: 'Akayam AI',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    title: 'Akayam AI',
    description: 'Universal AI workspace — chat, create, analyze.',
    siteName: 'Akayam AI',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
