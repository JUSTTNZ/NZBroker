"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAssetsMobile, setShowAssetsMobile] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          AstralisX
        </Link>

        {/* Desktop Navigation - Remains the same */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/trading"
            className="text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Trading
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/markets"
            className="text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Markets
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <div className="relative group">
            <button className="text-muted-foreground hover:text-foreground transition-colors relative">
              Assets
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
            </button>
            <div className="absolute left-0 mt-0 w-32 bg-card border border-border/40 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link
                href="/cryptocurrencies"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors first:rounded-t-lg"
              >
                Cryptocurrencies
              </Link>
              <Link
                href="/forex"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Forex
              </Link>
              <Link
                href="/indices"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Indices
              </Link>
              <Link
                href="/shares"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors last:rounded-b-lg"
              >
                Shares
              </Link>
            </div>
          </div>
          <Link
            href="/education"
            className="text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Education
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-foreground hover:bg-card" onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all"
            onClick={() => router.push("/register")}
          >
            Create Account
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-card transition-colors">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-card/50 backdrop-blur-sm p-4 space-y-4 max-h-96 overflow-y-auto">
          <Link
            href="/"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/trading"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Trading
          </Link>
          <Link
            href="/markets"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Markets
          </Link>

          {/* Assets Dropdown for Mobile */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAssetsMobile(!showAssetsMobile)}
              className="w-full flex items-center justify-between py-3 px-4 text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Assets</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAssetsMobile ? "rotate-180" : ""}`}
              />
            </button>
            
            {/* Assets Dropdown Content */}
            {showAssetsMobile && (
              <div className="border-t border-border/40 bg-background/50">
                <Link
                  href="/cryptocurrencies"
                  className="block py-3 px-6 text-foreground hover:text-primary hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setShowAssetsMobile(false)
                  }}
                >
                  Cryptocurrencies
                </Link>
                <Link
                  href="/forex"
                  className="block py-3 px-6 text-foreground hover:text-primary hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setShowAssetsMobile(false)
                  }}
                >
                  Forex
                </Link>
                <Link
                  href="/indices"
                  className="block py-3 px-6 text-foreground hover:text-primary hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setShowAssetsMobile(false)
                  }}
                >
                  Indices
                </Link>
                <Link
                  href="/shares"
                  className="block py-3 px-6 text-foreground hover:text-primary hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setShowAssetsMobile(false)
                  }}
                >
                  Shares
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/education"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Education
          </Link>
          <Link
            href="/about"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>

          {/* Mobile CTA Buttons */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <Button
              variant="ghost"
              className="w-full text-foreground hover:bg-muted"
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
      )}
    </header>
  )
}