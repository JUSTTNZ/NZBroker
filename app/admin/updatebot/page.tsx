// app/admin/bot/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  StopCircle,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  ChevronRight,
  Shield,
  User,
  Mail,
  Activity,
  Zap,
  TrendingDown,
  Settings,
  Edit,
  Target,
  LineChart,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  updateBotProgress,
  stopBotTrade,
  pauseBotTrade,
  resumeBotTrade,
  autoCompleteExpiredBots
} from "@/components/action/bot-trading"
import { toast } from "sonner"

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

export default function AdminBotManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [botTrades, setBotTrades] = useState<BotTrade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<BotTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [symbolFilter, setSymbolFilter] = useState<string>("all")
  const [strategyFilter, setStrategyFilter] = useState<string>("all")
  const [selectedBot, setSelectedBot] = useState<BotTrade | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    completedBots: 0,
    pausedBots: 0,
    stoppedBots: 0,
    totalProfit: 0,
    totalInvestment: 0,
    expectedProfit: 0,
    todayProfit: 0,
  })
  const [symbols, setSymbols] = useState<string[]>([])
  const [strategies, setStrategies] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  // Load bot trades with user profiles
  const loadBotTrades = useCallback(async () => {
    setLoading(true)
    try {
      console.log('[AdminBotManagement] Loading bot trades...')
      
      // FIRST: Get all bot trades
      const { data: botTradesData, error: botError } = await supabase
        .from('bot_trades')
        .select('*')
        .order('created_at', { ascending: false })

      if (botError) {
        console.error('[AdminBotManagement] Error loading bot trades:', botError)
        toast.error('Failed to load bot trades')
        return
      }

      console.log(`[AdminBotManagement] Loaded ${botTradesData?.length || 0} bot trades`)

      // SECOND: Get user emails for all unique user IDs
      const userIds = [...new Set(botTradesData?.map(bot => bot.user_id) || [])]
      
      let userProfiles: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          // Create a map of user_id -> profile
          userProfiles = profilesData.reduce((map, profile) => {
            map[profile.id] = profile
            return map
          }, {})
        }
      }

      // THIRD: Combine bot trades with profile data and parse JSON
      const botTradesWithProfiles = botTradesData?.map(bot => {
        // Parse config and metadata from JSON strings
        const config = typeof bot.config === 'string' ? JSON.parse(bot.config) : bot.config
        const metadata = typeof bot.metadata === 'string' ? JSON.parse(bot.metadata) : bot.metadata
        
        return {
          ...bot,
          config,
          metadata,
          profiles: userProfiles[bot.user_id] || { email: 'Unknown', full_name: null }
        }
      }) || []

      console.log('[AdminBotManagement] Bot trades with profiles:', botTradesWithProfiles)
      setBotTrades(botTradesWithProfiles)
      
      // Extract unique symbols and strategies
      const uniqueSymbols = [...new Set(botTradesData?.map(bot => bot.symbol) || [])]
      const uniqueStrategies = [...new Set(botTradesData?.map(bot => bot.strategy) || [])]
      setSymbols(uniqueSymbols)
      setStrategies(uniqueStrategies)

    } catch (error) {
      console.error('[AdminBotManagement] Error:', error)
      toast.error('Failed to load bot trades')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Calculate statistics
  useEffect(() => {
    if (botTrades.length === 0) return

    const totalBots = botTrades.length
    const activeBots = botTrades.filter(b => b.status === 'running').length
    const completedBots = botTrades.filter(b => b.status === 'completed').length
    const pausedBots = botTrades.filter(b => b.status === 'paused').length
    const stoppedBots = botTrades.filter(b => b.status === 'stopped').length
    
    const totalProfit = botTrades.reduce((sum, bot) => sum + (bot.profit_loss || 0), 0)
    const totalInvestment = botTrades.reduce((sum, bot) => 
      sum + (bot.metadata?.allocated_balance || 0), 0
    )
    const expectedProfit = botTrades.reduce((sum, bot) => 
      sum + (bot.config?.expectedProfit || 0), 0
    )
    
    // Calculate today's profit (bots created today)
    const today = new Date().toDateString()
    const todayProfit = botTrades.reduce((sum, bot) => {
      const createdDate = new Date(bot.created_at).toDateString()
      return createdDate === today ? sum + (bot.profit_loss || 0) : sum
    }, 0)

    setStats({
      totalBots,
      activeBots,
      completedBots,
      pausedBots,
      stoppedBots,
      totalProfit,
      totalInvestment,
      expectedProfit,
      todayProfit,
    })
  }, [botTrades])

  // Filter bot trades based on search and filters
  useEffect(() => {
    let filtered = [...botTrades]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(bot =>
        bot.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(bot => bot.status === statusFilter)
    }

    // Apply symbol filter
    if (symbolFilter !== "all") {
      filtered = filtered.filter(bot => bot.symbol === symbolFilter)
    }

    // Apply strategy filter
    if (strategyFilter !== "all") {
      filtered = filtered.filter(bot => bot.strategy === strategyFilter)
    }

    setFilteredTrades(filtered)
    console.log(`[AdminBotManagement] Filtered to ${filtered.length} bot trades`)
  }, [botTrades, searchQuery, statusFilter, symbolFilter, strategyFilter])

  // Load bot trades on mount
  useEffect(() => {
    loadBotTrades()
  }, [loadBotTrades])

  // Update bot progress
  const handleUpdateProgress = async (botTradeId: string) => {
    if (!progressValue) {
      toast.error('Please select a progress value')
      return
    }

    setUpdating(botTradeId)
    try {
      console.log(`[AdminBotManagement] Updating progress for bot ${botTradeId} to ${progressValue}%`)
      
      const result = await updateBotProgress(botTradeId, progressValue)
      
      if (result.success) {
        toast.success(`Bot progress updated to ${result.progress}%`)
        
        // Update local state
        setBotTrades(prev => prev.map(bot => {
          if (bot.id === botTradeId) {
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

        // Clear selected bot
        setSelectedBot(null)
        setProgressValue(0)
      } else {
        toast.error('Failed to update bot progress')
      }
    } catch (error: any) {
      console.error('[AdminBotManagement] Error updating progress:', error)
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
          result = await stopBotTrade(botTradeId)
          break
        case 'pause':
          result = await pauseBotTrade(botTradeId)
          break
        case 'resume':
          result = await resumeBotTrade(botTradeId)
          break
      }

      if (result?.success) {
        toast.success(`Bot ${action} operation successful`)
        await loadBotTrades() // Refresh data
      }
    } catch (error: any) {
      console.error(`[AdminBotManagement] Error ${action} bot:`, error)
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
      await loadBotTrades() // Refresh data
    } catch (error) {
      console.error('[AdminBotManagement] Error auto-completing bots:', error)
      toast.error('Failed to auto-complete bots')
    }
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Running</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Paused</Badge>
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Completed</Badge>
      case 'stopped':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Stopped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

  // Get running bots for progress management
  const runningBots = botTrades.filter(bot => bot.status === 'running')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bot Trading Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all active bot trades, update progress, and handle bot operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadBotTrades}
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

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Progress Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBots}</div>
                <div className="text-xs text-muted-foreground">All bot trades</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.activeBots}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.pausedBots} paused • {stats.stoppedBots} stopped
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
                <div className="text-xs text-muted-foreground">Total allocated</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Today: {formatCurrency(stats.todayProfit)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.expectedProfit)}</div>
                <div className="text-xs text-muted-foreground">Total expected profit</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>Filter bot trades by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by symbol, strategy, or user email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="stopped">Stopped</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Symbols</SelectItem>
                      {symbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Trades Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Bot Trades ({filteredTrades.length})</CardTitle>
              <CardDescription>
                Showing {filteredTrades.length} of {botTrades.length} bot trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bot trades found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' ? 'Try changing your filters' : 'No bot trades available'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Symbol / Strategy</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Profit/Loss</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrades.map((bot) => (
                        <TableRow key={bot.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{bot.profiles?.full_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{bot.profiles?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bot.symbol}</div>
                              <div className="text-xs text-muted-foreground">{bot.strategy}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(bot.metadata?.allocated_balance || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{bot.metadata?.progress?.toFixed(1) || 0}%</span>
                                <span className="text-muted-foreground">
                                  {calculateDaysRemaining(bot.metadata)}
                                </span>
                              </div>
                              <Progress 
                                value={bot.metadata?.progress || 0} 
                                className="h-2" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${
                              (bot.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {(bot.profit_loss || 0) >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>
                                {formatCurrency(bot.profit_loss || 0)}
                              </span>
                              <span className="text-xs">
                                ({((bot.profit_loss || 0) / (bot.metadata?.allocated_balance || 1) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(bot.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(bot.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {bot.status === 'running' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedBot(bot)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBotAction('pause', bot.id)}
                                    disabled={updating === bot.id}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBotAction('stop', bot.id)}
                                    disabled={updating === bot.id}
                                  >
                                    <StopCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {bot.status === 'paused' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBotAction('resume', bot.id)}
                                  disabled={updating === bot.id}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PROGRESS MANAGEMENT */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Management Dashboard</CardTitle>
              <CardDescription>
                Update progress for running bots. Total active bots: {runningBots.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runningBots.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No running bots found</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no active bots to manage. All bots are either paused, stopped, or completed.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("overview")}>
                    View All Bots
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {runningBots.map((bot) => (
                    <Card key={bot.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{bot.symbol}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span className="capitalize">{bot.strategy}</span>
                              <Badge variant={bot.account_type === 'live' ? 'destructive' : 'outline'}>
                                {bot.account_type}
                              </Badge>
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            Running
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {bot.profiles?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {bot.profiles?.email || 'No email'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span>{bot.metadata?.progress?.toFixed(1) || 0}%</span>
                          </div>
                          <Progress value={bot.metadata?.progress || 0} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Days left: {calculateDaysRemaining(bot.metadata)}</span>
                            <span>Started: {formatDate(bot.created_at)}</span>
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Investment</p>
                            <p className="font-medium">{formatCurrency(bot.metadata?.allocated_balance || 0)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Expected Profit</p>
                            <p className="font-medium text-green-500">
                              {formatCurrency(bot.config?.expectedProfit || 0)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Current Profit</p>
                            <p className="font-medium">
                              {formatCurrency(bot.metadata?.current_profit || 0)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Entry Price</p>
                            <p className="font-medium">{bot.entry_price.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Quick Update Actions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Quick Update:</span>
                            <div className="flex gap-1">
                              {[25, 50, 75, 100].map((value) => (
                                <Button
                                  key={value}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => {
                                    setSelectedBot(bot)
                                    setProgressValue(value)
                                  }}
                                >
                                  {value}%
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedBot(bot)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Custom Update
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBotAction('stop', bot.id)}
                              disabled={updating === bot.id}
                            >
                              {updating === bot.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <StopCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

  

      {/* Update Progress Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Bot Progress</CardTitle>
              <CardDescription>
                Update progress for {selectedBot.symbol} ({selectedBot.strategy})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Progress: {selectedBot.metadata?.progress?.toFixed(1) || 0}%</span>
                  <span>Expected Profit: {formatCurrency(selectedBot.config?.expectedProfit || 0)}</span>
                </div>
                <div className="pt-6">
                  <label className="text-sm font-medium mb-2 block">
                    Set Progress: {progressValue}%
                  </label>
                  <Slider
                    value={[progressValue]}
                    onValueChange={(value) => setProgressValue(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Profit Preview */}
                {selectedBot.config?.expectedProfit && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Profit Preview</p>
                    <div className="flex justify-between text-sm">
                      <span>Current profit:</span>
                      <span>{formatCurrency(selectedBot.metadata?.current_profit || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>After update:</span>
                      <span className="text-green-500 font-medium">
                        {formatCurrency((selectedBot.config.expectedProfit * progressValue) / 100)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBot(null)
                    setProgressValue(0)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateProgress(selectedBot.id)}
                  disabled={updating === selectedBot.id || !progressValue}
                >
                  {updating === selectedBot.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Update Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}