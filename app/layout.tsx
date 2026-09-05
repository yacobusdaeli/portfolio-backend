import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin — Portfolio Backend',
  description: 'Portfolio Projects Admin Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
