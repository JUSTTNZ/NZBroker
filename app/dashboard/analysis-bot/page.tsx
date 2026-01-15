// app/dashboard/bot-trading/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bot, Play, Pause, StopCircle, TrendingUp, TrendingDown, 
  DollarSign, BarChart3, Zap, Settings, RefreshCw,
  AlertCircle, Clock, Target, Shield
} from "lucide-react"
import { toast } from "sonner"
import { 
  createBotTrade, 
  stopBotTrade, 
  getActiveBotTrades, 
  getBotTradingBalance,
  pauseBotTrade,
  resumeBotTrade
} from "@/components/action/bot-trading"

// Trading assets for bot trading
const tradingAssets = [
  { symbol: "BTCUSD", name: "Bitcoin", category: "crypto" as const, volatility: "High" },
  { symbol: "ETHUSD", name: "Ethereum", category: "crypto" as const, volatility: "High" },
  { symbol: "AAPL", name: "Apple Inc.", category: "stocks" as const, volatility: "Medium" },
  { symbol: "MSFT", name: "Microsoft", category: "stocks" as const, volatility: "Medium" },
  { symbol: "TSLA", name: "Tesla", category: "stocks" as const, volatility: "High" },
  { symbol: "EURUSD", name: "Euro/USD", category: "forex" as const, volatility: "Low" },
  { symbol: "GBPUSD", name: "Pound/USD", category: "forex" as const, volatility: "Low" },
]

// Trading strategies
const tradingStrategies = [
  { id: 'scalping', name: 'Scalping', description: 'Fast trades, small profits', risk: 'High' },
  { id: 'swing', name: 'Swing Trading', description: 'Medium-term positions', risk: 'Medium' },
  { id: 'martingale', name: 'Martingale', description: 'Double after losses', risk: 'Very High' },
  { id: 'trend', name: 'Trend Following', description: 'Follow market trends', risk: 'Low' },
]

