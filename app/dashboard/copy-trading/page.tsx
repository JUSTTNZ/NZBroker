"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

const traders = [
  {
    id: 1,
    name: "Alex Trading Pro",
    winRate: "87%",
    profit: "$24,500",
    copiers: 342,
    riskLevel: "Medium",
  },
  {
    id: 2,
    name: "Crypto Master",
    winRate: "92%",
    profit: "$38,200",
    copiers: 521,
    riskLevel: "High",
  },
  {
    id: 3,
    name: "Forex Expert",
    winRate: "79%",
    profit: "$15,800",
    copiers: 198,
    riskLevel: "Low",
  },
  {
    id: 4,
    name: "Diamond Trader",
    winRate: "88%",
    profit: "$42,100",
    copiers: 614,
    riskLevel: "Medium",
  },
]

export default function CopyTradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Copy Trading</h1>
        <p className="text-muted-foreground">Follow and copy trades from successful traders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {traders.map((trader) => (
          <Card key={trader.id} className="p-6 bg-card/50 border-border/40 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{trader.name}</h3>
                <p className="text-sm text-muted-foreground">Followers: {trader.copiers}</p>
              </div>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-green-400">{trader.winRate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-green-400">{trader.profit}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {trader.riskLevel} Risk
              </span>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90">Copy Trader</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
