"use client"

import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"

const awards = [
  "42+ Industry Awards",
  "Top 100 Companies",
  "Best Client Funds Security (Global)",
  "Best Forex News & Analysis Provider",
]

export function Awards() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-dark p-8 md:p-12 space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 glow-purple">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">Award-Winning Broker</h3>
                <p className="text-muted-foreground">Recognized globally for excellence</p>
              </div>

              {/* Awards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards.map((award, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group"
                  >
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary flex-shrink-0 group-hover:w-3 transition-all"></span>
                    <span className="text-foreground group-hover:text-primary transition-colors">{award}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
