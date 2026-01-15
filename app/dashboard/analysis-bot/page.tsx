"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bot, Play, StopCircle, TrendingUp, 
  DollarSign, Zap, Shield, 
  RefreshCw, Rocket, Brain, 
  Crown, Target, Bitcoin,
  Settings, LineChart, Apple,
  BarChart3, Clock, Coins,
  TrendingUp as TrendingUpIcon,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { 
  createBotTrade, 
  stopBotTrade, 
  getActiveBotTrades, 
  getBotTradingBalance
} from "@/components/action/bot-trading"
import { useRouter } from "next/navigation"

const botTypes = [
  {
    id: 'scalper',
    name: 'Scalper Bot',
    description: 'Fast trades, quick profits',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500 bg-yellow-500/10',
    stats: '0.5-2% daily',
    minBalance: 100
  },
  {
    id: 'trend',
    name: 'Trend Follower',
    description: 'Follows market trends',
    icon: <LineChart className="w-5 h-5" />,
    color: 'text-green-500 bg-green-500/10',
    stats: '1-3% daily',
    minBalance: 500
  },
  {
    id: 'ai',
    name: 'AI Trader',
    description: 'Machine learning powered',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-500 bg-purple-500/10',
    stats: '2-5% daily',
    minBalance: 1000
  },
  {
    id: 'premium',
    name: 'Premium Bot',
    description: 'High-performance trading',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-orange-500 bg-orange-500/10',
    stats: '5-15% daily',
    minBalance: 5000
  }
]

const tradingAssets = [
  { symbol: "BTC", name: "Bitcoin", icon: <Bitcoin className="w-6 h-6" /> },
  { symbol: "ETH", name: "Ethereum", icon: <Coins className="w-6 h-6" /> },
  { symbol: "AAPL", name: "Apple", icon: <Apple className="w-6 h-6" /> },
  { symbol: "TSLA", name: "Tesla", icon: <TrendingUpIcon className="w-6 h-6" /> },
  { symbol: "EURUSD", name: "Euro/USD", icon: <DollarSign className="w-6 h-6" /> },
  { symbol: "XAUUSD", name: "Gold", icon: <Sparkles className="w-6 h-6" /> },
]

