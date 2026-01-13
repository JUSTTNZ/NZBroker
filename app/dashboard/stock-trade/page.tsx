// app/dashboard/trading/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, TrendingDown, Search, DollarSign, Clock, 
  ArrowUpRight, ArrowDownRight, X, BarChart3, Target,
  AlertCircle, CheckCircle2, RefreshCw, PieChart
} from "lucide-react"
import { toast } from "sonner"
import { 
  executeTrade, 
  getOpenTrades, 
  closeTrade, 
  getTradingBalance 
} from "@/components/action/trading"

// Trading assets
const tradingAssets = {
  stocks: [
    { symbol: "AAPL", name: "Apple Inc.", volatility: "Medium", spread: "0.01%" },
    { symbol: "MSFT", name: "Microsoft", volatility: "Low", spread: "0.02%" },
    { symbol: "GOOGL", name: "Google", volatility: "Medium", spread: "0.015%" },
    { symbol: "AMZN", name: "Amazon", volatility: "High", spread: "0.03%" },
    { symbol: "TSLA", name: "Tesla", volatility: "High", spread: "0.05%" },
    { symbol: "META", name: "Meta", volatility: "Medium", spread: "0.02%" },
  ],
  crypto: [
    { symbol: "BTCUSD", name: "Bitcoin", volatility: "High", spread: "0.1%" },
    { symbol: "ETHUSD", name: "Ethereum", volatility: "High", spread: "0.15%" },
    { symbol: "BNBUSD", name: "Binance Coin", volatility: "High", spread: "0.2%" },
  ],
  forex: [
    { symbol: "EURUSD", name: "Euro/US Dollar", volatility: "Low", spread: "0.0001" },
    { symbol: "GBPUSD", name: "British Pound/US Dollar", volatility: "Low", spread: "0.0002" },
    { symbol: "USDJPY", name: "US Dollar/Yen", volatility: "Low", spread: "0.0003" },
  ]
}

