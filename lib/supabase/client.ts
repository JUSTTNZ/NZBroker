import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Custom storage that uses localStorage for persistence across sessions
const localStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(key)
  },
}

// Singleton pattern - only create one client instance
let supabaseClient: SupabaseClient | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: localStorageAdapter,
        storageKey: 'supabase-auth-token',
        flowType: 'pkce',
      },
    }
  )

  return supabaseClient
}

// Export a pre-created client for direct imports
export const supabase = typeof window !== "undefined" ? createClient() : null
