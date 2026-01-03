 "use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Globe } from "lucide-react"

export function AboutUs() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute left-0 top-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OUR STORY
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">About Us</h2>
        </div>

        {/* Main Content Card */}
        <Card className="glass-dark p-8 md:p-12 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-6 text-foreground leading-relaxed">
            <p className="text-lg text-muted-foreground">
              AstralisX Vault was founded with a simple mission: to democratize access to global financial markets and
              empower traders of all skill levels to make informed decisions. Our team of experienced financial
              professionals, technologists, and market analysts has dedicated over 50 combined years to building the
              most intuitive and powerful trading platform available today.
            </p>
            <p className="text-lg text-muted-foreground">
              We believe that successful trading should be accessible, transparent, and fair. That's why we've
              engineered every aspect of AstralisX Vault from the ground up—from our low-latency execution engine to our
              institutional-grade market analysis tools—to give you a competitive edge in your trading journey.
            </p>
            <p className="text-lg text-muted-foreground">
              Whether you're a seasoned institutional trader or just beginning your financial markets exploration,
              AstralisX Vault provides the comprehensive suite of tools, market data, and education you need to succeed
              in today's dynamic global markets.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-purple">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Personalized Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Customized tools and strategies tailored to your trading style and risk profile
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-secondary to-accent flex items-center justify-center glow-purple">
                  <Globe className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Complete Control</h3>
                <p className="text-sm text-muted-foreground">
                  Full autonomy over your trades with no platform restrictions or hidden fees
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA Button */}
        <div className="flex justify-center pt-6">
          <Button className="bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg transition-all h-12 px-8">
            Learn more about us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
