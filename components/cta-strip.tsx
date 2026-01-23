"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTAStrip() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold text-balance">Ready to Start Trading?</h2>
        <p className="text-lg text-muted-foreground">Join thousands of traders already profiting on Barcrest</p>

        <Button
          size="lg"
          className="bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg h-12 px-8"
        >
          Start Trading Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}
