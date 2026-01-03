"use client"

import { Suspense } from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Search, X } from "lucide-react"

const assets = {
  stocks: [
    { symbol: "AAPL", name: "Apple Inc.", price: "$182.45", change: "+2.5%", isPositive: true, status: "Open" },
    { symbol: "MSFT", name: "Microsoft", price: "$378.91", change: "+1.8%", isPositive: true, status: "Open" },
    { symbol: "GOOGL", name: "Google", price: "$139.50", change: "-0.5%", isPositive: false, status: "Open" },
    { symbol: "AMZN", name: "Amazon", price: "$187.23", change: "+3.2%", isPositive: true, status: "Closed" },
    { symbol: "TSLA", name: "Tesla", price: "$242.18", change: "-1.2%", isPositive: false, status: "Open" },
    { symbol: "META", name: "Meta", price: "$502.45", change: "+4.1%", isPositive: true, status: "Open" },
  ],
  crypto: [
    { symbol: "BTCUSD", name: "Bitcoin", price: "$43,250.00", change: "+5.2%", isPositive: true, status: "24/7" },
    { symbol: "ETHUSD", name: "Ethereum", price: "$2,340.50", change: "+2.8%", isPositive: true, status: "24/7" },
    { symbol: "BNBUSD", name: "Binance Coin", price: "$612.30", change: "-1.5%", isPositive: false, status: "24/7" },
  ],
  forex: [
    { symbol: "EURUSD", name: "Euro/US Dollar", price: "1.0850", change: "+0.8%", isPositive: true, status: "Open" },
    {
      symbol: "GBPUSD",
      name: "British Pound/US Dollar",
      price: "1.2730",
      change: "-0.3%",
      isPositive: false,
      status: "Open",
    },
    {
      symbol: "JPYUSD",
      name: "Japanese Yen/US Dollar",
      price: "0.0067",
      change: "+1.2%",
      isPositive: true,
      status: "Open",
    },
  ],
}

function StockTradeContent() {
  const [selectedCategory, setSelectedCategory] = useState<"stocks" | "crypto" | "forex">("stocks")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<(typeof assets.stocks)[0] | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [orderType, setOrderType] = useState("market")

  const currentAssets = assets[selectedCategory]
  const filtered = currentAssets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const estimatedCost = selectedAsset
    ? (Number.parseFloat(selectedAsset.price.replace(/[$,]/g, "")) * Number.parseInt(quantity)).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Trading Terminal</h1>
        <p className="text-muted-foreground">Trade stocks, cryptocurrencies, and forex with advanced tools</p>
      </div>

      {/* Market Selector Tabs - Added interactive market category selection */}
      <div className="flex gap-2 flex-wrap animate-fade-in-up">
        {(["stocks", "crypto", "forex"] as const).map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category)
              setSelectedAsset(null)
              setSearchQuery("")
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card border border-border hover:border-primary/50"
            } active:scale-95`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List - Added search functionality and interactive selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbols or names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((asset, index) => (
              <Card
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 cursor-pointer transition-all duration-300 group animate-fade-in-up hover:shadow-lg ${
                  selectedAsset?.symbol === asset.symbol
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "bg-card/50 border-border/40 hover:border-primary/50"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{asset.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-background/50 text-muted-foreground">
                      {asset.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold font-mono">{asset.price}</p>
                    <p
                      className={`text-sm font-medium flex items-center justify-end gap-2 ${
                        asset.isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {asset.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {asset.change}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trading Panel - Added functional Buy/Sell panel with quantity and order type */}
        <div>
          {selectedAsset ? (
            <Card className="p-6 bg-card/50 border-border/40 sticky top-24 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Trade {selectedAsset.symbol}</h3>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-background rounded transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Asset Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl font-bold font-mono">{selectedAsset.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Daily Change</p>
                  <p
                    className={`text-lg font-semibold ${selectedAsset.isPositive ? "text-green-400" : "text-red-400"}`}
                  >
                    {selectedAsset.change}
                  </p>
                </div>
              </div>

              {/* Order Form */}
              <div className="space-y-4">
                {/* Quantity Input */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                    min="1"
                  />
                </div>

                {/* Order Type */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                  </select>
                </div>

                {/* Estimated Cost */}
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                  <p className="text-lg font-bold font-mono">${estimatedCost}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition-all font-semibold">
                    Buy {selectedAsset.symbol}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600/20 active:scale-95 transition-all font-semibold"
                  >
                    Sell {selectedAsset.symbol}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card/50 border-border/40 sticky top-24 text-center">
              <p className="text-muted-foreground">Select an asset to trade</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StockTradePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockTradeContent />
    </Suspense>
  )
}
