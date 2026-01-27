"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context" // Import your auth context
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  { href: "/dashboard/stock-trade", label: "Trade", icon: "TrendingUp" },
  { href: "/dashboard/upgrade-plan", label: "Upgrade Plan", icon: "Star" },
  { href: "/dashboard/account", label: "Account", icon: "User" },
  { href: "/dashboard/deposit", label: "Deposit", icon: "DollarSign" },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: "PiggyBank" },
  { href: "/dashboard/analysis-bot", label: "AI Trading Bot", icon: "Bot" },
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
  const [notificationCount, setNotificationCount] = useState(0)
  const [supportTicketCount, setSupportTicketCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  // Get signOut from your auth context
  const { signOut, user } = useAuth()
  const supabase = createClient()

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

  // Fetch notification and support ticket counts
  useEffect(() => {
    if (!user) {
      setNotificationCount(0)
      setSupportTicketCount(0)
      return
    }

    const fetchCounts = async () => {
      try {
        // Fetch unread notifications count
        const { count: notifCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false)

        setNotificationCount(notifCount || 0)

        // Fetch open support tickets count (tickets with responses)
        const { count: ticketCount } = await supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["in_progress", "open"])

        setSupportTicketCount(ticketCount || 0)
      } catch (error) {
        console.error("Error fetching sidebar counts:", error)
      }
    }

    fetchCounts()

    // Set up real-time subscription for notifications
    const notifChannel = supabase
      .channel('sidebar-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCounts()
        }
      )
      .subscribe()

    // Set up real-time subscription for support tickets
    const ticketChannel = supabase
      .channel('sidebar-support-tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notifChannel)
      supabase.removeChannel(ticketChannel)
    }
  }, [user, supabase])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  // Handle click on sidebar links - clear counts immediately for better UX
  const handleLinkClick = (href: string) => {
    setIsMobileOpen(false)

    // Immediately clear counts when user clicks on the link
    if (href === "/dashboard/notifications") {
      setNotificationCount(0)
    } else if (href === "/dashboard/support") {
      setSupportTicketCount(0)
    }
  }

  // Handle sign out - fast, no awaiting
  const handleSignOut = () => {
    setIsMobileOpen(false)
    signOut() // signOut handles redirect internally
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
{!isMobileOpen && (
  <button
    aria-label="Toggle mobile menu"
    className="lg:hidden fixed top-4 left-4 z-[100] p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform"
    onClick={() => setIsMobileOpen(!isMobileOpen)}
  >
    <IconComponents.Menu className="w-5 h-5" />
  </button>
)}

      {/* Sidebar - Optimized */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-[90] flex flex-col overflow-hidden ${
          // Always expanded width on mobile when open
          isMobileOpen || isExpanded ? "w-64" : "w-20"
        } ${
          isMobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header with collapse toggle */}
        <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-sidebar-primary truncate">Barcrest</h2>
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

        {/* Navigation Links - Optimized */}
        <div className="flex-1 flex flex-col">
          <nav className="flex-1 px-3 py-2">
            {sidebarLinks.map((link) => {
              const IconComponent = IconComponents[link.icon as keyof typeof IconComponents]
              const active = isActive(link.href)

              // Get count for specific links
              const getCountForLink = (href: string) => {
                if (href === "/dashboard/notifications") return notificationCount
                if (href === "/dashboard/support") return supportTicketCount
                return 0
              }
              const count = getCountForLink(link.href)

              // Only show count badge when sidebar is visible (expanded on desktop or open on mobile)
              const showBadge = count > 0 && (isMobileOpen || isExpanded)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } justify-start`}
                  onClick={() => handleLinkClick(link.href)}
                >
                  <div className="relative flex-shrink-0">
                    {IconComponent ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <IconFallback />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate flex-1">
                    {link.label}
                  </span>
                  {/* Expanded state: show badge at end of link */}
                  {showBadge && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out - Right below nav links */}
          <div className="px-3 py-2 border-t border-sidebar-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors justify-start"
              disabled={!user}
            >
              <IconComponents.LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
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