"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { MessageCircle, Send, X, User, Plus, ArrowLeft, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [showChat, setShowChat] = useState(false)
  const [chatView, setChatView] = useState<"list" | "chat" | "new">("list")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newTicketSubject, setNewTicketSubject] = useState("")
  const [newTicketMessage, setNewTicketMessage] = useState("")
  const [creatingTicket, setCreatingTicket] = useState(false)
  const [isTyping, setIsTyping] = useState<{ sender_type: "user" | "admin"; typing: boolean } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const { user, loading } = useAuth()
  const supabase = createClient()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch tickets when chat opens
  useEffect(() => {
    if (showChat && user) {
      fetchTickets()
    }
  }, [showChat, user])

  // Set up real-time subscription when ticket is selected
  useEffect(() => {
    if (!selectedTicket) return
    fetchMessages(selectedTicket.id)

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
          setIsTyping(null)
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { sender_type, typing } = payload.payload
        if (sender_type !== 'user') {
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
    if (!user) return
    try {
      setLoadingTickets(true)
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error: any) {
      console.error("Error fetching tickets:", error)
      setTickets([])
    } finally {
      setLoadingTickets(false)
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

  const handleCreateTicket = async () => {
    if (!user || !newTicketSubject.trim() || !newTicketMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setCreatingTicket(true)
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: newTicketSubject.trim(),
          status: "open",
          priority: "medium",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (ticketError) throw ticketError

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

      toast.success("Support ticket created!")
      setNewTicketSubject("")
      setNewTicketMessage("")
      await fetchTickets()
      setSelectedTicket(ticketData)
      setChatView("chat")
    } catch (error: any) {
      console.error("Error creating ticket:", error)
      toast.error("Failed to create ticket")
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

      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedTicket.id)

      setNewMessage("")
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    if (!selectedTicket || !channelRef.current) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_type: 'user', typing: true }
    })

    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_type: 'user', typing: false }
      })
    }, 2000)
  }

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setChatView("chat")
  }

  const handleBackToList = () => {
    setSelectedTicket(null)
    setChatView("list")
    setMessages([])
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/20 text-blue-500 text-xs">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-500 text-xs">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-500 text-xs">Closed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // if (!isAuthenticated) {
  //   return null
  // }
console.log("DashboardLayout user:", user)
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Customer Service Chat Icon - Fixed Position */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 group"
        aria-label="Customer Support"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>

      {/* Chat Popup Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md h-[550px]">
            <Card className="w-full h-full flex flex-col border-primary/30 shadow-2xl">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {chatView !== "list" && (
                    <button
                      onClick={handleBackToList}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {chatView === "list" ? "Support Center" :
                       chatView === "new" ? "New Ticket" :
                       selectedTicket?.subject || "Chat"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {chatView === "chat" && selectedTicket ? (
                        getStatusBadge(selectedTicket.status)
                      ) : (
                        "We typically reply within minutes"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowChat(false)
                    setChatView("list")
                    setSelectedTicket(null)
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tickets List View */}
              {chatView === "list" && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingTickets ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No support tickets yet</p>
                        <p className="text-sm text-muted-foreground">Create a ticket to get help</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className="p-3 rounded-lg border bg-background/50 hover:bg-background cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ticket.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t p-3">
                    <Button
                      onClick={() => setChatView("new")}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Support Ticket
                    </Button>
                  </div>
                </>
              )}

              {/* New Ticket View */}
              {chatView === "new" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary/50 focus:outline-none resize-none text-sm"
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Chat View */}
              {chatView === "chat" && selectedTicket && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground text-sm">No messages yet</p>
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
                                <span className="font-medium mr-2">Support</span>
                              )}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Typing Indicator */}
                    {isTyping && isTyping.typing && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-3">
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
                    <div className="border-t p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => handleTyping(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                          placeholder="Type your message..."
                          disabled={sendingMessage}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                          className="shrink-0"
                        >
                          {sendingMessage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t p-3 text-center">
                      <p className="text-sm text-muted-foreground">This ticket is closed</p>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <DashboardSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <DashboardNavbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}