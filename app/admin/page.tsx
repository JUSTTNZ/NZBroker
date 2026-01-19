"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  DollarSign,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  User,
  FileCheck
} from "lucide-react"
import Link from "next/link"
import { fetchAllUsers, AdminUser } from "@/lib/admin"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboardPage() {
  const { user, userProfile } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingKYC, setPendingKYC] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadKYCStats()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const loadKYCStats = async () => {
    try {
      const { count } = await supabase
        .from("kyc_verifications")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "under_review"])

      setPendingKYC(count || 0)
    } catch (error) {
      console.error('Failed to load KYC stats:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([loadUsers(), loadKYCStats()])
    setRefreshing(false)
    toast.success('Data refreshed')
  }

  // Calculate stats from real data
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length
  
  const totalDemoBalance = users.reduce((sum, user) => 
    sum + (user.wallets.find(w => w.account_type === 'demo')?.total_balance || 0), 0)
  
  const totalLiveBalance = users.reduce((sum, user) => 
    sum + (user.wallets.find(w => w.account_type === 'live')?.total_balance || 0), 0)
  
  const totalBalance = totalDemoBalance + totalLiveBalance

  // Recent activities from actual users
  const recentActivities = users.slice(0, 4).map(user => ({
    user: user.full_name || user.email,
    action: `Registered ${user.account_type} account`,
    time: new Date(user.created_at).toLocaleDateString(),
    type: 'user'
  }))

  const stats = [
    { 
      label: "Total Users", 
      value: totalUsers.toString(), 
      change: `+${users.filter(u => {
        const userDate = new Date(u.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return userDate > weekAgo
      }).length} new`, 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Active Users", 
      value: activeUsers.toString(), 
      change: `${((activeUsers / totalUsers) * 100).toFixed(0)}% active`, 
      icon: TrendingUp, 
      color: "text-green-500" 
    },
    { 
      label: "Total Balance", 
      value: `$${totalBalance.toLocaleString()}`, 
      change: `Demo: $${totalDemoBalance.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-orange-500" 
    },
    { 
      label: "Pending Actions", 
      value: pendingUsers.toString(), 
      change: pendingUsers > 0 ? "Needs review" : "All clear", 
      icon: Clock, 
      color: "text-yellow-500" 
    },
  ]

  const quickActions = [
    { title: "Manage Users", desc: "View and manage all users", link: "/admin/users", icon: Users },
    { title: "KYC Verifications", desc: `${pendingKYC} pending approvals`, link: "/admin/kyc", icon: FileCheck, highlight: pendingKYC > 0 },
    { title: "Credit Users", desc: "Add funds to user accounts", link: "/admin/credit", icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="w-10 h-10 md:text-lg text-sm rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary " />
            </div>
            Welcome back, {userProfile?.full_name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground">Platform overview and management dashboard</p>
        </div>
        {/* <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 bg-card/50 border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <Icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action: any) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.link}>
              <Card className={`p-6 bg-card/50 border-border/40 hover:border-primary/50 transition-all cursor-pointer ${
                action.highlight ? "border-yellow-500/50 bg-yellow-500/5" : ""
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${action.highlight ? "text-yellow-500" : "text-primary"}`} />
                  {action.highlight && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-600 rounded-full">
                      Action Required
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.desc}</p>
                <Button variant="ghost" className="mt-4 w-full">Go to {action.title}</Button>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent User Registrations</h3>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              View All Users
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'user' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">System Alerts</h3>
          </div>
          <div className="space-y-4">
            {pendingKYC > 0 && (
              <Link href="/admin/kyc">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-600 mb-1">Pending KYC Verifications</p>
                      <p className="text-sm text-yellow-700">{pendingKYC} verification(s) need review</p>
                    </div>
                    <FileCheck className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </Link>
            )}

            {pendingUsers > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="font-medium text-yellow-600 mb-1">Pending User Approvals</p>
                <p className="text-sm text-yellow-700">{pendingUsers} user(s) need review</p>
              </div>
            )}

            {users.length === 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="font-medium text-blue-600 mb-1">No Users Found</p>
                <p className="text-sm text-blue-700">The platform has no registered users yet</p>
              </div>
            )}

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="font-medium text-green-600 mb-1">Platform Status</p>
              <p className="text-sm text-green-700">All systems operational</p>
            </div>

            {totalBalance < 100000 && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="font-medium text-orange-600 mb-1">Low Platform Balance</p>
                <p className="text-sm text-orange-700">Total balance: ${totalBalance.toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}