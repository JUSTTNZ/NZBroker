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
      <nav className="sticky top-0 z-30 bg-card border-b border-border h-16 px-4 md:px-6 flex items-center transition-all duration-300">
        
        {/* Left side - Hidden on mobile, shows balance on desktop */}
        <div className="hidden md:block flex-1">
          <p className="text-sm text-muted-foreground">Account Balance</p>
          <p className="text-2xl font-bold text-foreground font-mono tabular-nums">{accountBalance}</p>
        </div>

        {/* Center - Empty on mobile, Account Switcher on desktop */}
        <div className="flex-1 md:flex-none">
          <div className="hidden md:flex items-center justify-center">
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-all cursor-pointer min-w-[140px]"
              aria-label="Select account type"
            >
              <option value="demo">Demo Account</option>
              <option value="live">Live Account</option>
            </select>
          </div>
        </div>

        {/* Right side - ALL controls grouped together */}
        <div className="flex items-center gap-2 md:gap-4 justify-end flex-1">
          
          {/* Account Switcher - Mobile only (compact) */}
          <div className="md:hidden">
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground hover:border-primary transition-all cursor-pointer"
              aria-label="Account type"
            >
              <option value="demo">Demo</option>
              <option value="live">Live</option>
            </select>
          </div>

          {/* Notification Bell */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg hover:bg-background transition-all flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold">
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
            aria-label="User menu"
          >
            <div className="md:hidden">
              <User className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-sm font-bold text-primary">
                U
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <>
          <div className="fixed md:absolute md:right-6 md:top-16 z-50 w-full md:w-64 bg-card border border-border shadow-lg">
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
              <Link href="/dashboard/account" className="block px-3 py-2 rounded-lg hover:bg-background" onClick={() => setShowProfileMenu(false)}>
                Account Settings
              </Link>
              <Link href="/dashboard/kyc" className="block px-3 py-2 rounded-lg hover:bg-background" onClick={() => setShowProfileMenu(false)}>
                KYC Verification
              </Link>
              <Link href="/dashboard/settings" className="block px-3 py-2 rounded-lg hover:bg-background" onClick={() => setShowProfileMenu(false)}>
                Settings
              </Link>
            </div>
            <div className="p-2 border-t border-border">
              <button
                onClick={() => {
                  localStorage.removeItem("authToken")
                  window.location.href = "/"
                }}
                className="w-full px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div 
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowProfileMenu(false)}
          />
        </>
      )}
    </>
  )
}