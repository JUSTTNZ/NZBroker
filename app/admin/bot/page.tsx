// app/admin/bot/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  StopCircle,
  DollarSign,
  Calendar,
  User,
  Activity,
  Zap,
  TrendingDown,
  Database,
  LineChart,
  Users,
  Shield,
  Bot,
  ExternalLink,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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

  // Load bot trades with user profiles
  const loadBotTrades = useCallback(async () => {
    setLoading(true)
    try {
      console.log('[AdminBotManagement] Loading bot trades...')
      
      // Get all bot trades
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

      // Get user emails for all unique user IDs
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

      // Combine bot trades with profile data and parse JSON
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

  // Filter bot trades
  useEffect(() => {
    let filtered = [...botTrades]

    if (searchQuery) {
      filtered = filtered.filter(bot =>
        bot.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(bot => bot.status === statusFilter)
    }

    if (symbolFilter !== "all") {
      filtered = filtered.filter(bot => bot.symbol === symbolFilter)
    }

    if (strategyFilter !== "all") {
      filtered = filtered.filter(bot => bot.strategy === strategyFilter)
    }

    setFilteredTrades(filtered)
  }, [botTrades, searchQuery, statusFilter, symbolFilter, strategyFilter])

  // Load bot trades on mount
  useEffect(() => {
    loadBotTrades()
  }, [loadBotTrades])

  // Handle bot actions
 

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8" />
            Bot Trading Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all bot trades across the platform
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
          <Link href="/admin/updatebot">
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Update Bot Progress
            </Button>
          </Link>
        </div>
      </div>

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
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expectedProfit)}</div>
            <div className="text-xs text-muted-foreground">Total expected profit</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Find specific bot trades</CardDescription>
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Bot Trades ({filteredTrades.length})</CardTitle>
              <CardDescription>
                Showing {filteredTrades.length} of {botTrades.length} bot trades
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/updatebot">
                <Button variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Go to Progress Updates
                </Button>
              </Link>
            </div>
          </div>
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
                    <TableHead>Symbol</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>Status</TableHead>
                   
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
                          <div className="text-xs text-muted-foreground capitalize">{bot.strategy}</div>
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
                   
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}