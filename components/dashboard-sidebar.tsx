"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  Menu,
  X,
  LayoutDashboard,
  Copy,
  TrendingUp,
  Star,
  User,
  DollarSign,
  PiggyBank,
  Bot,
  Share2,
  CheckCircle,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
} from "lucide-react"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Copy },
  { href: "/dashboard/stock-trade", label: "Stock Trade", icon: TrendingUp },
  { href: "/dashboard/upgrade-plan", label: "Upgrade Plan", icon: Star },
  { href: "/dashboard/account", label: "Account", icon: User },
  { href: "/dashboard/deposit", label: "Deposit", icon: DollarSign },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: PiggyBank },
  { href: "/dashboard/analysis-bot", label: "Analysis Bot", icon: Bot },
  { href: "/dashboard/referral-program", label: "Referral Program", icon: Share2 },
  { href: "/dashboard/kyc", label: "KYC", icon: CheckCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
]

export function DashboardSidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle button - Always visible */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - Fixed positioning with smooth collapse animation */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 lg:z-10 ${
          isExpanded ? "w-64" : "w-20"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header with collapse toggle */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {isExpanded && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-sidebar-primary">AstralisX</h2>
              <p className="text-xs text-sidebar-foreground/60">Vault</p>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 flex-shrink-0 active:scale-90"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={`w-5 h-5 text-sidebar-foreground transition-transform duration-300 ${
                !isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-2 px-3 pb-24 overflow-y-auto max-h-[calc(100vh-120px)]">
          {sidebarLinks.map((link, index) => {
            const IconComponent = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all justify-center lg:justify-start group ${
                  isActive(link.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                style={{
                  animation: isMobileOpen ? `fadeInUp 0.3s ease-out ${index * 0.05}s both` : "none",
                }}
                onClick={() => setIsMobileOpen(false)}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {isExpanded && (
                  <span className="text-sm font-medium truncate transition-opacity duration-300">{link.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={() => {
              localStorage.removeItem("authToken")
              window.location.href = "/"
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all justify-center lg:justify-start active:scale-95`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
