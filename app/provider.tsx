// app/client-providers.tsx
"use client"

import { ThemeProvider } from "@/lib/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Analytics } from "@vercel/analytics/next"

import { Toaster } from 'sonner'
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    
    <ThemeProvider>
            <Toaster position="top-right" richColors />
      <AuthProvider>
        {children}
        <Analytics />
      </AuthProvider>
    </ThemeProvider>
  )
}