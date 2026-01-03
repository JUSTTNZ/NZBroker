"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const router = useRouter()

  const handleCreateAccount = () => {
    router.push("/register")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div
          className="absolute -bottom-40 left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Pill Badge */}
          <div className="inline-block">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm">
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ✨ Welcome to Professional Trading
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
            Trade Global Markets with{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Access Forex, Crypto, Indices, Commodities, and Stocks on a single premium platform
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg transition-all h-12 px-8"
              onClick={handleCreateAccount}
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-card h-12 px-8 bg-transparent"
              onClick={handleLogin}
            >
              Login to Platform
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
