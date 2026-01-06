"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Eye } from "lucide-react"
import { ScrollingTicker } from "@/components/scrolling-ticker"
import { AdvancedChartWidget, MiniSymbolChart, MarketOverviewWidget } from "@/components/tradingview-widgets"

export default function DashboardPage() {
  const [userName, setUserName] = useState("Nz")
  const [accountType, setAccountType] = useState("demo")

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      try {
        const token = JSON.parse(authToken)
        setUserName(token.fullName || "NZ")
      } catch (e) {
        console.log("[v0] Failed to parse auth token")
      }
    }
  }, [])

  const accountBalance = accountType === "demo" ? "$10,000.00" : "$0.00"

  return (
    <div className="space-y-6">
      {/* Welcome Section - Added fade-in animation */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Track your investments and trading performance in real-time
        </p>
      </div>

      <ScrollingTicker />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Account Balance", value: accountBalance, subtext: "+2.5% today", color: "text-green-400" },
          { label: "Pending Trades", value: "$2,850.00", subtext: "2 active", color: "text-muted-foreground" },
          { label: "Total Profit", value: "$1,250.00", subtext: "+12.5% this month", color: "text-green-400" },
          { label: "Active Trades", value: "5", subtext: "2 pending", color: "text-muted-foreground" },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className="p-4 md:p-6 bg-card/50 border-border/40 hover:border-primary/50 transition-all duration-300 animate-fade-in-up group cursor-pointer"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-[clamp(1.3rem,2vw,2rem)] font-bold text-foreground font-mono tabular-nums group-hover:scale-105 transition-transform">
              {stat.value}
            </p>
            <p className={`text-xs ${stat.color} mt-2`}>{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Added interactive hover effects and animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: TrendingUp,
            title: "Start Trading",
            desc: "Begin your trading journey with confidence",
            btn: "Trade Now",
          },
          {
            icon: Eye,
            title: "Market Signals",
            desc: "View AI-powered trading signals and analysis",
            btn: "View Signals",
          },
          {
            icon: TrendingUp,
            title: "Copy Trading",
            desc: "Copy successful traders and earn alongside them",
            btn: "Learn More",
          },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Card
              key={action.title}
              className="p-6 bg-gradient-to-br from-primary/20 to-transparent border-border/40 hover:border-primary/50 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
            >
              <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{action.desc}</p>
              <Button className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all">
                {action.btn}
              </Button>
            </Card>
          )
        })}
      </div>

      <Card className="p-4 md:p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4">Advanced Market Chart</h3>
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <AdvancedChartWidget />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["BTCUSD", "ETHUSD", "EURUSD"].map((symbol, i) => (
          <Card
            key={symbol}
            className="p-4 bg-card/50 border-border/40 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <h4 className="text-sm font-semibold mb-3">{symbol}</h4>
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <MiniSymbolChart symbol={symbol} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <MarketOverviewWidget />
        </div>
      </Card>
    </div>
  )
}
