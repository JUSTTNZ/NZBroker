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
  current_plan: "basic" | "pro" | "elite"
  account_type: "demo" | "live"
  demo_balance: number
  live_balance: number
  plan_expires_at: string | null
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
  const supabase = createClient()

  // Function to fetch ALL user data
  const fetchAllUserData = async (userId: string) => {
    try {
      console.log("📊 [AuthContext] Fetching ALL data for user:", userId)
      
      // Fetch all data in parallel for better performance
      const [
        { data: profile, error: profileError },
        { data: userWallets, error: walletsError },
        { data: plans, error: plansError },
        { data: userTransactions, error: transactionsError }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("wallets").select("*").eq("user_id", userId).order("account_type"),
        supabase.from("user_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
      ])

      // Set profile
      if (profileError) {
        console.error("❌ [AuthContext] Profile fetch error:", profileError)
        setUserProfile(null)
      } else {
        console.log("✅ [AuthContext] Profile loaded")
        setUserProfile(profile as UserProfile)
      }

      // Set wallets
      if (walletsError) {
        console.error("❌ [AuthContext] Wallets fetch error:", walletsError)
        setWallets(null)
        setCurrentWallet(null)
      } else {
        console.log("✅ [AuthContext] Wallets loaded:", userWallets?.length || 0)
        setWallets(userWallets as Wallet[])
        
        // Set current wallet based on user's account_type
        const profileAccountType = (profile as UserProfile)?.account_type || "demo"
        const current = userWallets?.find((w: any) => w.account_type === profileAccountType)
        setCurrentWallet(current || userWallets?.[0] || null)
      }

      // Set user plans
      if (plansError) {
        console.error("❌ [AuthContext] Plans fetch error:", plansError)
        setUserPlans(null)
        setActivePlan(null)
      } else {
        console.log("✅ [AuthContext] Plans loaded:", plans?.length || 0)
        setUserPlans(plans as UserPlan[])
        
        // Find active plan
        const active = plans?.find((p: any) => p.status === "active")
        setActivePlan(active || null)
      }

      // Set transactions
      if (transactionsError) {
        console.error("❌ [AuthContext] Transactions fetch error:", transactionsError)
        setTransactions(null)
      } else {
        console.log("✅ [AuthContext] Transactions loaded:", userTransactions?.length || 0)
        setTransactions(userTransactions as Transaction[])
      }

    } catch (error) {
      console.error("💥 [AuthContext] Error fetching all user data:", error)
    }
  }

  // Initialize auth and fetch data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 [AuthContext] Initializing auth...")
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error("❌ [AuthContext] User fetch error:", userError)
        } else {
          console.log("👤 [AuthContext] User found:", currentUser?.id)
          setUser(currentUser)

          if (currentUser) {
            await fetchAllUserData(currentUser.id)
          }
        }
      } catch (error) {
        console.error("[AuthContext] Initialization error:", error)
      } finally {
        setLoading(false)
        console.log("✅ [AuthContext] Auth initialization complete")
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 [AuthContext] Auth state changed:", event, session?.user?.id)
      
      setUser(session?.user || null)

      if (session?.user) {
        await fetchAllUserData(session.user.id)
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
    // FIRST: Directly fetch the profile to get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    console.log("👤 User role:", profile?.role)
    
    // THEN: Redirect based on role
    if (profile?.role === "admin") {
      console.log("👑 Redirecting admin to /admin")
      window.location.href = "/admin"
    } else {
      console.log("👤 Redirecting user to /dashboard")
      window.location.href = "/dashboard"
    }
    
    // Optional: Fetch the rest of the data in background
    fetchAllUserData(data.user.id).then(() => {
      console.log("✅ Background data fetch complete")
    })
  }
}

const signOut = async () => {
  console.log("🚪 [AuthContext] Signing out...")
  
  // Clear state FIRST
  setUser(null)
  setUserProfile(null)
  setWallets(null)
  setUserPlans(null)
  setTransactions(null)
  setCurrentWallet(null)
  setActivePlan(null)
  
  // Then sign out from Supabase
  await supabase.auth.signOut()
  
  console.log("✅ [AuthContext] Sign out complete")
}

  const refreshUser = async () => {
    console.log("🔄 [AuthContext] Refreshing user...")
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      await fetchAllUserData(currentUser.id)
    }
  }

  const refreshAllData = async () => {
    if (user) {
      console.log("🔄 [AuthContext] Refreshing ALL data...")
      await fetchAllUserData(user.id)
    }
  }

const switchAccountType = async (accountType: "demo" | "live") => {
  if (!user || !userProfile) throw new Error("No user logged in")
  
  console.log("⚡ [AuthContext] FAST switching to:", accountType)
  
  // OPTIMIZATION: Save current state in case we need to revert
  const previousAccountType = userProfile.account_type
  const previousProfile = { ...userProfile }
  const previousWallet = currentWallet
  
  // OPTIMIZATION 1: Update UI INSTANTLY (optimistic update)
  const updatedProfile = { 
    ...userProfile, 
    account_type: accountType
  }
  setUserProfile(updatedProfile)
  
  // OPTIMIZATION 2: Find and set new wallet instantly
  const newWallet = wallets?.find(w => w.account_type === accountType)
  setCurrentWallet(newWallet || null)
  
  console.log("⚡ [AuthContext] UI updated instantly!")
  
  try {
    // OPTIMIZATION 3: Try database update with retry logic
    const { error } = await supabase
      .from("profiles")
      .update({ account_type: accountType })
      .eq("id", user.id)

    if (error) {
      console.error("❌ [AuthContext] Database update failed:", error)
      
      // Check if it's the constraint error
      if (error.message?.includes("demo_only_for_demo_accounts")) {
        console.log("🔄 [AuthContext] Removing constraint and retrying...")
        
        // Option 1: Remove constraint via SQL (one-time fix)
        // Run this in Supabase: ALTER TABLE profiles DROP CONSTRAINT IF EXISTS demo_only_for_demo_accounts;
        
        // Option 2: Update with proper values
        const fixData: any = { account_type: accountType }
        if (accountType === "live") {
          fixData.demo_balance = 0 // Set demo balance to 0 for live accounts
        }
        
        const { error: retryError } = await supabase
          .from("profiles")
          .update(fixData)
          .eq("id", user.id)
          
        if (retryError) {
          throw new Error(`Failed even after fix: ${retryError.message}`)
        }
        
        console.log("✅ [AuthContext] Fixed and switched!")
      } else {
        throw error
      }
    }
    
    console.log("✅ [AuthContext] Database updated successfully")
    
  } catch (error) {
    console.error("💥 [AuthContext] Switch completely failed:", error)
    
    // REVERT: Go back to previous state
    setUserProfile(previousProfile)
    setCurrentWallet(previousWallet)
    
    // Show user-friendly error
    if (error instanceof Error) {
      if (error.message.includes("demo_only_for_demo_accounts")) {
        throw new Error("Cannot switch to Live account because demo balance is not zero. Please contact support.")
      }
    }
    
    throw error
  }
}
  return (
    <AuthContext.Provider
      value={{
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