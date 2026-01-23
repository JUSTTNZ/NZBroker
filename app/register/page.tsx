"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
   const { signUp } = useAuth()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      if (!agreedToTerms) {
        setError("Please agree to the terms and conditions")
        setIsLoading(false)
        return
      }

      await signUp(email, password, fullName)
      router.push("/register/verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
      console.log("Registration error:", err)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="relative min-h-[70vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-muted-foreground text-center mb-8">Join thousands of successful traders</p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <label className="text-sm text-muted-foreground">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-secondary transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
