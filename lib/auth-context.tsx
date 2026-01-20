"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Update interface to match NEW schema
interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "user" | "admin"
  current_plan: "basic" | "pro" | "elite"
  account_type: "demo" | "live"
  demo_balance: number
  live_balance: number
  plan_expires_at: string | null
  kyc_status: "not_started" | "pending" | "under_review" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

interface Wallet {
  id: string
  user_id: string
  account_type: "demo" | "live"
  total_balance: number
  trading_balance: number
  bot_trading_balance: number
  bonus_balance: number
  locked_balance: number
  created_at: string
  updated_at: string
}

interface UserPlan {
  id: string
  user_id: string
  plan: "basic" | "pro" | "elite"
  amount_paid: number
  payment_method: string | null
  status: "active" | "cancelled" | "expired" | "pending"
  starts_at: string
  ends_at: string | null
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  account_type: "demo" | "live"
  type: string
  amount: number
  description: string | null
  status: "pending" | "completed" | "failed"
  created_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  wallets: Wallet[] | null
  userPlans: UserPlan[] | null
  transactions: Transaction[] | null
  currentWallet: Wallet | null
  activePlan: UserPlan | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshAllData: () => Promise<void>  // New function
  switchAccountType: (accountType: "demo" | "live") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [wallets, setWallets] = useState<Wallet[] | null>(null)
  const [userPlans, setUserPlans] = useState<UserPlan[] | null>(null)
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null)
  const [activePlan, setActivePlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)

  // Use ref to store supabase client - prevents re-renders
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Function to fetch ALL user data - memoized with useCallback
  const fetchAllUserData = useCallback(async (userId: string) => {
    try {
      // Fetch all data in parallel for better performance
      const [
        { data: profile, error: profileError },
        { data: userWallets, error: walletsError },
        { data: plans, error: plansError },
        { data: userTransactions, error: transactionsError }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("wallets").select("*").eq("user_id", userId).order("account_type"),
        supabase.from("user_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
      ])

      // Batch state updates to reduce re-renders
      if (!profileError && profile) {
        setUserProfile(profile as UserProfile)
      }

      if (!walletsError && userWallets) {
        setWallets(userWallets as Wallet[])
        const profileAccountType = (profile as UserProfile)?.account_type || "demo"
        const current = userWallets?.find((w: any) => w.account_type === profileAccountType)
        setCurrentWallet(current || userWallets?.[0] || null)
      }

      if (!plansError && plans) {
        setUserPlans(plans as UserPlan[])
        const active = plans?.find((p: any) => p.status === "active")
        setActivePlan(active || null)
      }

      if (!transactionsError && userTransactions) {
        setTransactions(userTransactions as Transaction[])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }, [supabase])

  // Initialize auth and fetch data
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (mounted) {
          setUser(currentUser)
          if (currentUser) {
            fetchAllUserData(currentUser.id)
          }
          setLoading(false)
        }
      } catch (error) {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      setUser(session?.user || null)

      if (session?.user) {
        fetchAllUserData(session.user.id)
      } else {
        // Clear all data when user logs out
        setUserProfile(null)
        setWallets(null)
        setUserPlans(null)
        setTransactions(null)
        setCurrentWallet(null)
        setActivePlan(null)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) throw error
  if (!data.user) throw new Error("User creation failed")

  const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  // 2. Create profile, wallets, and plan in parallel for speed
  await Promise.all([
    supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: "user",
      current_plan: "basic",
      account_type: "demo",
      demo_balance: 10000.00,
      live_balance: 0.00,
      plan_expires_at: planExpiresAt,
    }),
    supabase.from("user_plans").insert({
      user_id: data.user.id,
      plan: "basic",
      amount_paid: 0.00,
      payment_method: "free_trial",
      status: "active",
      starts_at: new Date().toISOString(),
      ends_at: planExpiresAt,
    }),
    supabase.from("wallets").insert([
      {
        user_id: data.user.id,
        account_type: "demo",
        total_balance: 10000.00,
        trading_balance: 5000.00,
        bot_trading_balance: 5000.00,
        bonus_balance: 10000.00,
      },
      {
        user_id: data.user.id,
        account_type: "live",
        total_balance: 0.00,
        trading_balance: 0.00,
        bot_trading_balance: 0.00,
      },
    ]),
    supabase.from("transactions").insert({
      user_id: data.user.id,
      account_type: "demo",
      type: "bonus",
      amount: 10000.00,
      description: "Initial demo account bonus",
      status: "completed",
      reference_id: `BONUS_${data.user.id}_${Date.now()}`,
    }),
  ])

  setUser(data.user)
}, [supabase])

const signIn = useCallback(async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  setUser(data.user)

  if (data.user) {
    // Fetch profile to get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    // Redirect based on role
    if (profile?.role === "admin") {
      window.location.href = "/admin"
    } else {
      window.location.href = "/dashboard"
    }
  }
}, [supabase])

const signOut = useCallback(async () => {
  // Show toast immediately for instant feedback
  toast.success("Signed out successfully!")

  // Clear state immediately for fast UI response
  setUser(null)
  setUserProfile(null)
  setWallets(null)
  setUserPlans(null)
  setTransactions(null)
  setCurrentWallet(null)
  setActivePlan(null)

  // Sign out from Supabase (fire and forget - don't wait)
  supabase.auth.signOut()

  // Redirect to login page
  window.location.href = "/login"
}, [supabase])

const refreshUser = useCallback(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  setUser(currentUser)
  if (currentUser) {
    fetchAllUserData(currentUser.id)
  }
}, [supabase, fetchAllUserData])

const refreshAllData = useCallback(async () => {
  if (user) {
    await fetchAllUserData(user.id)
  }
}, [user, fetchAllUserData])

const switchAccountType = useCallback(async (accountType: "demo" | "live") => {
  if (!user || !userProfile) throw new Error("No user logged in")

  const previousProfile = { ...userProfile }
  const previousWallet = currentWallet

  // Optimistic update - instant UI response
  setUserProfile({ ...userProfile, account_type: accountType })
  const newWallet = wallets?.find(w => w.account_type === accountType)
  setCurrentWallet(newWallet || null)

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ account_type: accountType })
      .eq("id", user.id)

    if (error) throw error
  } catch (error) {
    // Revert on failure
    setUserProfile(previousProfile)
    setCurrentWallet(previousWallet)
    throw error
  }
}, [supabase, user, userProfile, currentWallet, wallets])
// Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    userProfile,
    wallets,
    userPlans,
    transactions,
    currentWallet,
    activePlan,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    refreshAllData,
    switchAccountType,
  }), [
    user,
    userProfile,
    wallets,
    userPlans,
    transactions,
    currentWallet,
    activePlan,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    refreshAllData,
    switchAccountType,
  ])

  return (
    <AuthContext.Provider value={contextValue}>
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