"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  type: "success" | "warning" | "info" | "trade"
  icon: React.ReactNode
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Trade Executed",
      message: "Your BTC/USD buy order has been executed at $43,250",
      timestamp: "2 minutes ago",
      isRead: false,
      type: "success",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: "2",
      title: "Price Alert",
      message: "ETH/USD has reached your target price of $2,400",
      timestamp: "1 hour ago",
      isRead: false,
      type: "info",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: "3",
      title: "Signal Generated",
      message: "AI Analysis Bot found a strong BUY signal for EUR/USD",
      timestamp: "3 hours ago",
      isRead: false,
      type: "trade",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "4",
      title: "Account Update",
      message: "Your account balance has been updated to $10,250",
      timestamp: "1 day ago",
      isRead: true,
      type: "info",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "5",
      title: "Deposit Confirmed",
      message: "Your deposit of $5,000 has been confirmed",
      timestamp: "2 days ago",
      isRead: true,
      type: "success",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: !notif.isRead } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const typeColors = {
    success: "bg-green-400/10 border-green-400/20 text-green-400",
    warning: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
    info: "bg-blue-400/10 border-blue-400/20 text-blue-400",
    trade: "bg-purple-400/10 border-purple-400/20 text-purple-400",
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
      </div>

      {unreadCount > 0 && (
        <Button
          onClick={markAllAsRead}
          variant="outline"
          className="animate-fade-in-up transition-all hover:bg-primary/10 bg-transparent"
        >
          Mark all as read
        </Button>
      )}

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <Card
            key={notif.id}
            className={`p-4 border-l-4 transition-all duration-300 animate-fade-in-up group hover:shadow-lg cursor-pointer ${
              notif.isRead ? "bg-card/30 opacity-70 border-border" : `${typeColors[notif.type]} border-l-current`
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => toggleNotificationRead(notif.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 ${!notif.isRead ? "" : "opacity-50"}`}>{notif.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {notif.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{notif.timestamp}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {!notif.isRead && <div className="w-3 h-3 rounded-full bg-primary animate-pulse ml-4" />}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="p-12 text-center bg-card/30 border-border/40">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </Card>
      )}
    </div>
  )
}
