"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

// Update interface to match NEW schema
interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "user" | "admin"
  current_plan: "basic" | "pro" | "elite"  // Changed from "plan"
  account_type: "demo" | "live"            // NEW field
  demo_balance: number                     // NEW field
  live_balance: number                     // NEW field
  plan_expires_at: string | null           // NEW field
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          setUserProfile(profile as UserProfile)
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setUserProfile(profile as UserProfile)
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  const signUp = async (email: string, password: string, fullName: string) => {
  console.log("🔵 [AuthContext] Starting signup...")
  
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error("❌ [AuthContext] Auth error:", error)
    throw error
  }

  if (!data.user) {
    console.error("❌ [AuthContext] No user created")
    throw new Error("User creation failed")
  }

  console.log("✅ [AuthContext] Auth user created:", data.user.id)

  // 2. Create profile with NEW schema
  console.log("🔄 [AuthContext] Creating profile...")
  const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      email,
      full_name: fullName,
      role: "user",
      current_plan: "basic",
      account_type: "demo",
      demo_balance: 10000.00,
      live_balance: 0.00,
      plan_expires_at: planExpiresAt, // Set expiry date
    },
  ])

  if (profileError) {
    console.error("❌ [AuthContext] Profile error:", profileError)
    throw profileError
  }

  console.log("✅ [AuthContext] Profile created")

  // 3. Create user_plan record
  console.log("🔄 [AuthContext] Creating user plan record...")
  const { error: planError } = await supabase.from("user_plans").insert([
    {
      user_id: data.user.id,
      plan: "basic",
      amount_paid: 0.00,
      payment_method: "free_trial",
      status: "active",
      starts_at: new Date().toISOString(),
      ends_at: planExpiresAt,
    },
  ])

  if (planError) {
    console.error("❌ [AuthContext] User plan error:", planError)
    // Don't throw - just log this error
  } else {
    console.log("✅ [AuthContext] User plan created")
  }

  // 4. Create wallets
  console.log("🔄 [AuthContext] Creating wallets...")
  const { error: demoWalletError } = await supabase.from("wallets").insert([
    {
      user_id: data.user.id,
      account_type: "demo",
      total_balance: 10000.00,
      trading_balance: 5000.00,
      bot_trading_balance: 5000.00,
      bonus_balance: 10000.00,
    },
  ])

  const { error: liveWalletError } = await supabase.from("wallets").insert([
    {
      user_id: data.user.id,
      account_type: "live",
      total_balance: 0.00,
      trading_balance: 0.00,
      bot_trading_balance: 0.00,
    },
  ])

  if (demoWalletError || liveWalletError) {
    console.error("❌ [AuthContext] Wallet errors:", { demoWalletError, liveWalletError })
  } else {
    console.log("✅ [AuthContext] Wallets created")
  }

  // 5. Record bonus transaction
  console.log("🔄 [AuthContext] Recording bonus transaction...")
  const { error: transactionError } = await supabase.from("transactions").insert([
    {
      user_id: data.user.id,
      account_type: "demo",
      type: "bonus",
      amount: 10000.00,
      description: "Initial demo account bonus",
      status: "completed",
      reference_id: `BONUS_${data.user.id}_${Date.now()}`,
    },
  ])

  if (transactionError) {
    console.error("❌ [AuthContext] Transaction error:", transactionError)
  } else {
    console.log("✅ [AuthContext] Bonus transaction recorded")
  }

  // 6. Update state
  setUser(data.user)
  
  // 7. Fetch the created profile
  setTimeout(() => {
    console.log("🔄 [AuthContext] Fetching created profile...")
    refreshUser()
  }, 500)

  console.log("🎉 [AuthContext] Signup completed successfully")
}

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    setUser(data.user)

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()
      setUserProfile(profile as UserProfile)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const refreshUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setUserProfile(profile as UserProfile)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}