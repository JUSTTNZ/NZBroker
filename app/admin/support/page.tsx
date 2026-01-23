"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  User,
  RefreshCw,
  Loader2,
  AlertCircle,
  XCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_type: "user" | "admin"
  message: string
  created_at: string
}

export default function SupportPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const [isTyping, setIsTyping] = useState<{ sender_type: "user" | "admin"; typing: boolean } | null>(null)

  const supabase = createClient()

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch all tickets
  useEffect(() => {
    fetchTickets()

    // Set up real-time subscription for new tickets
    const ticketChannel = supabase
      .channel('admin-tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketChannel)
    }
  }, [])

  // Fetch messages when ticket is selected
  useEffect(() => {
    if (!selectedTicket) return
    fetchMessages(selectedTicket.id)

    // Set up real-time subscription for messages and typing
    // Use the same channel name as the user side so they can communicate
    const channel = supabase
      .channel(`ticket-${selectedTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Stop typing indicator when message is received
          setIsTyping(null)
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { sender_type, typing } = payload.payload
        if (sender_type !== 'admin') { // Only show typing for user (other side)
          setIsTyping(typing ? { sender_type, typing } : null)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTicket])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error: any) {
      console.error("Error fetching tickets:", error?.message || error)
      // Table might not exist yet
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setMessages([])
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!selectedTicket || !channelRef.current) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Broadcast typing start using the channel reference
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_type: 'admin', typing: true }
    })

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_type: 'admin', typing: false }
      })
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return

    setSendingMessage(true)

    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          sender_type: "admin",
          message: newMessage.trim(),
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === "open") {
        await supabase
          .from("support_tickets")
          .update({
            status: "in_progress",
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedTicket.id)

        // Update local state
        setSelectedTicket({ ...selectedTicket, status: "in_progress" })
        setTickets(prev =>
          prev.map(t =>
            t.id === selectedTicket.id ? { ...t, status: "in_progress" as const } : t
          )
        )
      } else {
        // Just update the timestamp
        await supabase
          .from("support_tickets")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", selectedTicket.id)
      }

      // Send notification to user (optional - don't fail if this errors)
      try {
        await supabase.from("notifications").insert({
          user_id: selectedTicket.user_id,
          title: "New Support Reply",
          message: `You have a new reply on your support ticket: "${selectedTicket.subject}"`,
          type: "support",
          read: false,
          created_at: new Date().toISOString()
        })
      } catch (e) {
        console.log("Notification not sent:", e)
      }

      setNewMessage("")
      await fetchMessages(selectedTicket.id)

    } catch (error: any) {
      console.error("Error sending message:", error?.message || error)
      toast.error(error?.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId)

      if (error) throw error

      // Update local state
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, status: newStatus as any } : t
        )
      )

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any })
      }

      // Notify user (optional)
      const ticket = tickets.find(t => t.id === ticketId)
      if (ticket) {
        try {
          await supabase.from("notifications").insert({
            user_id: ticket.user_id,
            title: "Ticket Status Updated",
            message: `Your support ticket "${ticket.subject}" has been marked as ${newStatus}.`,
            type: "support",
            read: false,
            created_at: new Date().toISOString()
          })
        } catch (e) {
          console.log("Notification not sent:", e)
        }
      }

      toast.success(`Ticket marked as ${newStatus}`)
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const filteredTickets = filterStatus === "all"
    ? tickets
    : tickets.filter(t => t.status === filterStatus)

  const openCount = tickets.filter(t => t.status === "open").length
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading support tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
        <p className="text-muted-foreground">Manage support tickets and respond to users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{tickets.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">{openCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === "resolved" || t.status === "closed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="lg:col-span-1 p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Support Tickets</h3>
            <Button variant="ghost" size="sm" onClick={fetchTickets}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background/30 border-border/40 hover:bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {ticket.profiles?.full_name || "Unknown User"}
                    </h4>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{ticket.subject}</p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ticket.updated_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 p-6 bg-card/50 border-border/40">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedTicket.profiles?.full_name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  variant={selectedTicket.status === "in_progress" ? "default" : "outline"}
                  onClick={() => handleUpdateStatus(selectedTicket.id, "in_progress")}
                  className="gap-1"
                >
                  <Clock className="w-3 h-3" />
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant={selectedTicket.status === "resolved" ? "default" : "outline"}
                  onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                  className="gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </Button>
                <Button
                  size="sm"
                  variant={selectedTicket.status === "closed" ? "default" : "outline"}
                  onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                  className="gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  Close
                </Button>
              </div>

              {/* Messages */}
              <div className="h-[350px] overflow-y-auto space-y-4 mb-4 p-4 bg-background/30 rounded-lg">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender_type === "admin"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {msg.sender_type === "user" && (
                            <span className="font-medium mr-2">Customer</span>
                          )}
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTyping && isTyping.typing && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">Customer is typing</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedTicket.status !== "closed" ? (
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your reply..."
                    disabled={sendingMessage}
                  />
                  <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground">This ticket is closed. Reopen to send messages.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "open")}
                  >
                    Reopen Ticket
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Select a Ticket</h3>
              <p className="text-muted-foreground">Choose a ticket from the list to view and respond</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
