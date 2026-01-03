"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Moon, Sun } from "lucide-react"

export function DashboardNavbar() {
  const [accountType, setAccountType] = useState("demo")
  const [notificationCount, setNotificationCount] = useState(3)
  const [theme, setTheme] = useState("dark")

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("light")
    document.documentElement.classList.toggle("dark")
  }

  const accountBalance = accountType === "demo" ? "$10,000.00" : "$0.00"

  return (
    <nav className="sticky top-0 z-30 bg-card border-b border-border h-auto md:h-16 px-4 md:px-6 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
      {/* Account balance section */}
      <div className="flex-1 min-w-0 animate-fade-in-up">
        <p className="text-xs md:text-sm text-muted-foreground">Account Balance</p>
        <p className="text-xl md:text-2xl font-bold text-foreground font-mono tabular-nums">{accountBalance}</p>
      </div>

      {/* Center - Notifications, Theme Toggle, and Account Switcher */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notification Bell - Now links to notifications page and shows interactive badge */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg hover:bg-background transition-all flex-shrink-0 group active:scale-90"
        >
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
              {notificationCount}
            </span>
          )}
        </Link>

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

        {/* Account Switcher Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm text-foreground hover:border-primary transition-all cursor-pointer active:scale-95"
          >
            <option value="demo">Demo Account</option>
            <option value="live">Live Account</option>
          </select>
        </div>
      </div>

      {/* Right - User Profile */}
      <div className="flex-1 md:flex-initial flex justify-end">
        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-all flex-shrink-0 group active:scale-90">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 group-hover:bg-primary/30 transition-all">
            U
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block group-hover:rotate-180 transition-transform" />
        </button>
      </div>
    </nav>
  )
}
