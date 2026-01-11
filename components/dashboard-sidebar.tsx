"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context" // Import your auth context
import { useRouter,} from "next/navigation"
// Dynamically import icons to reduce initial bundle size
const IconComponents = {
  LayoutDashboard: dynamic(() => import("lucide-react").then(mod => mod.LayoutDashboard), { ssr: false }),
  Copy: dynamic(() => import("lucide-react").then(mod => mod.Copy), { ssr: false }),
  TrendingUp: dynamic(() => import("lucide-react").then(mod => mod.TrendingUp), { ssr: false }),
  Star: dynamic(() => import("lucide-react").then(mod => mod.Star), { ssr: false }),
  User: dynamic(() => import("lucide-react").then(mod => mod.User), { ssr: false }),
  DollarSign: dynamic(() => import("lucide-react").then(mod => mod.DollarSign), { ssr: false }),
  PiggyBank: dynamic(() => import("lucide-react").then(mod => mod.PiggyBank), { ssr: false }),
  Bot: dynamic(() => import("lucide-react").then(mod => mod.Bot), { ssr: false }),
  Share2: dynamic(() => import("lucide-react").then(mod => mod.Share2), { ssr: false }),
  CheckCircle: dynamic(() => import("lucide-react").then(mod => mod.CheckCircle), { ssr: false }),
  Settings: dynamic(() => import("lucide-react").then(mod => mod.Settings), { ssr: false }),
  HelpCircle: dynamic(() => import("lucide-react").then(mod => mod.HelpCircle), { ssr: false }),
  Bell: dynamic(() => import("lucide-react").then(mod => mod.Bell), { ssr: false }),
  ChevronLeft: dynamic(() => import("lucide-react").then(mod => mod.ChevronLeft), { ssr: false }),
  Menu: dynamic(() => import("lucide-react").then(mod => mod.Menu), { ssr: false }),
  X: dynamic(() => import("lucide-react").then(mod => mod.X), { ssr: false }),
  LogOut: dynamic(() => import("lucide-react").then(mod => mod.LogOut), { ssr: false }),
}

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/copy-trading", label: "Copy Trading", icon: "Copy" },
  { href: "/dashboard/stock-trade", label: "Stock Trade", icon: "TrendingUp" },
  { href: "/dashboard/upgrade-plan", label: "Upgrade Plan", icon: "Star" },
  { href: "/dashboard/account", label: "Account", icon: "User" },
  { href: "/dashboard/deposit", label: "Deposit", icon: "DollarSign" },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: "PiggyBank" },
  { href: "/dashboard/analysis-bot", label: "Analysis Bot", icon: "Bot" },
  { href: "/dashboard/referral-program", label: "Referral Program", icon: "Share2" },
  { href: "/dashboard/kyc", label: "KYC", icon: "CheckCircle" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
  { href: "/dashboard/support", label: "Support", icon: "HelpCircle" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
]

// Simple loading fallback for icons
const IconFallback = () => (
  <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
)

export function DashboardSidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
   const router = useRouter()
  // Get signOut from your auth context
  const { signOut, user } = useAuth()

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle responsive behavior - memoized
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setIsMobileOpen(false)
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isSidebar = target.closest('aside')
      const isToggleButton = target.closest('button[aria-label*="menu"]')
      
      if (isMobileOpen && !isSidebar && !isToggleButton) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileOpen])

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut() // Use the signOut from your auth context
      // No need to redirect manually - your auth context should handle this
      // Close mobile sidebar if open
      router.push("/login")
      setIsMobileOpen(false)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <>
        <div className="lg:hidden fixed top-4 left-4 z-[100] p-2 rounded-lg bg-muted animate-pulse">
          <div className="w-5 h-5"></div>
        </div>
        <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border animate-pulse"></aside>
      </>
    )
  }

  return (
    <>
      {/* Mobile toggle button - Minimal */}
      <button
        aria-label="Toggle mobile menu"
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <IconComponents.X className="w-5 h-5" />
        ) : (
          <IconComponents.Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar - Optimized */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-[90] ${
          // Always expanded width on mobile when open
          isMobileOpen || isExpanded ? "w-64" : "w-20"
        } ${
          isMobileOpen 
            ? "translate-x-0 shadow-2xl" 
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header with collapse toggle */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between h-16">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-sidebar-primary truncate">AstralisX</h2>
            <p className="text-xs text-sidebar-foreground/60 truncate">Vault</p>
          </div>
          
          {/* Only show collapse button on desktop when sidebar is expanded */}
          {!isMobileOpen && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 flex-shrink-0 active:scale-90"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <IconComponents.ChevronLeft
                className={`w-5 h-5 text-sidebar-foreground transition-transform duration-300 ${
                  !isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
          
          {/* Show close button on mobile when sidebar is open */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 flex-shrink-0 active:scale-90"
              aria-label="Close sidebar"
            >
              <IconComponents.X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>

        {/* User Info Section - Shows when user is logged in */}
    

        {/* Navigation Links - Optimized */}
        <div className="h-[calc(100vh-128px-80px)] overflow-y-auto">
          <nav className="space-y-1 px-3 py-4">
            {sidebarLinks.map((link) => {
              const IconComponent = IconComponents[link.icon as keyof typeof IconComponents]
              const active = isActive(link.href)
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } justify-start`} // Always justify-start when sidebar is open on mobile
                  onClick={() => setIsMobileOpen(false)} // Close mobile sidebar on link click
                >
                  {IconComponent ? (
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <IconFallback />
                  )}
                  {/* Always show labels when sidebar is open (mobile or expanded) */}
                  <span className="text-sm font-medium truncate">
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sign Out - Fixed at bottom */}
        <div className="absolute bottom-0 pointer left-0 right-0 p-3 border-t border-sidebar-border bg-sidebar">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors justify-start"
            disabled={!user} // Disable if no user is logged in
          >
            <IconComponents.LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay - Only show on mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-[80]"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}