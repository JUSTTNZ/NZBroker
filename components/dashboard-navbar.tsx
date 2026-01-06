"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Moon, Sun, User } from "lucide-react"

export function DashboardNavbar() {
  const [accountType, setAccountType] = useState("demo")
  const [notificationCount, setNotificationCount] = useState(3)
  const [theme, setTheme] = useState("dark")
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("light")
    document.documentElement.classList.toggle("dark")
  }

  const accountBalance = accountType === "demo" ? "$10,000.00" : "$0.00"

  return (
    <>
      <nav className="sticky top-0 z-30 bg-card border-b border-border h-16 px-4 md:px-6 flex items-center justify-between transition-all duration-300">
        
        {/* Left: Empty on mobile, Balance on desktop */}
        <div className="hidden md:block flex-1 min-w-0 animate-fade-in-up">
          <p className="text-sm text-muted-foreground">Account Balance</p>
          <p className="text-2xl font-bold text-foreground font-mono tabular-nums">{accountBalance}</p>
        </div>

        {/* Center: Actions - Show on both mobile & desktop */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 md:flex-none justify-center md:justify-normal">
          {/* Notification Bell */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg hover:bg-background transition-all flex-shrink-0 group active:scale-90"
            aria-label="Notifications"
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
            className="p-2 rounded-lg hover:bg-background transition-all flex-shrink-0 group active:scale-90"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-90 duration-300" />
            )}
          </button>

          {/* Account Switcher Dropdown - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-all cursor-pointer active:scale-95 min-w-[140px]"
              aria-label="Select account type"
            >
              <option value="demo">Demo Account</option>
              <option value="live">Live Account</option>
            </select>
          </div>
        </div>

        {/* Right: User Profile - Show on both mobile & desktop */}
        <div className="flex-1 md:flex-initial flex justify-end">
          <button 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-all flex-shrink-0 group active:scale-90"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User menu"
          >
            {/* Mobile: Show only icon */}
            <div className="md:hidden">
              <User className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            
            {/* Desktop: Show avatar + dropdown */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 group-hover:bg-primary/30 transition-all">
                U
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Profile Dropdown Menu - Desktop Only */}
      {showProfileMenu && (
        <div className="fixed md:absolute md:right-6 md:top-16 z-50 w-full md:w-64 bg-card border border-border md:rounded-lg shadow-lg animate-fade-in-up">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-sm font-bold text-primary">
                U
              </div>
              <div>
                <h3 className="font-bold">User Account</h3>
                <p className="text-xs text-muted-foreground">{accountType === "demo" ? "Demo Account" : "Live Account"}</p>
                <p className="text-sm font-mono mt-1">{accountBalance}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <Link
              href="/dashboard/account"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              Account Settings
            </Link>
            <Link
              href="/dashboard/kyc"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              KYC Verification
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              Settings
            </Link>
          </div>
          <div className="p-2 border-t border-border">
            <button
              onClick={() => {
                localStorage.removeItem("authToken")
                window.location.href = "/"
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  )
}