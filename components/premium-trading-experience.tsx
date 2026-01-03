"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export function PremiumTradingExperience() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Visual */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Animated crypto visual */}
                  <div
                    className="absolute inset-0 border border-primary/30 rounded-3xl animate-spin"
                    style={{ animationDuration: "8s" }}
                  ></div>
                  <div
                    className="absolute inset-4 border border-secondary/30 rounded-2xl animate-spin"
                    style={{ animationDuration: "6s", animationDirection: "reverse" }}
                  ></div>
                  <div className="absolute inset-8 border border-accent/30 rounded-xl animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        24/7
                      </div>
                      <div className="text-sm text-muted-foreground">Global Market Access</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 w-fit">
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FREEDOM TO TRADE
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Trade What You Want,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  When You Want
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Enjoy complete flexibility across asset classes with professional-grade execution and tools.
              </p>
            </div>

            {/* Features Checklist */}
            <div className="space-y-3">
              {[
                "Forex, Indices, Shares & Commodities",
                "Global markets 24/7",
                "Multilingual support",
                "Mobile trading",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button className="bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg transition-all h-12 px-8 w-full sm:w-auto">
              Learn About Our Commissions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
