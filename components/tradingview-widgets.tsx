"use client"

export function AdvancedChartWidget() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-background/50 flex items-center justify-center relative">
      <div className="w-full h-full relative">
        <iframe
          src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview-advanced-chart&symbol=BTCUSD&interval=D&timezone=exchange&theme=dark&style=1&locale=en&withdateranges=true&range=1Y&hide_legend=true&allow_symbol_change=true"
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
    <div className="w-full h-24 rounded-lg overflow-hidden bg-background/50">
      <iframe
        src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview-mini-${symbol}&symbol=${symbol}&interval=60&timezone=exchange&theme=dark&style=2&locale=en&hide_legend=true&hide_top_toolbar=true&hide_volume=true`}
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
        src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview-market-overview&symbols=BTCUSD,ETHUSD,EURUSD,GBPUSD,JPYUSD&interval=D&timezone=exchange&theme=dark&style=1&locale=en&hide_legend=true"
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
