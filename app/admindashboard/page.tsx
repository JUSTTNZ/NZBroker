"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Clock, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Users", value: "1,248", change: "+12%", icon: Users, color: "text-blue-500" },
    { label: "Pending Approvals", value: "24", change: "3 new", icon: Clock, color: "text-yellow-500" },
    { label: "Pending Withdrawals", value: "18", change: "$42.5K", icon: DollarSign, color: "text-orange-500" },
    { label: "Active Support", value: "8", change: "2 urgent", icon: MessageSquare, color: "text-green-500" },
  ]

  const recentActivities = [
    { user: "John Doe", action: "Registration pending", time: "10 min ago", type: "user" },
    { user: "Jane Smith", action: "Withdrawal requested", time: "30 min ago", type: "withdrawal" },
    { user: "Bob Johnson", action: "Large deposit", time: "1 hour ago", type: "transaction" },
    { user: "Alice Brown", action: "Support ticket opened", time: "2 hours ago", type: "support" },
  ]

  const quickActions = [
    { title: "Review Users", desc: "Approve new registrations", link: "/dashboard/admin/users", icon: Users },
    { title: "Approve Withdrawals", desc: "Process pending requests", link: "/dashboard/admin/withdrawals", icon: DollarSign },
    { title: "Support Tickets", desc: "Respond to users", link: "/dashboard/admin/support", icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activities and quick actions</p>
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
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.link}>
              <Card className="p-6 bg-card/50 border-border/40 hover:border-primary/50 transition-all cursor-pointer">
                <Icon className="w-8 h-8 text-primary mb-4" />
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
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Link href="/dashboard/admin/transactions" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'withdrawal' ? 'bg-orange-500/10 text-orange-500' :
                    activity.type === 'support' ? 'bg-green-500/10 text-green-500' :
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
            ))}
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">System Alerts</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="font-medium text-yellow-600 mb-1">High Withdrawal Volume</p>
              <p className="text-sm text-yellow-700">Multiple large withdrawals pending approval</p>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium text-blue-600 mb-1">New User Registration</p>
              <p className="text-sm text-blue-700">5 new users awaiting verification</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="font-medium text-green-600 mb-1">System Update</p>
              <p className="text-sm text-green-700">Scheduled maintenance in 24 hours</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}