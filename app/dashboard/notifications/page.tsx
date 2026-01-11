"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean  // Changed to 'read' (not 'is_read')
  created_at: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      setRefreshing(true)
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Mark notification as read/unread
  const toggleNotificationRead = async (id: string) => {
    if (!user) return
    
    try {
      const notification = notifications.find(n => n.id === id)
      if (!notification) return

      const { error } = await supabase
        .from("notifications")
        .update({ read: !notification.read })  // Changed to 'read'
        .eq("id", id)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: !notif.read } : notif  // Changed to 'read'
        )
      )
    } catch (error) {
      console.error("Error updating notification:", error)
      toast.error("Failed to update notification")
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })  // Changed to 'read'
        .eq("user_id", user.id)
        .eq("read", false)  // Changed to 'read'

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))  // Changed to 'read'
      )
      
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.error("Failed to mark all as read")
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      
      toast.success("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user || notifications.length === 0) return
    
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)

      if (error) throw error

      setNotifications([])
      toast.success("All notifications cleared")
    } catch (error) {
      console.error("Error clearing notifications:", error)
      toast.error("Failed to clear notifications")
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case "withdrawal":
      case "deposit":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "trade":
      case "signal":
        return <TrendingUp className="w-5 h-5 text-purple-400" />
      case "warning":
      case "alert":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case "plan_upgrade":
      case "account":
        return <Bell className="w-5 h-5 text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case "withdrawal":
      case "deposit":
        return "bg-green-400/10 border-green-400/20 text-green-400"
      case "trade":
      case "signal":
        return "bg-purple-400/10 border-purple-400/20 text-purple-400"
      case "warning":
      case "alert":
        return "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
      case "plan_upgrade":
      case "account":
        return "bg-blue-400/10 border-blue-400/20 text-blue-400"
      default:
        return "bg-gray-400/10 border-gray-400/20 text-gray-400"
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length  // Changed to 'read'

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {notifications.length === 0 
              ? "No notifications" 
              : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            }
          </p>
          <div className="flex gap-2">
            <Button
              onClick={fetchNotifications}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {unreadCount > 0 && (
        <Button
          onClick={markAllAsRead}
          variant="outline"
          className="transition-all hover:bg-primary/10 bg-transparent"
        >
          Mark all as read
        </Button>
      )}

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <Card
            key={notif.id}
            className={`p-4 border-l-4 transition-all duration-300 group hover:shadow-lg cursor-pointer ${
              notif.read  // Changed to 'read'
                ? "bg-card/30 opacity-70 border-border" 
                : getNotificationColor(notif.type)
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex items-start gap-4 flex-1"
                onClick={() => toggleNotificationRead(notif.id)}
              >
                <div className={`mt-1 ${notif.read ? "opacity-50" : ""}`}>  {/* Changed to 'read' */}
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {notif.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {formatTimestamp(notif.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notif.read && (  // Changed to 'read'
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse ml-4" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notif.id)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="p-12 text-center bg-card/30 border-border/40">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            You'll see notifications here for account updates, trades, and more
          </p>
        </Card>
      )}
    </div>
  )
}