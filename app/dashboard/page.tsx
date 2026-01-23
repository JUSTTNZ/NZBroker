"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp, TrendingDown, Eye, Wallet, CreditCard, ArrowUpRight,
  Settings, ArrowRightLeft, AlertCircle, Loader2, Bot, Activity,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react"
import { ScrollingTicker } from "@/components/scrolling-ticker"
import { AdvancedChartWidget, MiniSymbolChart, MarketOverviewWidget } from "@/components/tradingview-widgets"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getActiveBotTrades } from "@/components/action/bot-trading"

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: string
  payment_details: string
  admin_fee: number
  created_at: string
}

interface AdminMessage {
  message: string | null
  created_at: string | null
}

export default function DashboardPage() {
  const { user, userProfile, currentWallet, wallets, userPlans, refreshAllData, switchAccountType } = useAuth()
  const router = useRouter()
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false)
  const [pendingWithdrawal, setPendingWithdrawal] = useState<Withdrawal | null>(null)
  const [adminMessage, setAdminMessage] = useState<AdminMessage | null>(null)
  const [activeBotTrades, setActiveBotTrades] = useState<any[]>([])
  const [loadingBots, setLoadingBots] = useState(false)
  const [expandedBots, setExpandedBots] = useState<Set<string>>(new Set())

  const supportEmail = "support@barcrestcapital.com"

  // Calculate total profit (example - you should get this from transactions)
  const calculateTotalProfit = () => {
    if (!currentWallet) return 0
    // Example calculation: 5% of trading balance as profit
    return currentWallet.trading_balance * 0.05
  }

  const totalProfit = calculateTotalProfit()
  const accountBalance = currentWallet ? `$${currentWallet.total_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"
  const tradingBalance = currentWallet ? `$${currentWallet.trading_balance.toLocaleString()}` : "$0.00"
  const botBalance = currentWallet ? `$${currentWallet.bot_trading_balance.toLocaleString()}` : "$0.00"
  const bonusBalance = currentWallet ? `$${currentWallet.bonus_balance.toLocaleString()}` : "$0.00"

  const handleAccountSwitch = async (targetType?: "demo" | "live") => {
    if (!userProfile || isSwitchingAccount) return

    const newAccountType = targetType || (userProfile.account_type === "demo" ? "live" : "demo")

    // Don't switch if already on that account type
    if (userProfile.account_type === newAccountType) return

    setIsSwitchingAccount(true)
    try {
      await switchAccountType(newAccountType)
      // Refresh data after switching to get updated wallet balances
      await refreshAllData()
    } catch (error) {
      console.error("Failed to switch account:", error)
    } finally {
      setIsSwitchingAccount(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Find active plan
  const activePlan = userPlans?.find(plan => plan.status === "active")
  // Get current plan from user profile
  const currentPlan = userProfile?.current_plan || "basic"
useEffect(() => {
  const fetchPendingWithdrawal = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "payment_pending")
        .order("created_at", { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setPendingWithdrawal(data[0])
      } else {
        setPendingWithdrawal(null)
      }
    } catch (error) {
      console.error("Error fetching pending withdrawal:", error)
    }
  }

  fetchPendingWithdrawal()
}, [user])

// Fetch admin message
useEffect(() => {
  const fetchAdminMessage = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("admin_messages")
        .select("message, created_at")
        .eq("user_id", user.id)
        .single()

      if (data && data.message) {
        setAdminMessage({
          message: data.message,
          created_at: data.created_at
        })
      } else {
        setAdminMessage(null)
      }
    } catch (error) {
      // No message found is not an error
      setAdminMessage(null)
    }
  }

  fetchAdminMessage()
}, [user])

// Fetch active bot trades for current account type
const fetchActiveBots = async () => {
  if (!user || !userProfile) return

  // Only fetch if user has pro or elite plan (can use bot trading)
  if (userProfile.current_plan === 'basic') {
    setActiveBotTrades([])
    return
  }

  setLoadingBots(true)
  try {
    // Pass current account type to get trades for that account only
    const trades = await getActiveBotTrades(userProfile.account_type)
    setActiveBotTrades(trades || [])
  } catch (error: any) {
    if (error.message !== 'Authentication required') {
      console.error("Error fetching bot trades:", error)
    }
    setActiveBotTrades([])
  } finally {
    setLoadingBots(false)
  }
}

useEffect(() => {
  if (user && userProfile) {
    fetchActiveBots()
  }

  // Refresh every 10 seconds
  const interval = setInterval(() => {
    if (user && userProfile) {
      fetchActiveBots()
    }
  }, 10000)

  return () => clearInterval(interval)
// Re-fetch when account type changes
}, [user, userProfile?.account_type])
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in-up flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome back, {userProfile?.full_name || user?.email || "Trader"}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {userProfile?.account_type === "demo" 
              ? "You're trading with demo funds. Switch to Live to trade with real money." 
              : "You're trading with real funds. Trade responsibly!"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Account Type Toggle Buttons */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => handleAccountSwitch("demo")}
              disabled={isSwitchingAccount}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                userProfile?.account_type === "demo"
                  ? "bg-yellow-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isSwitchingAccount && userProfile?.account_type !== "demo" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Demo"
              )}
            </button>
            <button
              onClick={() => handleAccountSwitch("live")}
              disabled={isSwitchingAccount}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                userProfile?.account_type === "live"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isSwitchingAccount && userProfile?.account_type !== "live" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Live"
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Admin Danger Message */}
{adminMessage && adminMessage.message && (
  <Card className="p-4 md:p-6 bg-red-600/20 border-2 border-red-600/50 animate-fade-in-up mb-6 shadow-lg shadow-red-500/10">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-red-600 rounded-full flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-2">Important Notice</h3>
        <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap mb-4 leading-relaxed">
          {adminMessage.message}
        </p>
        <p className="text-sm text-red-800 dark:text-red-200">
          Contact{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="underline font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
          >
            Customer Support
          </a>
        </p>
        {adminMessage.created_at && (
          <p className="text-xs text-red-600/70 mt-3">
            Posted: {new Date(adminMessage.created_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  </Card>
)}

{/* Withdrawal Payment Instructions */}
{pendingWithdrawal && (
  <Card className="p-4 md:p-6 bg-red-600/20 border-2 border-red-600/50 animate-fade-in-up mb-6 shadow-lg shadow-red-500/10">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-red-600 rounded-full flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-2">Payment Instructions Required</h3>
        <p className="text-sm text-red-800 dark:text-red-200 mb-3">
          You have a pending withdrawal of <span className="font-bold text-red-900 dark:text-red-100">${pendingWithdrawal.amount.toLocaleString()}</span> that requires payment.
          Please follow the instructions below to complete your withdrawal:
        </p>

        <div className="bg-white/70 dark:bg-black/50 p-4 rounded-lg border-2 border-red-500/30">
          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Payment Details:</p>
          <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap leading-relaxed">
            {pendingWithdrawal.payment_details}
          </p>

          {pendingWithdrawal.admin_fee > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-red-500/30">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Payment Summary:</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between items-center bg-red-500/10 p-2 rounded">
                  <span className="text-red-700 dark:text-red-300 font-semibold">Total to Pay:</span>
                  <span className="font-bold text-xl text-red-800 dark:text-red-200">
                    ${pendingWithdrawal.admin_fee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Your withdrawal will be processed after we confirm your payment.
          </p>
        </div>

        <p className="text-sm text-red-800 dark:text-red-200 mt-3">
          Contact{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="underline font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
          >
            Customer Support
          </a>
        </p>
      </div>
    </div>
  </Card>
)}

{/* Active Bot Trades Section - Compact */}
{activeBotTrades.length > 0 && (
  <Card className="p-3 md:p-4 border-purple-500/30 bg-purple-500/5 animate-fade-in-up">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold">Active Bots</h3>
        <Badge variant="outline" className="text-purple-500 border-purple-500/50 text-xs">
          {activeBotTrades.length}
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {userProfile?.account_type}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchActiveBots} disabled={loadingBots}>
          <RefreshCw className={`w-3 h-3 ${loadingBots ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.push('/dashboard/analysis-bot')}>
          Manage
        </Button>
      </div>
    </div>

    {/* Compact Bot List - Max 3 visible, scrollable */}
    <div className="space-y-2 max-h-[180px] overflow-y-auto">
      {activeBotTrades.map((trade) => {
        const profit = trade.profit_loss || 0
        const progress = trade.metadata?.progress || 0
        const trend = trade.metadata?.trend || 'up'
        const durationDays = trade.metadata?.durationDays || 7
        const startDate = trade.metadata?.startDate ? new Date(trade.metadata.startDate) : new Date(trade.created_at)
        const now = new Date()
        const daysPassed = Math.min(durationDays, Math.max(0, now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const currentDay = Math.min(durationDays, Math.max(1, Math.ceil(daysPassed)))

        const isUp = trend === 'up'
        const trendColor = isUp ? 'text-green-500' : 'text-red-500'
        const trendBg = isUp ? 'bg-green-500/10' : 'bg-red-500/10'

        return (
          <div
            key={trade.id}
            className={`p-2 rounded-lg border cursor-pointer hover:bg-muted/20 transition-all ${
              isUp ? 'border-green-500/20' : 'border-red-500/20'
            }`}
            onClick={() => router.push('/dashboard/analysis-bot')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${trendBg}`}>
                  {isUp ? <TrendingUp className={`w-3 h-3 ${trendColor}`} /> : <TrendingDown className={`w-3 h-3 ${trendColor}`} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">{trade.symbol}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                  </div>
                  <p className="text-xs text-muted-foreground">Day {currentDay}/{durationDays}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${trendColor}`}>
                  ${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-1 mt-1.5" />
          </div>
        )
      })}
    </div>

    {/* Compact Summary */}
    <div className="flex justify-between items-center mt-3 pt-2 border-t border-purple-500/20 text-sm">
      <span className="text-muted-foreground">Total Profit:</span>
      <span className="font-bold text-green-500">
        +${activeBotTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  </Card>
)}


      <ScrollingTicker />

      {/* WALLET DISPLAY SECTION */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Overview
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${userProfile?.account_type === "demo" ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'}`}>
              {userProfile?.account_type || "demo"} Account
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600 capitalize">
              {currentPlan || "Basic"} Plan
            </span>
            {activePlan && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                Active
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Balance Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-primary" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Available</span>
                <p className="text-lg font-bold font-mono group-hover:scale-105 transition-transform">
                  {accountBalance}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userProfile?.account_type === "demo" ? "Demo Funds" : "Real Funds"}
            </p>
          </Card>

          {/* Trading Balance */}
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/50 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Active</span>
                <p className="text-lg font-bold font-mono group-hover:scale-105 transition-transform">
                  {tradingBalance}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Trading Balance</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <p className="text-xs text-green-500">Available for trades</p>
            </div>
          </Card>

          {/* Bot Trading Balance */}
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-500">🤖</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Automated</span>
                <p className="text-lg font-bold font-mono group-hover:scale-105 transition-transform">
                  {botBalance}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Bot Trading</p>
            <p className="text-xs text-muted-foreground mt-1">AI-powered trading</p>
          </Card>

          {/* Bonus Balance */}
          <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-yellow-500" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Bonus</span>
                <p className="text-lg font-bold font-mono group-hover:scale-105 transition-transform">
                  {bonusBalance}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Bonus Funds</p>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
          </Card>
        </div>

        {/* Wallet Details Row */}
        {wallets && wallets.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-border/40">
              <h3 className="font-semibold mb-3">All Wallets</h3>
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div 
                    key={wallet.id} 
                    className={`p-3 rounded-lg border ${currentWallet?.id === wallet.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{wallet.account_type}</span>
                          {currentWallet?.id === wallet.id && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated: {new Date(wallet.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold font-mono">
                          ${wallet.total_balance.toLocaleString()}
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>T: ${wallet.trading_balance.toLocaleString()}</span>
                          <span>B: ${wallet.bot_trading_balance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border/40">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="h-12 bg-primary hover:bg-primary/90"
                  onClick={() => handleNavigation('/dashboard/deposit')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button 
                  className="h-12 bg-green-600 hover:bg-green-700"
                  onClick={() => handleNavigation('/dashboard/withdraw')}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
                <Button 
                  className="h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleNavigation('/dashboard/stock-trade')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Trade
                </Button>
                <Button 
                  className="h-12 bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleNavigation('/dashboard/analysis-bot')}
                >
                  <span className="mr-2">🤖</span>
                  Auto Trade
                </Button>
              </div>
              
              {/* Plan Info - Simplified */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg capitalize">{currentPlan} Plan</h4>
                    {activePlan ? (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Active Plan
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        No active subscription
                      </p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleNavigation('/dashboard/upgrade')}
                  >
                    {activePlan ? "Upgrade" : "Get Plan"}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Account type: <span className="font-medium capitalize">{userProfile?.account_type || "demo"}</span></p>
                  
                  {activePlan && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Renews:</span>
                        <span className="font-medium">
                          {activePlan.ends_at ? new Date(activePlan.ends_at).toLocaleDateString() : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium capitalize text-green-600">{activePlan.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Account Balance", 
            value: accountBalance, 
            subtext: `${userProfile?.account_type === "demo" ? "Demo Funds" : "Live Funds"}`, 
            color: "text-green-400" 
          },
          { 
            label: "Trading Balance", 
            value: tradingBalance, 
            subtext: "Active for trading", 
            color: "text-blue-400" 
          },
          { 
            label: "Total Profit", 
            value: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            subtext: "+5% this week", 
            color: "text-green-400" 
          },
          {
            label: "Active Bots",
            value: activeBotTrades.length.toString(),
            subtext: activeBotTrades.length > 0
              ? `+$${activeBotTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toFixed(0)} profit`
              : "No active bots",
            color: "text-purple-400"
          },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className="p-4 md:p-6 bg-card/50 border-border/40 hover:border-primary/50 transition-all duration-300 animate-fade-in-up group cursor-pointer"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-[clamp(1.3rem,2vw,2rem)] font-bold text-foreground font-mono tabular-nums group-hover:scale-105 transition-transform">
              {stat.value}
            </p>
            <p className={`text-xs ${stat.color} mt-2`}>{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: TrendingUp,
            title: "Start Trading",
            desc: `Trade with your ${tradingBalance} trading balance`,
            btn: "Trade Now",
            path: "/trade"
          },
          {
            icon: Eye,
            title: "Market Signals",
            desc: "View AI-powered trading signals and analysis",
            btn: "View Signals",
            path: "/signals"
          },
          {
            icon: TrendingUp,
            title: "Copy Trading",
            desc: "Copy successful traders and earn alongside them",
            btn: "Learn More",
            path: "/copy-trading"
          },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Card
              key={action.title}
              className="p-6 bg-gradient-to-br from-primary/20 to-transparent border-border/40 hover:border-primary/50 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
            >
              <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{action.desc}</p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all"
                onClick={() => handleNavigation(action.path)}
              >
                {action.btn}
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Charts and Market Data */}
      <Card className="p-4 md:p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4">Advanced Market Chart</h3>
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <AdvancedChartWidget />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["BTCUSD", "ETHUSD", "EURUSD"].map((symbol, i) => (
          <Card
            key={symbol}
            className="p-4 bg-card/50 border-border/40 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <h4 className="text-sm font-semibold mb-3">{symbol}</h4>
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <MiniSymbolChart symbol={symbol} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-6 bg-card/50 border-border/40 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <MarketOverviewWidget />
        </div>
      </Card>
    </div>
  )
}