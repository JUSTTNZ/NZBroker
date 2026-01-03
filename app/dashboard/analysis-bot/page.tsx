"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Zap, Activity, Target, Settings } from "lucide-react"

interface Signal {
  id: string
  asset: string
  signal: "BUY" | "SELL"
  confidence: number
  timestamp: string
}

export default function AnalysisBotPage() {
  const [botActive, setBotActive] = useState(true)
  const [riskLevel, setRiskLevel] = useState("medium")
  const [strategy, setStrategy] = useState("swing")
  const [signals, setSignals] = useState<Signal[]>([
    { id: "1", asset: "BTC/USD", signal: "BUY", confidence: 92, timestamp: "2 mins ago" },
    { id: "2", asset: "EUR/USD", signal: "SELL", confidence: 87, timestamp: "5 mins ago" },
    { id: "3", asset: "AAPL", signal: "BUY", confidence: 89, timestamp: "8 mins ago" },
    { id: "4", asset: "ETH/USD", signal: "BUY", confidence: 85, timestamp: "12 mins ago" },
  ])

  const marketSentiment = "Bullish"

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">AI Analysis Bot</h1>
        <p className="text-muted-foreground">Intelligent trading signals powered by machine learning</p>
      </div>

      {/* Bot Status Panel - Added bot status with active/inactive toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-transparent border-border/40 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Bot Status</h3>
            <Activity className={`w-6 h-6 ${botActive ? "text-green-400 animate-pulse" : "text-muted-foreground"}`} />
          </div>
          <p className={`text-2xl font-bold mb-4 ${botActive ? "text-green-400" : "text-muted-foreground"}`}>
            {botActive ? "Active" : "Inactive"}
          </p>
          <button
            onClick={() => setBotActive(!botActive)}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all active:scale-95 ${
              botActive
                ? "bg-red-600/20 text-red-500 border border-red-600/30 hover:bg-red-600/30"
                : "bg-green-600/20 text-green-500 border border-green-600/30 hover:bg-green-600/30"
            }`}
          >
            {botActive ? "Deactivate" : "Activate"}
          </button>
        </Card>

        <Card
          className="p-6 bg-gradient-to-br from-accent/20 to-transparent border-border/40 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Signal Strength</h3>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">89%</p>
          <p className="text-sm text-muted-foreground">Average confidence across all signals</p>
        </Card>

        <Card
          className="p-6 bg-gradient-to-br from-orange-500/20 to-transparent border-border/40 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Risk Level</h3>
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400 capitalize mb-4">{riskLevel}</p>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Card>
      </div>

      {/* Market Sentiment - Added market sentiment widget */}
      <Card className="p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Market Sentiment
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current: {marketSentiment}</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{marketSentiment}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-2">Strength: 72%</p>
            <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 w-3/4"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Signals Feed - Enhanced signals feed with animations and better styling */}
      <Card className="p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="font-semibold mb-4">Trading Signals</h3>
        <div className="space-y-3">
          {signals.map((signal, index) => (
            <div
              key={signal.id}
              className="p-4 bg-background/50 rounded-lg border border-border/40 group hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      signal.signal === "BUY" ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"
                    }`}
                  >
                    {signal.signal === "BUY" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{signal.asset}</p>
                    <p className="text-xs text-muted-foreground">{signal.timestamp}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-2xl font-bold transition-all group-hover:scale-110 ${
                      signal.signal === "BUY" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {signal.signal}
                  </p>
                  <p className="text-xs text-muted-foreground">Confidence: {signal.confidence}%</p>
                </div>
              </div>
              <div className="mt-3 w-full h-1 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    signal.signal === "BUY"
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gradient-to-r from-red-400 to-red-600"
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bot Configuration - Added strategy selector and risk configuration */}
      <Card className="p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Bot Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Trading Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border cursor-pointer"
            >
              <option value="scalping">Scalping (Ultra short-term)</option>
              <option value="swing">Swing Trading (Medium-term)</option>
              <option value="longterm">Long-term (Investing)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              {strategy === "scalping"
                ? "Quick trades within minutes to hours"
                : strategy === "swing"
                  ? "Trades held for days or weeks"
                  : "Holdings for months to years"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Risk Management</label>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium mb-2">Risk Level: {riskLevel.toUpperCase()}</p>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={riskLevel === "low" ? 0 : riskLevel === "medium" ? 1 : 2}
                  onChange={(e) => {
                    const levels = ["low", "medium", "high"]
                    setRiskLevel(levels[Number.parseInt(e.target.value)])
                  }}
                  className="w-full cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {riskLevel === "low"
                  ? "Conservative: 1-2% risk per trade"
                  : riskLevel === "medium"
                    ? "Moderate: 2-5% risk per trade"
                    : "Aggressive: 5-10% risk per trade"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
