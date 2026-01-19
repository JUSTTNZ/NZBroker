"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Bot, Play, StopCircle, TrendingUp, 
  DollarSign, Zap, Shield, 
  RefreshCw, Rocket, Brain, 
  Crown, Target, Bitcoin,
  Settings, LineChart, Apple,
  BarChart3, Clock, Coins,
  TrendingUp as TrendingUpIcon,
  Sparkles,
  Lock,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { 
  createBotTrade, 
  stopBotTrade, 
  getActiveBotTrades, 
  getBotTradingBalance,


} from "@/components/action/bot-trading"
import { useRouter } from "next/navigation"

const botTypes = [
  {
    id: 'scalper',
    name: 'Scalper Bot',
    description: 'Fast trades, quick profits',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500 bg-yellow-500/10',
    stats: '5-25% profit',
    minBalance: 100,
    minPlan: 'basic'
  },
  {
    id: 'trend',
    name: 'Trend Follower',
    description: 'Follows market trends',
    icon: <LineChart className="w-5 h-5" />,
    color: 'text-green-500 bg-green-500/10',
    stats: '5-25% profit',
    minBalance: 500,
    minPlan: 'pro'
  },
  {
    id: 'ai',
    name: 'AI Trader',
    description: 'Machine learning powered',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-500 bg-purple-500/10',
    stats: '5-25% profit',
    minBalance: 1000,
    minPlan: 'pro'
  },
  {
    id: 'premium',
    name: 'Premium Bot',
    description: 'High-performance trading',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-orange-500 bg-orange-500/10',
    stats: '5-25% profit',
    minBalance: 5000,
    minPlan: 'elite'
  }
]

const tradingAssets = [
  { symbol: "BTC", name: "Bitcoin", icon: <Bitcoin className="w-6 h-6" />, basePrice: 45000 },
  { symbol: "ETH", name: "Ethereum", icon: <Coins className="w-6 h-6" />, basePrice: 2500 },
  { symbol: "AAPL", name: "Apple", icon: <Apple className="w-6 h-6" />, basePrice: 180 },
  { symbol: "TSLA", name: "Tesla", icon: <TrendingUpIcon className="w-6 h-6" />, basePrice: 210 },
  { symbol: "EURUSD", name: "Euro/USD", icon: <DollarSign className="w-6 h-6" />, basePrice: 1.08 },
  { symbol: "XAUUSD", name: "Gold", icon: <Sparkles className="w-6 h-6" />, basePrice: 2050 },
]

