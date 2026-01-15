"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, User } from "lucide-react"
import { useState } from "react"

const traders = [
  {
    id: 1,
    name: "Alex Trading Pro",
    winRate: "87%",
    winRateValue: 87,
    profit: "$24,500",
    pnl: "+$2,450",
    copiers: 342,
    riskLevel: "Medium",
    profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: 2,
    name: "Crypto Master",
    winRate: "92%",
    winRateValue: 92,
    profit: "$38,200",
    pnl: "+$3,820",
    copiers: 521,
    riskLevel: "High",
    profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Crypto",
  },
  {
    id: 3,
    name: "Forex Expert",
    winRate: "79%",
    winRateValue: 79,
    profit: "$15,800",
    pnl: "-$320",
    copiers: 198,
    riskLevel: "Low",
    profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Forex",
  },
  {
    id: 4,
    name: "Diamond Trader",
    winRate: "88%",
    winRateValue: 88,
    profit: "$42,100",
    pnl: "+$4,210",
    copiers: 614,
    riskLevel: "Medium",
    profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diamond",
  },
]

export default function CopyTradingPage() {
  const [copyAmounts, setCopyAmounts] = useState<{[key: number]: string}>({})
  const [userBalance] = useState(1000) // Example balance

  const handleCopyTrade = (traderId: number, traderName: string) => {
    const amount = parseFloat(copyAmounts[traderId] || "0")
    
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (amount > userBalance) {
      alert("Insufficient balance to copy this trade")
      return
    }

    alert(`You have successfully copied ${traderName} with $${amount}`)
    // Here you would typically call your API to execute the copy trade
  }

  const handleAmountChange = (traderId: number, value: string) => {
    setCopyAmounts(prev => ({
      ...prev,
      [traderId]: value
    }))
  }

  // Function to determine win rate bar color
  const getWinRateColor = (rate: number) => {
    if (rate >= 85) return "bg-green-500"
    if (rate >= 75) return "bg-green-400"
    if (rate >= 60) return "bg-yellow-400"
    return "bg-red-400"
  }

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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {trader.profile ? (
                    <img 
                      src={trader.profile} 
                      alt={trader.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{trader.name}</h3>
                  <p className="text-sm text-muted-foreground">Followers: {trader.copiers}</p>
                </div>
              </div>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>

            {/* Win Rate Progress Bar Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">Win Rate</p>
                <p className="text-sm font-bold">{trader.winRate}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getWinRateColor(trader.winRateValue)} transition-all duration-500`}
                  style={{ width: `${trader.winRateValue}%` }}
                />
              </div>
              
              {/* Profit & Loss Display Below the Bar */}
              <div className="pt-4 grid grid-cols-2 gap-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
                  <p className="text-sm font-bold text-green-400">{trader.profit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">P&L (Today)</p>
                  <p className={`text-sm font-bold ${trader.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {trader.pnl}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {trader.riskLevel} Risk
              </span>
            </div>

            <div className="space-y-4 ">
              <div>
                <label htmlFor={`amount-${trader.id}`} className="text-sm font-medium mb-1 block">
                  Amount to Copy
                </label>
                <input
                  id={`amount-${trader.id}`}
                  type="number"
                  placeholder="Enter amount ($)"
                  value={copyAmounts[trader.id] || ""}
                  onChange={(e) => handleAmountChange(trader.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  step="0.01"
                />
              </div>
              {/* <div className="text-xs text-muted-foreground">
                Available Balance: ${userBalance.toFixed(2)}
              </div> */}
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              // onClick={() => handleCopyTrade(trader.id, trader.name)}
            >
              Copy Trader
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}