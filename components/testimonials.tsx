"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "The best trading platform I've used. Execution is lightning-fast and the spreads are incredibly tight.",
    author: "Alex Chen",
    role: "Verified Trader",
    rating: 5,
  },
  {
    quote: "Customer support is exceptional. They helped me optimize my trading strategy.",
    author: "Maria Rodriguez",
    role: "Elite Investor",
    rating: 5,
  },
  {
    quote: "Copy trading feature is a game-changer. I've been consistently profitable since joining.",
    author: "James Thompson",
    role: "Professional Trader",
    rating: 5,
  },
  {
    quote: "The platform is intuitive and packed with advanced tools. Highly recommended!",
    author: "Sarah Williams",
    role: "Verified Trader",
    rating: 5,
  },
  {
    quote: "Great selection of markets and competitive commissions. Worth every penny.",
    author: "David Kumar",
    role: "Elite Investor",
    rating: 5,
  },
  {
    quote: "Been trading here for 2 years. The reliability and support are unmatched.",
    author: "Emma Johnson",
    role: "Professional Trader",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-8 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SUCCESS STORIES
            </span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Client Testimonials</h2>
            <p className="text-muted-foreground text-lg">Hear from our satisfied traders</p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-dark p-6 space-y-4 hover:glow-cyan transition-all group">
              {/* Rating */}
              <div className="flex gap-1">
                {Array(testimonial.rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
              </div>

              {/* Quote */}
              <p className="text-foreground italic">{`"${testimonial.quote}"`}</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <div className="text-xs font-bold text-white">{testimonial.author.charAt(0)}</div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