export default function BotTradingPage() {
  const router = useRouter()
  const { currentWallet, userProfile, refreshAllData, userPlans } = useAuth()
  const [selectedBot, setSelectedBot] = useState('trend')
  const [selectedAsset, setSelectedAsset] = useState("BTC")
  const [botTrades, setBotTrades] = useState<any[]>([])
  const [botBalance, setBotBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
function calculateProfitPercentageForAmount(amount: number): number {
    if (amount >= 10000) return 40      // was 25
    if (amount >= 5000) return 35       // was 20
    if (amount >= 2500) return 30       // was 15
    if (amount >= 1000) return 25       // was 10
    if (amount >= 500) return 22        // was 8
    if (amount >= 250) return 20        // was 6
    if (amount >= 100) return 15        // was 80 (or 8 if typo)
    return 10                           // was 3
}
  
   function calculateExpectedProfitForUI(
    investment: number,
    tradingMode: 'conservative' | 'balanced' | 'aggressive'
  ): number {
    const basePercentage = calculateProfitPercentageForAmount(investment)
    const modeMultiplier = {
      'conservative': 50,
      'balanced': 80,
      'aggressive': 90
    }[tradingMode] || 1
    
    const baseProfit = (investment * basePercentage) / 100
    return baseProfit * modeMultiplier
  }
  const [config, setConfig] = useState({
    investmentAmount: 100,
    autoReinvest: true,
    tradingMode: 'balanced' as 'conservative' | 'balanced' | 'aggressive',
  })

  const currentPlan = userProfile?.current_plan || "basic"
  const canUseBotTrading = currentPlan !== "basic"
  
  // Calculate using imported functions
  const profitPercentage = (config.investmentAmount)
  const expectedProfit = calculateExpectedProfitForUI(config.investmentAmount, config.tradingMode)
  const totalPayout = config.investmentAmount + expectedProfit

  useEffect(() => {
    if (canUseBotTrading) {
      loadBotData()
      const interval = setInterval(loadBotData, 10000)
      return () => clearInterval(interval)
    }
  }, [canUseBotTrading])

  const loadBotData = async () => {
    if (refreshing || !canUseBotTrading) return
    
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
  console.log('[handleStartBotTrade] Starting bot trade process...');
  console.log('[handleStartBotTrade] User plan:', currentPlan);
  console.log('[handleStartBotTrade] Can use bot trading?', canUseBotTrading);
  console.log('[handleStartBotTrade] Bot balance:', botBalance, 'Investment:', config.investmentAmount);

  if (!canUseBotTrading) {
    console.warn('[handleStartBotTrade] User needs upgrade');
    toast.error("Upgrade to Pro or Elite plan to use bot trading");
    router.push('/dashboard/upgrade');
    return;
  }

  if (botBalance < config.investmentAmount) {
    console.warn('[handleStartBotTrade] Insufficient balance:', botBalance, '<', config.investmentAmount);
    toast.error("Insufficient bot trading balance");
    return;
  }

  const selectedBotType = botTypes.find(b => b.id === selectedBot);
  console.log('[handleStartBotTrade] Selected bot type:', selectedBotType);
  
  if (!selectedBotType) {
    console.error('[handleStartBotTrade] Invalid bot selected:', selectedBot);
    toast.error("Invalid bot selection");
    return;
  }

  const planLevels = { 'basic': 0, 'pro': 1, 'elite': 2 };
  const userPlanLevel = planLevels[currentPlan as keyof typeof planLevels] || 0;
  const botPlanLevel = planLevels[selectedBotType.minPlan as keyof typeof planLevels] || 0;
  
  console.log('[handleStartBotTrade] Plan check - User level:', userPlanLevel, 'Bot required:', botPlanLevel);

  if (userPlanLevel < botPlanLevel) {
    console.warn('[handleStartBotTrade] Plan insufficient:', currentPlan, 'for', selectedBotType.minPlan);
    toast.error(`This bot requires ${selectedBotType.minPlan} plan or higher`);
    router.push('/dashboard/upgrade');
    return;
  }

  console.log('[handleStartBotTrade] All checks passed, creating bot trade...');
  setLoading(true);
  
  try {
    const result = await createBotTrade(
      selectedAsset || "BTC",
      "crypto",
      selectedBotType.id as any,
      {
        maxPositionSize: config.investmentAmount,
        tradingMode: config.tradingMode,
        autoReinvest: config.autoReinvest,
        botType: selectedBotType.id,
        takeProfit: profitPercentage
      }
    );
    
    console.log('[handleStartBotTrade] Bot trade created successfully:', result);
    toast.success(`${selectedBotType.name} started successfully for 7 days!`);
    
    await loadBotData();
    await refreshAllData?.();
    console.log('[handleStartBotTrade] Data refreshed');
    
  } catch (error: any) {
    console.error('[handleStartBotTrade] Error creating bot trade:', error);
    toast.error(error.message || "Failed to start bot");
  } finally {
    setLoading(false);
    console.log('[handleStartBotTrade] Process completed');
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

  const availableBots = botTypes.filter(bot => {
    const planLevels = { 'basic': 0, 'pro': 1, 'elite': 2 }
    const userPlanLevel = planLevels[currentPlan as keyof typeof planLevels] || 0
    const botPlanLevel = planLevels[bot.minPlan as keyof typeof planLevels] || 0
    return userPlanLevel >= botPlanLevel
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Trading Bots</h1>
          <p className="text-muted-foreground mt-1">7-day automated trading with smart algorithms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`capitalize px-3 py-1 ${
            currentPlan === 'elite' ? 'bg-purple-500/20 text-purple-600 border-purple-500/30' :
            currentPlan === 'pro' ? 'bg-blue-500/20 text-blue-600 border-blue-500/30' :
            'bg-gray-500/20 text-gray-600 border-gray-500/30'
          }`}>
            {currentPlan} Plan
          </Badge>
        </div>
      </div>

      {/* Plan Restriction Warning */}
      {!canUseBotTrading && (
        <Card className="p-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Lock className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-600 mb-1">Bot Trading Locked</h3>
              <p className="text-yellow-600/80 mb-3">
                Upgrade to Pro or Elite plan to unlock bot trading features. 7-day automated trading with profits up to 25%.
              </p>
              <Button 
                onClick={() => router.push('/dashboard/upgrade')}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Overview - Only show if can use bot trading */}
      {canUseBotTrading && (
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
      )}

      {/* Main Content - Only show if can use bot trading */}
      {canUseBotTrading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Setup */}
          <div className="space-y-6">
            {/* Bot Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Choose Your Bot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableBots.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => setSelectedBot(bot.id)}
                    className={`p-4 rounded-lg border text-left transition-all relative ${
                      selectedBot === bot.id 
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${bot.color}`}>
                        {bot.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{bot.name}</h4>
                          {bot.minPlan !== 'basic' && (
                            <Badge variant="outline" className="text-xs">
                              {bot.minPlan}
                            </Badge>
                          )}
                        </div>
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
                    <span className="text-xs text-muted-foreground mt-1">${asset.basePrice.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Bot Configuration</h3>
              
              <div className="space-y-6">
                {/* Investment Amount */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium">Investment Amount</label>
                    <span className="text-primary font-bold">${config.investmentAmount}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max={Math.min(50000, botBalance)}
                    step="100"
                    value={config.investmentAmount}
                    onChange={(e) => setConfig({...config, investmentAmount: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$100</span>
                    <span>Available: ${botBalance.toFixed(2)}</span>
                    <span>${Math.min(50000, botBalance).toLocaleString()}</span>
                  </div>
                  
                  {/* Profit percentage based on investment */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profit Percentage:</span>
                      <span className="text-lg font-bold text-green-500">
                        {profitPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher investment = Higher percentage return
                    </p>
                  </div>
                </div>

                {/* Trading Mode */}
                <div>
                  <label className="font-medium block mb-3">Trading Intensity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { mode: 'conservative', label: 'Conservative', desc: 'Lower risk', multiplier: '10x' },
                      { mode: 'balanced', label: 'Balanced', desc: 'Medium risk', multiplier: '30x' },
                      { mode: 'aggressive', label: 'Aggressive', desc: 'Higher reward', multiplier: '50x' },
                    ].map(({ mode, label, desc, multiplier }) => (
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
                        <div className="text-xs font-medium text-green-500 mt-1">{multiplier} profit boost</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Reinvest */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="font-medium">Auto Reinvest Profits</label>
                    <p className="text-sm text-muted-foreground mt-1">Automatically compound earnings for next trade</p>
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
              <h3 className="text-lg font-semibold mb-6">Launch 7-Day Bot</h3>
              
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
                      <span className="text-muted-foreground">Profit Percentage:</span>
                      <span className="font-bold text-green-500">
                        {profitPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trading Duration:</span>
                      <span className="font-bold text-blue-500">7 days (Fixed)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Profit:</span>
                      <span className="font-bold text-green-500">
                        ${expectedProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t">
                      <span>Total at Completion (7 days):</span>
                      <span className="text-green-500">
                        ${totalPayout.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Calculator */}
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium mb-3 text-green-600 dark:text-green-400">Profit Calculator</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Investment:</span>
                      <span className="font-medium">${config.investmentAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Profit Percentage:</span>
                      <span className="font-medium text-green-600">
                        {profitPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mode Boost ({config.tradingMode}):</span>
                      <span className="font-medium">
                        {
                          config.tradingMode === 'conservative' ? '50x' :
                          config.tradingMode === 'balanced' ? '80x' : '90x'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span>Expected Profit (7 days):</span>
                      <span className="text-green-600 dark:text-green-400">
                        ${expectedProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total Payout:</span>
                      <span className="text-green-600 dark:text-green-400 text-lg">
                        ${totalPayout.toFixed(2)}
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
    <div className="space-y-4">
      {botTrades.map((trade) => {
        const profit = Math.max(0, trade.profit_loss || 0)
        const allocatedBalance = trade.metadata?.allocated_balance || 0
        const expectedProfit = trade.metadata?.expectedProfit || 0
        const progress = trade.metadata?.progress || 0
        
        // FIXED: Calculate days correctly
        const startDate = trade.metadata?.startDate ? new Date(trade.metadata.startDate) : new Date(trade.created_at)
        const endDate = trade.metadata?.endDate ? new Date(trade.metadata.endDate) : new Date(startDate)
        endDate.setDate(startDate.getDate() + 7) // Add 7 days to start date
        
        const now = new Date()
        
        // Calculate total days in the bot duration (always 7 days)
        const totalDays = 7
        
        // Calculate days passed (cannot be negative or exceed total days)
        const timePassed = Math.max(0, now.getTime() - startDate.getTime())
        const daysPassed = Math.min(totalDays, timePassed / (1000 * 60 * 60 * 24))
        
        // Calculate days remaining (cannot be negative)
        const timeRemaining = Math.max(0, endDate.getTime() - now.getTime())
        const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24)
        
        // Current day number (1-7)
        const currentDay = Math.min(7, Math.max(1, Math.ceil(daysPassed)))
        
        // Format days remaining nicely
        const formatDaysRemaining = () => {
          if (daysRemaining <= 0) return 'Completed'
          if (daysRemaining < 1) {
            const hours = Math.ceil(daysRemaining * 24)
            return `${hours} hour${hours !== 1 ? 's' : ''}`
          }
          if (daysRemaining < 2) return '1 day'
          return `${Math.floor(daysRemaining)} days`
        }
        
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
                  <Badge variant="outline" className="text-xs">
                    {trade.metadata?.botType || 'trend'} Bot
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invested: ${allocatedBalance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Day {currentDay} of 7
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-500">+${profit.toFixed(2)}</p>
                <p className="text-sm text-green-500">
                  +{((profit / allocatedBalance) * 100 || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress: {progress.toFixed(1)}%</span>
                <span>Expected: ${expectedProfit.toFixed(2)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatDaysRemaining()} remaining</span>
                <span>${(allocatedBalance + expectedProfit).toFixed(2)} at completion</span>
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

            {/* Earning Explanation */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">How Earnings Work</h4>
                  <ul className="space-y-2 text-sm text-green-600/80">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                      <span><strong>Higher Investment = Higher %:</strong> $100 gets 5%, $1000 gets 10%, $5000 gets 20%, $10000+ gets 25%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                      <span><strong>Fixed 7-Day Cycle:</strong> All bots run for exactly 7 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                      <span><strong>Trading Mode Multiplier:</strong> Conservative (1x), Balanced (1.5x), Aggressive (2x)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                      <span><strong>Auto-Stop & Payout:</strong> Bot stops automatically after 7 days, profits are paid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                      <span><strong>Admin Speed Up:</strong> Admin can increase progress faster if needed</span>
                    </li>
                  </ul>
                </div>
              </div>
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
      )}

      {/* Upgrade Prompt for Basic Plan Users */}
      {!canUseBotTrading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {botTypes.slice(1).map((bot) => (
            <Card key={bot.id} className="p-6 border-border/40 relative">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <Lock className="w-12 h-12 text-white mx-auto mb-3" />
                  <h4 className="text-white font-bold text-lg mb-2">{bot.name} Locked</h4>
                  <p className="text-white/80 mb-4">Requires {bot.minPlan} Plan</p>
                  <Button 
                    onClick={() => router.push('/dashboard/upgrade')}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    Upgrade to {bot.minPlan}
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-50">
                <div className={`p-3 rounded-lg ${bot.color}`}>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}