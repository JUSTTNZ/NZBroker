// app/admin/updatebot/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  User,
  Activity,
  Edit,
  Play,
  Pause,
  StopCircle,
  AlertCircle,
  CheckCircle,
  Percent,
  TrendingDown,
  X,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  

  autoCompleteExpiredBots
} from "@/components/action/bot-trading"
import { adminPauseBotTrade, adminResumeBotTrade, adminStopBotTrade, adminUpdateBotProgress } from "@/components/action/admin-bot"

interface BotTrade {
  id: string;
  user_id: string;
  symbol: string;
  category: 'stocks' | 'crypto' | 'forex';
  strategy: string;
  status: 'active' | 'paused' | 'stopped' | 'completed' | 'running';
  entry_price: number;
  current_price?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  config: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  account_type?: 'demo' | 'live';
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export default function UpdateBotProgressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [runningBots, setRunningBots] = useState<BotTrade[]>([])
  const [selectedBot, setSelectedBot] = useState<BotTrade | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  // Load running bots
  const loadRunningBots = useCallback(async () => {
    setLoading(true)
    try {
      console.log('[UpdateBotProgress] Loading running bots...')
      
      // Get only running bots
      const { data: botTradesData, error: botError } = await supabase
        .from('bot_trades')
        .select('*')
  .in('status', ['running', 'paused'])  
        .order('created_at', { ascending: false })

      if (botError) {
        console.error('[UpdateBotProgress] Error loading bots:', botError)
        toast.error('Failed to load bots')
        return
      }

      console.log(`[UpdateBotProgress] Loaded ${botTradesData?.length || 0} running bots`)

      // Get user emails
      const userIds = [...new Set(botTradesData?.map(bot => bot.user_id) || [])]
      
      let userProfiles: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          userProfiles = profilesData.reduce((map: Record<string, any>, profile) => {
            map[profile.id] = profile
            return map
          }, {})
        }
      }

      // Combine with profile data
      const botTradesWithProfiles = botTradesData?.map(bot => {
        const config = typeof bot.config === 'string' ? JSON.parse(bot.config) : bot.config
        const metadata = typeof bot.metadata === 'string' ? JSON.parse(bot.metadata) : bot.metadata
        
        return {
          ...bot,
          config,
          metadata,
          profiles: userProfiles[bot.user_id] || { email: 'Unknown', full_name: null }
        }
      }) || []

      setRunningBots(botTradesWithProfiles)

      // Check if specific bot is requested via URL
      const botId = searchParams.get('botId')
      if (botId && botTradesWithProfiles.length > 0) {
        const bot = botTradesWithProfiles.find(b => b.id === botId)
        if (bot) {
          setSelectedBot(bot)
          setProgressValue(bot.metadata?.progress || 0)
        }
      }

    } catch (error) {
      console.error('[UpdateBotProgress] Error:', error)
      toast.error('Failed to load bots')
    } finally {
      setLoading(false)
    }
  }, [supabase, searchParams])

  // Load bots on mount
  useEffect(() => {
    loadRunningBots()
  }, [loadRunningBots])

  // Update bot progress
  const handleUpdateProgress = async () => {
    if (!selectedBot || !progressValue) {
      toast.error('Please select a bot and progress value')
      return
    }

    setUpdating(selectedBot.id)
    try {
      console.log(`[UpdateBotProgress] Updating progress for bot ${selectedBot.id} to ${progressValue}%`)
      
      const result = await adminUpdateBotProgress(selectedBot.id, progressValue)
      
      if (result.success) {
        toast.success(`Bot progress updated to ${result.progress}%`)
        
        // Update local state
        setRunningBots(prev => prev.map(bot => {
          if (bot.id === selectedBot.id) {
            return {
              ...bot,
              metadata: {
                ...bot.metadata,
                progress: result.progress,
                current_profit: result.currentProfit,
                admin_updated: true,
                admin_updated_at: new Date().toISOString()
              }
            }
          }
          return bot
        }))

        // Update selected bot
        const updatedBot = {
          ...selectedBot,
          metadata: {
            ...selectedBot.metadata,
            progress: result.progress,
            current_profit: result.currentProfit
          }
        }
        setSelectedBot(updatedBot)
        
      } else {
        toast.error('Failed to update bot progress')
      }
    } catch (error: any) {
      console.error('[UpdateBotProgress] Error updating progress:', error)
      toast.error(error.message || 'Failed to update bot progress')
    } finally {
      setUpdating(null)
    }
  }

  // Handle bot actions
  const handleBotAction = async (action: 'stop' | 'pause' | 'resume', botTradeId: string) => {
    setUpdating(botTradeId)
    try {
      let result
      switch (action) {
        case 'stop':
          result = await adminStopBotTrade(botTradeId)
          break
        case 'pause':
          result = await adminPauseBotTrade(botTradeId)
          break
        case 'resume':
          result = await adminResumeBotTrade(botTradeId)
          break
      }

      if (result?.success) {
        toast.success(`Bot ${action} operation successful`)
        await loadRunningBots() // Refresh data
        
        // If we stopped/paused the selected bot, clear selection
        if (action === 'stop' || action === 'pause') {
          setSelectedBot(null)
          setProgressValue(0)
        }
      }
    } catch (error: any) {
      console.error(`[UpdateBotProgress] Error ${action} bot:`, error)
      toast.error(error.message || `Failed to ${action} bot`)
    } finally {
      setUpdating(null)
    }
  }

  // Auto-complete expired bots
  const handleAutoCompleteExpired = async () => {
    try {
      await autoCompleteExpiredBots()
      toast.success('Auto-complete job started')
      await loadRunningBots() // Refresh data
    } catch (error) {
      console.error('[UpdateBotProgress] Error auto-completing bots:', error)
      toast.error('Failed to auto-complete bots')
    }
  }

  // Handle bot selection
  const handleSelectBot = (bot: BotTrade) => {
    setSelectedBot(bot)
    setProgressValue(bot.metadata?.progress || 0)
  }

  // Clear selection
  const handleClearSelection = () => {
    setSelectedBot(null)
    setProgressValue(0)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Calculate days remaining
  const calculateDaysRemaining = (metadata: any) => {
    if (!metadata?.endDate) return 'N/A'
    const endDate = new Date(metadata.endDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day'
    return `${diffDays} days`
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'text-red-500'
    if (progress < 50) return 'text-yellow-500'
    if (progress < 75) return 'text-blue-500'
    return 'text-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/bot">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bot Management
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="w-8 h-8" />
              Update Bot Progress
            </h1>
            <p className="text-muted-foreground">
              Manage and update running trading bots
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadRunningBots}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleAutoCompleteExpired}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Auto-Complete Expired
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bot List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Running Bots ({runningBots.length})
              </CardTitle>
              <CardDescription>Select a bot to update progress</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : runningBots.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No running bots</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There are no active bots to update
                  </p>
                  <Link href="/admin/bot">
                    <Button variant="outline">View All Bots</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {runningBots.map((bot) => (
                    <div
                      key={bot.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedBot?.id === bot.id ? 'bg-primary/10 border-primary' : 'bg-card'
                      }`}
                      onClick={() => handleSelectBot(bot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {bot.symbol}
                            <Badge variant={bot.account_type === 'live' ? 'destructive' : 'outline'} className="text-xs">
                              {bot.account_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{bot.strategy}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getProgressColor(bot.metadata?.progress || 0)}`}>
                            {bot.metadata?.progress?.toFixed(1) || 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(bot.metadata?.allocated_balance || 0)}
                          </div>
                        </div>
                      </div>
                      <Progress value={bot.metadata?.progress || 0} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Progress Update */}
        <div className="lg:col-span-2">
          {selectedBot ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {selectedBot.symbol}
                      <Badge variant="outline" className="capitalize">{selectedBot.strategy}</Badge>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Running
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedBot.profiles?.full_name || selectedBot.profiles?.email}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bot Control Actions */}
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    onClick={() => handleBotAction('pause', selectedBot.id)}
                    disabled={updating === selectedBot.id}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Bot
                  </Button> */}
                  <Button
                    variant="destructive"
                    onClick={() => handleBotAction('stop', selectedBot.id)}
                    disabled={updating === selectedBot.id}
                    className="flex-1"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Bot
                  </Button>
                </div>

                <Separator />

                {/* Current Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Progress</p>
                      <p className="text-2xl font-bold text-green-500">
                        {selectedBot.metadata?.progress?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className="text-lg font-medium">{calculateDaysRemaining(selectedBot.metadata)}</p>
                    </div>
                  </div>
                  <Progress value={selectedBot.metadata?.progress || 0} className="h-3" />
                </div>

                <Separator />

                {/* Financial Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="text-lg font-medium">
                      {formatCurrency(selectedBot.metadata?.allocated_balance || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Entry Price</p>
                    <p className="text-lg font-medium">
                      {selectedBot.entry_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expected Profit</p>
                    <p className="text-lg font-medium text-green-500">
                      {formatCurrency(selectedBot.config?.expectedProfit || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Current Profit</p>
                    <p className="text-lg font-medium">
                      {formatCurrency(selectedBot.metadata?.current_profit || 0)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Progress Update Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Update Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Set new progress percentage
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[25, 50, 75, 100].map((value) => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          onClick={() => setProgressValue(value)}
                          className={`h-8 px-2 ${progressValue === value ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                          {value}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Progress</span>
                      <span className="font-medium">{progressValue}%</span>
                    </div>
                    <Slider
                      value={[progressValue]}
                      onValueChange={(value) => setProgressValue(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Profit Preview */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="font-medium">Profit Preview</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Profit</p>
                        <p className="font-medium">
                          {formatCurrency(selectedBot.metadata?.current_profit || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">After Update</p>
                        <p className="font-medium text-green-500">
                          {formatCurrency((selectedBot.config?.expectedProfit || 0) * progressValue / 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit Increase</p>
                        <p className="font-medium text-green-500">
                          +{formatCurrency(
                            ((selectedBot.config?.expectedProfit || 0) * progressValue / 100) - 
                            (selectedBot.metadata?.current_profit || 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress Change</p>
                        <p className="font-medium">
                          {selectedBot.metadata?.progress?.toFixed(1) || 0}% → {progressValue}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Update Button */}
                  <Button
                    onClick={handleUpdateProgress}
                    disabled={updating === selectedBot.id || !progressValue}
                    className="w-full"
                    size="lg"
                  >
                    {updating === selectedBot.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Progress to {progressValue}%
                      </>
                    )}
                  </Button>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      Updating progress will recalculate the user's profit based on the new percentage. 
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Bot</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a running bot from the list to update its progress
                  </p>
                  {runningBots.length > 0 && (
                    <div className="max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">
                        Click on any bot to select it:
                      </p>
                      <div className="space-y-2">
                        {runningBots.slice(0, 3).map(bot => (
                          <div
                            key={bot.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSelectBot(bot)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{bot.symbol}</p>
                                <p className="text-xs text-muted-foreground capitalize">{bot.strategy}</p>
                              </div>
                              <Badge variant="outline" className={`${getProgressColor(bot.metadata?.progress || 0)}`}>
                                {bot.metadata?.progress || 0}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}