"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trading", label: "Trading" },
  { href: "/markets", label: "Markets" },
  { href: "/education", label: "Education" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const assetLinks = [
  { href: "/cryptocurrencies", label: "Cryptocurrencies" },
  { href: "/forex", label: "Forex" },
  { href: "/indices", label: "Indices" },
  { href: "/shares", label: "Shares" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAssetsDropdown, setShowAssetsDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // Check if any asset link is active
  const isAssetsActive = assetLinks.some(link => pathname.startsWith(link.href))

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
        setShowAssetsDropdown(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-lg bg-background/90 border-b border-border/40 shadow-sm"
          : "backdrop-blur-md bg-background/80 border-b border-border/40"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity shrink-0"
          >
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Barcrest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 xl:px-4 py-2 text-sm transition-colors relative group ${
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 ${
                  isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}></span>
              </Link>
            ))}

            {/* Assets Dropdown */}
            <div className="relative group">
              <button className={`px-3 xl:px-4 py-2 text-sm transition-colors relative flex items-center gap-1 ${
                isAssetsActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
                Assets
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                <span className={`absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 ${
                  isAssetsActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}></span>
              </button>
              <div className="absolute left-0 top-full pt-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-card border border-border/40 rounded-lg shadow-xl overflow-hidden">
                  {assetLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        index === 0 ? "rounded-t-lg" : ""
                      } ${index === assetLinks.length - 1 ? "rounded-b-lg" : ""} ${
                        isActive(link.href)
                          ? "text-foreground bg-muted/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 xl:px-4 py-2 text-sm transition-colors relative group ${
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 ${
                  isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-card"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all"
              onClick={() => router.push("/register")}
            >
              Create Account
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-16 sm:top-18 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden fixed top-16 sm:top-18 left-0 right-0 bg-background border-b border-border/40 shadow-xl transition-all duration-300 transform ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 space-y-1">
            {/* Main Nav Links */}
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted/50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Assets Accordion */}
            <div className={`rounded-lg border overflow-hidden ${
              isAssetsActive ? "border-primary/40" : "border-border/40"
            }`}>
              <button
                onClick={() => setShowAssetsDropdown(!showAssetsDropdown)}
                className={`w-full flex items-center justify-between py-3 px-4 transition-colors ${
                  isAssetsActive ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted/50"
                }`}
              >
                <span>Assets</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAssetsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  showAssetsDropdown ? "max-h-48" : "max-h-0"
                }`}
              >
                <div className="border-t border-border/40 bg-muted/30">
                  {assetLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block py-2.5 px-6 transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setIsOpen(false)
                        setShowAssetsDropdown(false)
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Remaining Nav Links */}
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted/50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTA Buttons */}
            <div className="pt-4 mt-4 border-t border-border/40 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push("/login")
                  setIsOpen(false)
                }}
              >
                Login
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent"
                onClick={() => {
                  router.push("/register")
                  setIsOpen(false)
                }}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
