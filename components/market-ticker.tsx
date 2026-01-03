"use client"

export function MarketTicker() {
  return (
    <section className="py-6 overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 border-y border-border/40">
      <div className="max-w-full">
        <div className="h-[54px] overflow-hidden">
          <iframe
            src="https://s.tradingview.com/embed-widget/ticker-tape/?symbols=EURUSD,BTCUSD,AAPL,SPX,XAUUSD,GBPUSD,ETHUSD,MSFT,DAX,XTIUSD&showSymbols=true&locale=en&copyrightYear=2026"
            className="w-full h-full border-0"
            allowFullScreen
            allow="clipboard-write; web-share"
          ></iframe>
        </div>
      </div>
    </section>
  )
}
