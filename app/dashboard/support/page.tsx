"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Mail,
  Send,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
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
  const { user, userProfile } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [newTicketSubject, setNewTicketSubject] = useState("")
  const [newTicketMessage, setNewTicketMessage] = useState("")
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high">("medium")
  const [creatingTicket, setCreatingTicket] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const [isTyping, setIsTyping] = useState<{ sender_type: "user" | "admin"; typing: boolean } | null>(null)

  const supabase = createClient()

  const fetchTickets = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error: any) {
      console.error("Error fetching tickets:", error?.message || error)
      // If table doesn't exist, show empty state
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch user's tickets
  useEffect(() => {
    if (!user) return
    fetchTickets()
  }, [user])

  // Fetch messages when ticket is selected
  useEffect(() => {
    if (!selectedTicket) return
    fetchMessages(selectedTicket.id)

    // Set up real-time subscription for messages and typing
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
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Stop typing indicator when message is received
          setIsTyping(null)
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { sender_type, typing } = payload.payload
        if (sender_type !== 'user') { // Only show typing for admin (other side)
          setIsTyping(typing ? { sender_type, typing } : null)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTicket])

  const handleCreateTicket = async () => {
    if (!user || !newTicketSubject.trim() || !newTicketMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setCreatingTicket(true)

    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: newTicketSubject.trim(),
          status: "open",
          priority: newTicketPriority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Create first message
      const { error: messageError } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticketData.id,
          sender_id: user.id,
          sender_type: "user",
          message: newTicketMessage.trim(),
          created_at: new Date().toISOString()
        })

      if (messageError) throw messageError

      // Create notification for user (optional - don't fail if this errors)
      try {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Support Ticket Created",
          message: `Your support ticket "${newTicketSubject}" has been submitted. We'll respond shortly.`,
          type: "support",
          read: false,
          created_at: new Date().toISOString()
        })
      } catch (e) {
        console.log("Notification not sent:", e)
      }

      toast.success("Support ticket created successfully!")

      // Reset form and refresh
      setNewTicketSubject("")
      setNewTicketMessage("")
      setNewTicketPriority("medium")
      setShowNewTicketForm(false)
      await fetchTickets()

      // Auto-select the new ticket
      setSelectedTicket(ticketData)

    } catch (error: any) {
      console.error("Error creating ticket:", error?.message || error)
      toast.error(error?.message || "Failed to create ticket. Make sure support tables exist.")
    } finally {
      setCreatingTicket(false)
    }
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
          sender_type: "user",
          message: newMessage.trim(),
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Update ticket's updated_at
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedTicket.id)

      setNewMessage("")
      // Message will be added via real-time subscription, but also fetch to be safe
      await fetchMessages(selectedTicket.id)

    } catch (error: any) {
      console.error("Error sending message:", error?.message || error)
      toast.error(error?.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
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

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!selectedTicket) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing indicator
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_type: 'user', typing: true }
    })

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_type: 'user', typing: false }
      })
    }, 1000)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading support center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Button onClick={() => setShowNewTicketForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/50 border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Usually responds within 2 hours</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@nzbroker.com</p>
            </div>
          </div>
        </Card>

      </div>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Create New Support Ticket</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNewTicketForm(false)}>
              Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <Input
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <div className="flex gap-3">
                {["low", "medium", "high"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTicketPriority(priority as any)}
                    className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                      newTicketPriority === priority
                        ? priority === "high"
                          ? "bg-red-500/20 border-red-500/50 text-red-500"
                          : priority === "medium"
                            ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500"
                            : "bg-green-500/20 border-green-500/50 text-green-500"
                        : "bg-background/50 border-border/40 hover:bg-background"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none resize-none"
              />
            </div>

            <Button
              onClick={handleCreateTicket}
              disabled={creatingTicket || !newTicketSubject.trim() || !newTicketMessage.trim()}
              className="w-full gap-2"
            >
              {creatingTicket ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Ticket...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content - Tickets List and Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="lg:col-span-1 p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your Tickets</h3>
            <Button variant="ghost" size="sm" onClick={fetchTickets}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No support tickets yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a ticket to get help</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background/30 border-border/40 hover:bg-background/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                    {getPriorityBadge(ticket.priority)}
                  </div>
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

        {/* Chat Area */}
        <Card className="lg:col-span-2 p-6 bg-card/50 border-border/40">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h3 className="font-semibold">{selectedTicket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ticket #{selectedTicket.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto space-y-4 mb-4 p-4 bg-background/30 rounded-lg">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender_type === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {msg.sender_type === "admin" && (
                            <span className="font-medium mr-2">Support Team</span>
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
                        <span className="text-sm">Support is typing</span>
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
                    placeholder="Type your message..."
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
                  <p className="text-muted-foreground">This ticket is closed</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Select a Ticket</h3>
              <p className="text-muted-foreground mb-4">Choose a ticket from the list to view the conversation</p>
              <Button onClick={() => setShowNewTicketForm(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Or Create New Ticket
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