export default function BotTradingPage() {
  const { currentWallet, userProfile, refreshAllData } = useAuth()
  const [selectedAsset, setSelectedAsset] = useState<(typeof tradingAssets)[0] | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState('scalping')
  const [botTrades, setBotTrades] = useState<any[]>([])
  const [botBalance, setBotBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Bot configuration
  const [botConfig, setBotConfig] = useState({
    riskPercent: 2,
    takeProfit: 5,
    stopLoss: 2,
    leverage: 1,
    maxPositionSize: 1000,
    tradingHours: '24/7' as const,
  })

  useEffect(() => {
    loadBotData()
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadBotData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadBotData = async () => {
    if (refreshing) return
    
    try {
      setRefreshing(true)
      const [trades, balance] = await Promise.all([
        getActiveBotTrades(),
        getBotTradingBalance()
      ])
      setBotTrades(trades || [])
      setBotBalance(balance || 0)
    } catch (error: any) {
      console.error('Failed to load bot data:', error)
      toast.error(error.message || "Failed to load bot data")
    } finally {
      setRefreshing(false)
    }
  }

  const handleStartBotTrade = async () => {
    if (!selectedAsset) {
      toast.error("Please select a trading asset")
      return
    }

    if (botBalance <= 0) {
      toast.error("No bot trading balance available")
      return
    }

    setLoading(true)
    try {
      await createBotTrade(
        selectedAsset.symbol,
        selectedAsset.category,
        selectedStrategy as any,
        botConfig
      )
      
      toast.success(`Bot started trading ${selectedAsset.symbol} with ${selectedStrategy} strategy`)
      await loadBotData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to start bot trade")
    } finally {
      setLoading(false)
    }
  }

  const handleStopBotTrade = async (botTradeId: string) => {
    try {
      const result = await stopBotTrade(botTradeId)
      const message = result.profitLoss >= 0 
        ? `Bot trade stopped with profit of $${result.profitLoss.toFixed(2)}`
        : `Bot trade stopped with loss of $${Math.abs(result.profitLoss).toFixed(2)}`
      
      toast.success(message)
      await loadBotData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to stop bot trade")
    }
  }

  const handlePauseBotTrade = async (botTradeId: string) => {
    try {
      await pauseBotTrade(botTradeId)
      toast.success("Bot trade paused")
      await loadBotData()
    } catch (error: any) {
      toast.error(error.message || "Failed to pause bot trade")
    }
  }

  const handleResumeBotTrade = async (botTradeId: string) => {
    try {
      await resumeBotTrade(botTradeId)
      toast.success("Bot trade resumed")
      await loadBotData()
    } catch (error: any) {
      toast.error(error.message || "Failed to resume bot trade")
    }
  }

  // Calculate stats
  const totalAllocated = botTrades.reduce((sum, trade) => sum + (trade.metadata?.allocated_balance || 0), 0)
  const totalProfitLoss = botTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0)
  const activeBotsCount = botTrades.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bot Trading</h1>
          <p className="text-muted-foreground">Automated trading with AI-powered strategies</p>
        </div>
     
      </div>

      {/* Account Status Bar */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trading Account</p>
              <p className="text-lg font-semibold">
                {userProfile?.account_type === 'demo' ? 'Demo Account' : 'Live Account'}
                {userProfile?.account_type === 'demo' && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                    Practice Mode
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bot Balance</p>
              <p className="text-2xl font-bold text-primary">${botBalance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold">{activeBotsCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalProfitLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Create New Bot */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Select Trading Asset
              </h3>
              <span className="text-sm text-muted-foreground">{tradingAssets.length} assets available</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tradingAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedAsset?.symbol === asset.symbol
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-left">{asset.symbol}</h4>
                      <p className="text-sm text-muted-foreground text-left">{asset.name}</p>
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
                    <span className="text-xs text-muted-foreground">{asset.category}</span>
                    {selectedAsset?.symbol === asset.symbol && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Strategy Selection */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Select Trading Strategy
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {tradingStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedStrategy === strategy.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{strategy.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      strategy.risk === 'Very High' ? 'bg-red-500/10 text-red-500' :
                      strategy.risk === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      strategy.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {strategy.risk} Risk
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Bot Configuration */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Bot Configuration
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setBotConfig({
                    riskPercent: 2,
                    takeProfit: 5,
                    stopLoss: 2,
                    leverage: 1,
                    maxPositionSize: 1000,
                    tradingHours: '24/7',
                  })
                }}
              >
                Reset to Default
              </Button>
            </div>

            <div className="space-y-6">
              {/* Risk Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Risk per Trade</label>
                  <span className="text-sm text-primary">{botConfig.riskPercent}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={botConfig.riskPercent}
                  onChange={(e) => setBotConfig({...botConfig, riskPercent: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative (1%)</span>
                  <span>Aggressive (10%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Take Profit</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={botConfig.takeProfit}
                      onChange={(e) => setBotConfig({...botConfig, takeProfit: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                      min="1"
                      max="50"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Stop Loss</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={botConfig.stopLoss}
                      onChange={(e) => setBotConfig({...botConfig, stopLoss: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                      min="1"
                      max="20"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Leverage</label>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBotConfig({...botConfig, leverage: value})}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                        botConfig.leverage === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {value}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Trading Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Trading Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Balance:</span>
                    <span className="font-medium">${botBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Amount:</span>
                    <span className="font-medium">${(botBalance * botConfig.riskPercent / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Position Size:</span>
                    <span className="font-medium">${(botBalance * botConfig.riskPercent / 100 * botConfig.leverage).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Profit:</span>
                    <span className="font-medium text-green-500">
                      +${(botBalance * botConfig.riskPercent / 100 * botConfig.leverage * botConfig.takeProfit / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Loss:</span>
                    <span className="font-medium text-red-500">
                      -${(botBalance * botConfig.riskPercent / 100 * botConfig.leverage * botConfig.stopLoss / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Bot Button */}
              <Button
                onClick={handleStartBotTrade}
                disabled={!selectedAsset || botBalance <= 0 || loading}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                {loading ? (
                  <>Starting Bot...</>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Bot Trading
                  </>
                )}
              </Button>

              {botBalance <= 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    No bot trading balance available. Transfer funds from your main balance.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Active Bots & Stats */}
        <div className="space-y-6">
          {/* Active Bots */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Active Bots ({botTrades.length})
              </h3>
              <span className="text-sm text-muted-foreground">
                ${totalAllocated.toFixed(2)} allocated
              </span>
            </div>

            {botTrades.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No active bot trades</p>
                <p className="text-sm text-muted-foreground mt-1">Start your first bot above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {botTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-4 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{trade.symbol}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                            {trade.strategy}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trade.status === 'active' ? 'bg-green-500/10 text-green-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {trade.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allocated: ${trade.metadata?.allocated_balance?.toFixed(2) || '0.00'}
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
                      <div className="flex items-center gap-4">
                        <span>Entry: ${trade.entry_price?.toFixed(2)}</span>
                        <span>Current: ${trade.current_price?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(trade.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {trade.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseBotTrade(trade.id)}
                          className="flex-1"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeBotTrade(trade.id)}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStopBotTrade(trade.id)}
                        className="flex-1"
                      >
                        <StopCircle className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Risk Warning */}
          <Card className="p-6 bg-red-500/5 border-red-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-500 mb-2">Risk Warning</h4>
                <p className="text-sm text-muted-foreground">
                  Bot trading involves significant risk. Past performance is not indicative of future results. 
                  You may lose all of your allocated funds. Only trade with money you can afford to lose.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}