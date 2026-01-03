"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

export function MarketOverview() {
  const [activeTab, setActiveTab] = useState("indices")

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Live Market Overview</h2>
            <p className="text-muted-foreground text-lg">Real-time market data across all asset classes</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {["indices", "forex", "stocks", "crypto"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-primary to-accent text-white glow-purple"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TradingView Market Overview Widget */}
          <Card className="glass-dark overflow-hidden">
            <div className="h-[500px] overflow-auto">
              <iframe
                src={`https://s.tradingview.com/embed-widget/market-overview/?symbols=${
                  activeTab === "indices"
                    ? "SPX,CCMP,DXY,DBMF"
                    : activeTab === "forex"
                      ? "EURUSD,GBPUSD,USDJPY,AUDUSD"
                      : activeTab === "stocks"
                        ? "AAPL,MSFT,GOOGL,AMZN"
                        : "BTCUSD,ETHUSD,XRPUSD,BNBUSD"
                }&locale=en&copyrightYear=2026`}
                className="w-full h-full border-0"
                allowFullScreen
                allow="clipboard-write; web-share"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
