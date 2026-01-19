"use client"

import { useState, useEffect, useRef, memo } from "react"

// Lazy load wrapper - only loads iframe when visible
function LazyIframe({ src, className }: { src: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <iframe
          src={src}
          style={{ width: "100%", height: "100%", border: "none" }}
          loading="lazy"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export const AdvancedChartWidget = memo(function AdvancedChartWidget() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50">
      <LazyIframe
        src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=BTCUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en"
        className="w-full h-full"
      />
    </div>
  )
})

export const MiniSymbolChart = memo(function MiniSymbolChart({ symbol = "BTCUSD" }: { symbol?: string }) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50">
      <LazyIframe
        src={`https://s.tradingview.com/embed-widget/mini-chart/?symbol=${symbol}&interval=D&timezone=Etc/UTC&theme=dark&locale=en`}
        className="w-full h-full"
      />
    </div>
  )
})

export const MarketOverviewWidget = memo(function MarketOverviewWidget() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50">
      <LazyIframe
        src="https://s.tradingview.com/embed-widget/market-overview/?symbols=BTCUSD,ETHUSD,EURUSD,GBPUSD,JPYUSD&locale=en"
        className="w-full h-full"
      />
    </div>
  )
})
