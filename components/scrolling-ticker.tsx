"use client"

import { useState } from "react"

export function ScrollingTicker() {
  const tickers = [
    { symbol: "BTC/USD", price: "$42,850.50", change: "+2.45%" },
    { symbol: "ETH/USD", price: "$2,285.75", change: "+1.85%" },
    { symbol: "EUR/USD", price: "1.0925", change: "-0.32%" },
    { symbol: "XAU/USD", price: "$2,456.30", change: "+0.78%" },
    { symbol: "XRP/USDT", price: "$2.18", change: "+5.62%" },
  ]

  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className="overflow-hidden bg-card/50 border border-border/40 rounded-lg h-12 flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`flex gap-8 px-4 ${isPaused ? "" : "animate-slide-left"}`}>
        {/* Duplicate ticker items for continuous scroll */}
        {[...tickers, ...tickers].map((ticker, idx) => (
          <div key={idx} className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
            <span className="font-semibold text-foreground text-sm">{ticker.symbol}</span>
            <span className="text-foreground font-mono text-sm">{ticker.price}</span>
            <span
              className={`text-xs font-medium ${ticker.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
            >
              {ticker.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
