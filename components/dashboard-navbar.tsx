"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Moon, Sun, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

export function DashboardNavbar() {
  const { 
    user, 
    userProfile, 
    currentWallet, 
    activePlan, 
    switchAccountType,
    signOut 
  } = useAuth()
  
  const [notificationCount, setNotificationCount] = useState(0)
  const [theme, setTheme] = useState("dark")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false)

  const supabase = createClient()

  // Fetch unread notification count
  useEffect(() => {
    if (!user) {
      setNotificationCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        // Using count query with your exact database structure
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false)  // Your column is 'read' (boolean)

        if (error) {
          console.error("Error fetching notification count:", error)
          return
        }

        console.log("📊 Unread notifications count:", count)
        setNotificationCount(count || 0)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchUnreadCount()

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("🔔 Notification change detected:", payload)
          // Refresh notification count when notifications change
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("light")
    document.documentElement.classList.toggle("dark")
  }

  const handleAccountSwitch = async (accountType: "demo" | "live") => {
    if (!userProfile || userProfile.account_type === accountType) return
    
    setIsSwitchingAccount(true)
    try {
      await switchAccountType(accountType)
      console.log("✅ Account switched to:", accountType)
    } catch (error) {
      console.error("❌ Failed to switch account:", error)
    } finally {
      setIsSwitchingAccount(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowProfileMenu(false)
    } catch (error) {
      console.error("❌ Sign out failed:", error)
    }
  }

  // Calculate real balance
  const accountBalance = currentWallet 
    ? `$${currentWallet.total_balance.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`
    : "$0.00"

  // Get user initials
  const getUserInitials = () => {
    if (!userProfile?.full_name) return "U"
    return userProfile.full_name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Mark all notifications as read when clicking bell
  const handleBellClick = async (e: React.MouseEvent) => {
    if (notificationCount > 0) {
      try {
        // Mark all as read in database
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user!.id)
          .eq("read", false)

        if (error) {
          console.error("Error marking notifications as read:", error)
          return
        }

        // Update local state
        setNotificationCount(0)
        console.log("✅ All notifications marked as read")
      } catch (error) {
        console.error("Error:", error)
      }
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-30 bg-card border-b border-border h-16 px-4 md:px-6 flex items-center transition-all duration-300">
        
        {/* Left side - Hidden on mobile, shows balance on desktop */}
        <div className="hidden md:block flex-1">
          <p className="text-sm text-muted-foreground">Account Balance</p>
          <p className="text-2xl font-bold text-foreground font-mono tabular-nums">
            { accountBalance}
          </p>
        </div>

        {/* Center - Account Switcher */}
        <div className="flex-1 md:flex-none hidden ">
          <div className="flex items-center justify-center">
            <select
              value={userProfile?.account_type || "demo"}
              onChange={(e) => handleAccountSwitch(e.target.value as "demo" | "live")}
              disabled={isSwitchingAccount || !userProfile}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-all cursor-pointer min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select account type"
            >
              <option value="demo">Demo Account</option>
              <option value="live">Live Account</option>
            </select>
          </div>
        </div>

        {/* Right side - ALL controls grouped together */}
        <div className="flex items-center gap-2 md:gap-4 justify-end flex-1">
          
          {/* Account Balance - Mobile only */}
          <div className="hidden text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold font-mono">
              {accountBalance}
            </p>
          </div>

          {/* Notification Bell with real count */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg hover:bg-background transition-all flex-shrink-0"
            aria-label={`${notificationCount} unread notifications`}
            onClick={handleBellClick}
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-background transition-all flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>

          {/* User Profile */}
          <button 
            className="flex items-center gap-1 md:gap-2 p-2 rounded-lg hover:bg-background transition-all flex-shrink-0"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            disabled={!user}
            aria-label="User menu"
          >
            <div className="md:hidden">
              <User className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-sm font-bold text-primary">
                {getUserInitials()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-none">
                  {userProfile?.full_name || user?.email?.split('@')[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userProfile?.account_type || "demo"}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Profile Dropdown Menu */}
      {showProfileMenu && user && (
        <>
          <div className="fixed md:absolute md:right-6 md:top-16 z-50 w-full md:w-72 bg-card border border-border shadow-lg rounded-lg">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-lg font-bold text-primary">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">{userProfile?.full_name || "User"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize">
                      {userProfile?.account_type || "demo"}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500 capitalize">
                      {userProfile?.current_plan || "basic"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Balance Info */}
              <div className="mt-4 p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-xl font-bold font-mono">{accountBalance}</p>
                  </div>
                  {currentWallet && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Trading</p>
                      <p className="text-sm font-mono">
                        ${currentWallet.trading_balance.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {activePlan && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Plan active until {new Date(activePlan.ends_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-2">
              <Link 
                href="/dashboard/account" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                <span>Account Settings</span>
              </Link>
              <Link 
                href="/dashboard/kyc" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="w-4 h-4 text-center">✓</span>
                <span>KYC Verification</span>
              </Link>
              <Link 
                href="/dashboard/notifications" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="ml-auto bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <span className="w-4 h-4 text-center">⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
            
            <div className="p-2 border-t border-border">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowProfileMenu(false)}
          />
        </>
      )}
    </>
  )
}