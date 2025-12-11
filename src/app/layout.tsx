import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700"] })
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"] })

export const metadata: Metadata = {
  title: "HUSC CODECAMP - Lucky Draw",
  description: "Modern Web3 Lucky Wheel with cyberpunk aesthetics",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} antialiased bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
