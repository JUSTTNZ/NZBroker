"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  DollarSign,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  BotIcon,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/kyc", label: "KYC Verifications", icon: FileCheck },
  { href: "/admin/credit", label: "Credit Users", icon: CreditCard },
  { href: "/admin/bot", label: "Bot Trading", icon: BotIcon },
  { href: "/admin/updatebot", label: "Update Bot", icon: BotIcon },
  { href: "/admin/plan", label: "Plans", icon: CreditCard },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: CreditCard },
  { href: "/admin/support", label: "Customer Support", icon: MessageSquare },
  { href: "/admin/transactions", label: "Transactions", icon: DollarSign },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
          <Link href="/" className="p-2 hover:bg-accent rounded-lg">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border h-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-sidebar-accent rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {adminLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              localStorage.removeItem("authToken")
              window.location.href = "/"
            }}
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {adminLinks.find(link => isActive(link.href))?.label || "Admin Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Site
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content - Fixed */}
        <main className="flex-1 pt-16 lg:pt-0 overflow-auto">
          <div className="p-4 lg:p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}