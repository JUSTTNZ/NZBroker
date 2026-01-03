"use client"

export function AdvancedChartWidget() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50 flex items-center justify-center relative">
      <div className="w-full h-full relative">
        <iframe
          src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=BTCUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en&copyrightYear=2026"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
        />
      </div>
      {/* TradingView watermark will appear automatically */}
    </div>
  )
}

export function MiniSymbolChart({ symbol = "BTCUSD" }) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50">
      <iframe
        src={`https://s.tradingview.com/embed-widget/mini-chart/?symbol=${symbol}&interval=D&timezone=Etc/UTC&theme=dark&locale=en&copyrightYear=2026`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allowFullScreen
      />
    </div>
  )
}

export function MarketOverviewWidget() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50">
      <iframe
        src="https://s.tradingview.com/embed-widget/market-overview/?symbols=BTCUSD,ETHUSD,EURUSD,GBPUSD,JPYUSD&locale=en&copyrightYear=2026"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allowFullScreen
      />
    </div>
  )
}
