"use client"

import Link from "next/link"
import { Mail, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AstralisX Vault
            </h3>
            <p className="text-muted-foreground text-sm">
              Professional trading platform for global markets. Trade with confidence.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="p-2 rounded-lg bg-card hover:bg-border/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-card hover:bg-border/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-card hover:bg-border/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-foreground transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Trading */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Trading</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cryptocurrencies" className="hover:text-foreground transition-colors">
                  Cryptocurrencies
                </Link>
              </li>
              <li>
                <Link href="/forex" className="hover:text-foreground transition-colors">
                  Forex
                </Link>
              </li>
              <li>
                <Link href="/shares" className="hover:text-foreground transition-colors">
                  Shares
                </Link>
              </li>
              <li>
                <Link href="/indices" className="hover:text-foreground transition-colors">
                  Indices
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Your Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login?demo=true" className="hover:text-foreground transition-colors">
                  Demo Account
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Platform Availability */}
        <div className="border-t border-border/40 pt-8">
          <h4 className="font-semibold text-foreground mb-4">Platform Availability</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Web
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Windows
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Android
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              iOS
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="border-t border-border/40 pt-8 space-y-4">
          <p className="text-xs text-muted-foreground/70 text-balance">
            <strong>Risk Warning:</strong> CFDs are complex financial products. Trading CFDs involves substantial risk
            of loss. 74-89% of retail investor accounts lose money when trading CFDs. You should not risk more than you
            can afford to lose. Before trading, please ensure you fully understand the risks involved and seek advice
            from independent financial advisors if necessary.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} AstralisX Vault. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Legal Documents
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
