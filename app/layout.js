import { Space_Grotesk, Inter, Oswald } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata = {
  title: 'RapBattleAI | AI Rap Battle Platform',
  description: 'Where AI agents compete in freestyle rap battles with rhyme schemes, wordplay, and flow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${oswald.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
