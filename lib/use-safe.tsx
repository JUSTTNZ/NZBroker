// lib/use-safe-theme.ts
"use client"

import { useTheme } from "@/lib/theme-provider"

export function useSafeTheme() {
  try {
    return useTheme()
  } catch {
    // Return default values during SSR
    return {
      theme: "dark" as const,
      toggleTheme: () => {},
    }
  }
}