export default function ManualTradingPage() {
  const { currentWallet, userProfile, refreshAllData } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<"stocks" | "crypto" | "forex">("stocks")
  const [selectedAsset, setSelectedAsset] = useState<(typeof tradingAssets.stocks)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [openTrades, setOpenTrades] = useState<any[]>([])
  const [tradingBalance, setTradingBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Order form state
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState<string>("1")
  const [limitPrice, setLimitPrice] = useState<string>("")
  const [stopLoss, setStopLoss] = useState<string>("")
  const [takeProfit, setTakeProfit] = useState<string>("")

  useEffect(() => {
    loadData()
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    if (refreshing) return
    
    try {
      setRefreshing(true)
      const [trades, balance] = await Promise.all([
        getOpenTrades(),
        getTradingBalance()
      ])
      setOpenTrades(trades || [])
      setTradingBalance(balance || 0)
    } catch (error) {
      console.error('Failed to load trading data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const currentAssets = tradingAssets[selectedCategory]
  const filteredAssets = currentAssets.filter(
    asset => asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
             asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate order details
  const currentPrice = selectedAsset ? getSimulatedPrice(selectedAsset.symbol, selectedCategory) : 0
  const executionPrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice
  const orderAmount = parseFloat(quantity) * executionPrice
  const maxQuantity = tradingBalance / executionPrice

  const handleExecuteTrade = async () => {
    if (!selectedAsset) {
      toast.error("Please select an asset to trade")
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error("Please enter a valid limit price")
      return
    }

    if (orderSide === 'buy' && orderAmount > tradingBalance) {
      toast.error(`Insufficient trading balance. Available: $${tradingBalance.toFixed(2)}`)
      return
    }

    setLoading(true)
    try {
      const result = await executeTrade({
        symbol: selectedAsset.symbol,
        category: selectedCategory,
        side: orderSide,
        orderType: orderType,
        quantity: parseFloat(quantity),
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
        amount: orderAmount,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
      })

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Trade executed successfully!
        </div>
      )

      // Reset form
      setQuantity("1")
      setLimitPrice("")
      setStopLoss("")
      setTakeProfit("")

      // Refresh data
      await loadData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          {error.message || "Failed to execute trade"}
        </div>
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTrade = async (tradeId: string) => {
    try {
      const result = await closeTrade(tradeId)
      const message = result.profitLoss >= 0
        ? `Trade closed with profit of $${result.profitLoss.toFixed(2)}`
        : `Trade closed with loss of $${Math.abs(result.profitLoss).toFixed(2)}`
      
      toast.success(message)
      await loadData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to close trade")
    }
  }

  const totalProfitLoss = openTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manual Trading</h1>
          <p className="text-muted-foreground">Execute trades manually with advanced order types</p>
        </div>
        <Button 
          onClick={loadData} 
          variant="outline" 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Trading Balance</p>
              <p className="text-2xl font-bold">${tradingBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Trades</p>
              <p className="text-2xl font-bold">{openTrades.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalProfitLoss.toFixed(2)}
              </p>
            </div>
            <PieChart className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="text-2xl font-bold capitalize">{userProfile?.account_type || 'demo'}</p>
            </div>
            <Target className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Market & Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Selector */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Market Watch</h3>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search symbols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 h-8"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="stocks" onValueChange={(v) => setSelectedCategory(v as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedCategory}>
                <div className="grid grid-cols-2 gap-3">
                  {filteredAssets.map((asset) => {
                    const price = getSimulatedPrice(asset.symbol, selectedCategory)
                    const change = (Math.random() * 4 - 2).toFixed(2)
                    const isPositive = parseFloat(change) >= 0
                    
                    return (
                      <button
                        key={asset.symbol}
                        onClick={() => setSelectedAsset(asset)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedAsset?.symbol === asset.symbol
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{asset.symbol}</h4>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            asset.volatility === 'High' ? 'bg-red-500/10 text-red-500' :
                            asset.volatility === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {asset.volatility}
                          </span>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">${price.toFixed(2)}</p>
                            <p className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {change}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Spread</p>
                            <p className="text-sm">{asset.spread}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Order Form */}
          {selectedAsset && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Trade {selectedAsset.symbol}</h3>
                  <p className="text-sm text-muted-foreground">Current Price: ${currentPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Buy/Sell Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderSide('buy')}
                    className={`p-4 rounded-lg border flex items-center justify-center gap-2 ${
                      orderSide === 'buy'
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : 'border-border hover:border-green-500/50'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    <span className="font-semibold">Buy / Long</span>
                  </button>
                  <button
                    onClick={() => setOrderSide('sell')}
                    className={`p-4 rounded-lg border flex items-center justify-center gap-2 ${
                      orderSide === 'sell'
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-border hover:border-red-500/50'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5" />
                    <span className="font-semibold">Sell / Short</span>
                  </button>
                </div>

                {/* Order Type */}
                <div>
                  <Label className="mb-2 block">Order Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderType('market')}
                      className={`p-3 rounded-lg border ${
                        orderType === 'market'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">Market Order</div>
                      <div className="text-sm text-muted-foreground">Execute immediately</div>
                    </button>
                    <button
                      onClick={() => setOrderType('limit')}
                      className={`p-3 rounded-lg border ${
                        orderType === 'limit'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">Limit Order</div>
                      <div className="text-sm text-muted-foreground">At specified price</div>
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity" className="mb-2 block">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {maxQuantity.toFixed(2)} units
                    </p>
                  </div>

                  {orderType === 'limit' && (
                    <div>
                      <Label htmlFor="limitPrice" className="mb-2 block">
                        Limit Price ($)
                      </Label>
                      <Input
                        id="limitPrice"
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        min="0.0001"
                        step="0.0001"
                      />
                    </div>
                  )}
                </div>

                {/* Risk Management */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stopLoss" className="mb-2 block">
                      Stop Loss (Optional)
                    </Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit" className="mb-2 block">
                      Take Profit (Optional)
                    </Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Execution Price</span>
                      <span className="font-medium">${executionPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="font-medium">${orderAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Available Balance</span>
                      <span className="font-medium">${tradingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-muted-foreground">Remaining Balance</span>
                      <span className={`font-bold ${orderSide === 'buy' ? 'text-red-500' : 'text-green-500'}`}>
                        ${(orderSide === 'buy' ? tradingBalance - orderAmount : tradingBalance + orderAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Execute Button */}
                <Button
                  onClick={handleExecuteTrade}
                  disabled={loading || !quantity || parseFloat(quantity) <= 0}
                  className="w-full py-6 text-lg font-semibold"
                  size="lg"
                  variant={orderSide === 'buy' ? 'default' : 'destructive'}
                >
                  {loading ? (
                    <>Executing Trade...</>
                  ) : (
                    <>
                      {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.symbol}
                      <span className="ml-2">${orderAmount.toFixed(2)}</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Open Positions */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Open Positions</h3>
              <span className="text-sm text-muted-foreground">
                {openTrades.length} position{openTrades.length !== 1 ? 's' : ''}
              </span>
            </div>

            {openTrades.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No open positions</p>
                <p className="text-sm text-muted-foreground mt-1">Execute a trade to see it here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {openTrades.map((trade) => (
                  <Card key={trade.id} className="p-4 border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{trade.symbol}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trade.side === 'buy' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trade.quantity} units @ ${trade.entry_price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          (trade.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ${(trade.profit_loss || 0).toFixed(2)}
                        </p>
                        <p className={`text-sm ${
                          (trade.profit_loss_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {(trade.profit_loss_percent || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(trade.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div>
                        Current: ${trade.current_price?.toFixed(2)}
                      </div>
                    </div>

                    {trade.stop_loss && (
                      <div className="text-xs text-red-500 mb-1">
                        Stop Loss: ${trade.stop_loss}
                      </div>
                    )}
                    {trade.take_profit && (
                      <div className="text-xs text-green-500 mb-3">
                        Take Profit: ${trade.take_profit}
                      </div>
                    )}

                    <Button
                      onClick={() => handleCloseTrade(trade.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Close Position
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Trading Tips */}
          <Card className="p-6 bg-blue-500/5 border-blue-500/20">
            <h4 className="font-semibold text-blue-500 mb-2">Trading Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Always use stop-loss orders to limit losses</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Never risk more than 2% of your balance on a single trade</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <span>Have a clear entry and exit strategy before trading</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to simulate price
function getSimulatedPrice(symbol: string, category: 'stocks' | 'crypto' | 'forex'): number {
  const priceMap: Record<string, number> = {
    'AAPL': 182.45,
    'MSFT': 378.91,
    'GOOGL': 139.50,
    'AMZN': 187.23,
    'TSLA': 242.18,
    'META': 502.45,
    'BTCUSD': 43250.00,
    'ETHUSD': 2340.50,
    'BNBUSD': 612.30,
    'EURUSD': 1.0850,
    'GBPUSD': 1.2730,
    'USDJPY': 0.0067,
  }
  
  const basePrice = priceMap[symbol] || 100
  const volatility = category === 'crypto' ? 0.05 : category === 'stocks' ? 0.02 : 0.005
  const randomChange = (Math.random() * 2 - 1) * volatility
  
  return basePrice * (1 + randomChange)
}