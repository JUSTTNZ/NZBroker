"use client"
import { Card } from "@/components/ui/card"

export function MiniChart({ symbol }: { symbol: string }) {
  // Use a fully qualified symbol format for reliability
  const formattedSymbol = `CRYPTOCAP:${symbol}`; // Example for crypto market cap
  // Alternatives: 'BITSTAMP:BTCUSD', 'BINANCE:ETHUSDT', 'COINBASE:ETH-USD'

  return (
    // Ensure the parent container has a defined, explicit size
    <div className="min-h-[300px] w-full"> 
      <Card className="glass-dark overflow-hidden h-full w-full">
        <iframe
          key={symbol}
          title={`${symbol} chart`}
          // Use the formatted symbol in the URL
    src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=BTCUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en&copyrightYear=2026"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </Card>
    </div>
  )
}