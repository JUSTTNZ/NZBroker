"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Award, Headphones, Lock, Users, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Globally Regulated",
    description: "Licensed and regulated by international financial authorities",
  },
  {
    icon: Award,
    title: "40+ International Awards",
    description: "Industry recognition for excellence and innovation",
  },
  {
    icon: Headphones,
    title: "24/7 Multilingual Support",
    description: "Expert support team available around the clock",
  },
  {
    icon: Lock,
    title: "Segregated Client Funds",
    description: "Your funds are kept separate and secure",
  },
  {
    icon: Users,
    title: "Personal Account Managers",
    description: "Dedicated support for premium members",
  },
]

export function TrustedReputation() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-dark p-8 md:p-12 space-y-12">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold">Our Trusted Reputation</h2>
            <p className="text-muted-foreground text-lg">Why traders choose Barcrest Capital</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className="space-y-4 p-6 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-purple">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-4">
            <Button className="bg-gradient-to-r from-primary to-accent glow-purple text-white h-12 px-8">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
