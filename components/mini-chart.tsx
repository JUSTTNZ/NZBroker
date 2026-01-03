"use client"
import { Card } from "@/components/ui/card"

export function MiniChart({ symbol }: { symbol: string }) {
  return (
    <Card className="glass-dark overflow-hidden h-[300px]">
      <iframe
        key={symbol}
        title="xrp"
        src={`https://s.tradingview.com/embed-widget/mini-chart/?symbol=${symbol}&interval=D&timezone=Etc/UTC&theme=dark&locale=en`}
        className="w-full h-full border-0"
        allowFullScreen
      />
    </Card>
  )
}