export default function BotTradingPage() {
  const router = useRouter()
  const { currentWallet, userProfile, refreshAllData } = useAuth()
  const [selectedBot, setSelectedBot] = useState('scalper')
  const [selectedAsset, setSelectedAsset] = useState("BTC")
  const [botTrades, setBotTrades] = useState<any[]>([])
  const [botBalance, setBotBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const [config, setConfig] = useState({
    investmentAmount: 100,
    takeProfit: 5,
    autoReinvest: true,
    tradingMode: 'balanced' as 'conservative' | 'balanced' | 'aggressive'
  })

  useEffect(() => {
    loadBotData()
    const interval = setInterval(loadBotData, 10000)
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
    } finally {
      setRefreshing(false)
    }
  }

  const handleStartBotTrade = async () => {
    if (botBalance < config.investmentAmount) {
      toast.error("Insufficient bot trading balance")
      return
    }

    const selectedBotType = botTypes.find(b => b.id === selectedBot)
    if (!selectedBotType) {
      toast.error("Invalid bot selection")
      return
    }

    setLoading(true)
    try {
      await createBotTrade(
        selectedAsset || "BTC",
        "crypto",
        selectedBotType.id as any,
        {
          riskPercent: 0,
          takeProfit: config.takeProfit,
          stopLoss: 0,
          leverage: 1,
          maxPositionSize: config.investmentAmount,
          tradingHours: '24/7',
          botType: selectedBotType.id,
          autoReinvest: config.autoReinvest,
          tradingMode: config.tradingMode
        }
      )
      
      toast.success(`${selectedBotType.name} started successfully!`)
      await loadBotData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to start bot")
    } finally {
      setLoading(false)
    }
  }

  const handleStopBotTrade = async (botTradeId: string) => {
    try {
      const result = await stopBotTrade(botTradeId)
      toast.success(`Bot stopped! Profit: $${result.profitLoss.toFixed(2)}`)
      await loadBotData()
      await refreshAllData?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to stop bot")
    }
  }

  const totalAllocated = botTrades.reduce((sum, trade) => sum + (trade.metadata?.allocated_balance || 0), 0)
  const totalProfit = botTrades.reduce((sum, trade) => sum + Math.max(0, trade.profit_loss || 0), 0)
  const activeBotsCount = botTrades.length

  const selectedBotDetails = botTypes.find(b => b.id === selectedBot)
  const selectedAssetDetails = tradingAssets.find(a => a.symbol === selectedAsset)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Trading Bots</h1>
          <p className="text-muted-foreground mt-1">Automated trading with smart algorithms</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* <Button 
            variant="outline" 
            size="sm"
            onClick={loadBotData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button> */}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bot Balance</p>
              <p className="text-xl font-bold">${botBalance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-xl font-bold text-green-500">+${totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Bots</p>
              <p className="text-xl font-bold">{activeBotsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="text-xl font-bold">${totalAllocated.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Setup */}
        <div className="space-y-6">
          {/* Bot Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Choose Your Bot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {botTypes.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBot(bot.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedBot === bot.id 
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${bot.color}`}>
                      {bot.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{bot.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{bot.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-medium text-green-500">{bot.stats}</span>
                        <span className="text-xs text-muted-foreground">Min: ${bot.minBalance}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Asset Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Trading Asset</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tradingAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`p-4 rounded-lg border flex flex-col items-center transition-all ${
                    selectedAsset === asset.symbol
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${
                    selectedAsset === asset.symbol ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {asset.icon}
                  </div>
                  <span className="font-medium text-sm">{asset.symbol}</span>
                  <span className="text-xs text-muted-foreground mt-1">{asset.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Bot Configuration</h3>
            
            {/* Investment Amount */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Investment Amount</label>
                  <span className="text-primary font-bold">${config.investmentAmount}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max={Math.min(10000, botBalance)}
                  step="100"
                  value={config.investmentAmount}
                  onChange={(e) => setConfig({...config, investmentAmount: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$100</span>
                  <span>Available: ${botBalance.toFixed(2)}</span>
                  <span>${Math.min(10000, botBalance).toLocaleString()}</span>
                </div>
              </div>

              {/* Profit Target */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Profit Target</label>
                  <span className="text-green-500 font-bold">{config.takeProfit}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={config.takeProfit}
                  onChange={(e) => setConfig({...config, takeProfit: parseInt(e.target.value)})}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1%</span>
                  <span>10%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Trading Mode */}
              <div>
                <label className="font-medium block mb-3">Trading Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { mode: 'conservative', label: 'Conservative', desc: 'Lower risk' },
                    { mode: 'balanced', label: 'Balanced', desc: 'Medium risk' },
                    { mode: 'aggressive', label: 'Aggressive', desc: 'Higher reward' },
                  ].map(({ mode, label, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setConfig({...config, tradingMode: mode as any})}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        config.tradingMode === mode
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Reinvest */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="font-medium">Auto Reinvest Profits</label>
                  <p className="text-sm text-muted-foreground mt-1">Automatically compound earnings</p>
                </div>
                <button
                  onClick={() => setConfig({...config, autoReinvest: !config.autoReinvest})}
                  className={`w-12 h-6 rounded-full transition-all ${
                    config.autoReinvest ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                    config.autoReinvest ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Launch & Active Bots */}
        <div className="space-y-6">
          {/* Launch Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Launch Bot</h3>
            
            {/* Summary */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Trading Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Bot:</span>
                    <span className="font-medium">{selectedBotDetails?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trading Asset:</span>
                    <span className="font-medium flex items-center gap-2">
                      {selectedAssetDetails?.icon}
                      {selectedAssetDetails?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment:</span>
                    <span className="font-bold">${config.investmentAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Profit:</span>
                    <span className="font-bold text-green-500">{config.takeProfit}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Profit:</span>
                    <span className="font-bold text-green-500">
                      ${(config.investmentAmount * config.takeProfit / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profit Calculator */}
              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium mb-3 text-green-600 dark:text-green-400">Profit Calculator</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Profit:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${(config.investmentAmount * config.takeProfit / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Profit:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${(config.investmentAmount * config.takeProfit / 100 * 7).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Profit:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${(config.investmentAmount * config.takeProfit / 100 * 30).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <Button
              onClick={handleStartBotTrade}
              disabled={loading || botBalance < config.investmentAmount}
              className="w-full py-6 text-lg font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Starting Bot...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Trading Bot
                </>
              )}
            </Button>

            {botBalance < config.investmentAmount && (
              <p className="text-sm text-red-500 mt-3 text-center">
                Insufficient balance. Add funds to continue.
              </p>
            )}
          </Card>

          {/* Active Bots */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Active Bots</h3>
                <p className="text-sm text-muted-foreground">{activeBotsCount} bots running</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadBotData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {botTrades.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No active bots</p>
                <p className="text-sm text-muted-foreground mt-1">Launch your first bot to start earning</p>
              </div>
            ) : (
              <div className="space-y-3">
                {botTrades.map((trade) => {
                  const profit = Math.max(0, trade.profit_loss || 0)
                  return (
                    <div
                      key={trade.id}
                      className="p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{trade.symbol}</h4>
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Invested: ${trade.metadata?.allocated_balance?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">+${profit.toFixed(2)}</p>
                          <p className="text-sm text-green-500">
                            +{((profit / trade.metadata?.allocated_balance) * 100 || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>Target: {trade.metadata?.takeProfit || 5}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Running</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopBotTrade(trade.id)}
                        className="w-full"
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop Bot & Take Profit
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Safety Info */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-500 mb-2">Risk Management</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                    <span>Smart stop mechanisms prevent losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                    <span>24/7 market monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                    <span>Auto-protection during volatility</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}