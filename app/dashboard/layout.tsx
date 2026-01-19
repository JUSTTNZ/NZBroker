"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { MessageCircle, Send, X, Paperclip, Smile, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: number
  text: string
  sender: "user" | "support"
  timestamp: string
  attachments?: string[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "support",
      timestamp: "4 minutes ago"
    }
  ])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, loading } = useAuth()
  // useEffect(() => {
  //   // Check if user is authenticated
  //   const authToken = localStorage.getItem("authToken")
  //   if (!authToken) {
  //     // Redirect to login with the current path as redirect URL
  //     // router.push(`/login?redirect=${pathname}`)
  //     // router.push(`/dashboard`)
  //   } else {
  //     // setIsAuthenticated(true)
  //     // setIsLoading(false)
  //   }
  // }, [pathname, router])

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: "Just now"
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setShowEmojiPicker(false)

    // Auto-reply after 1 second
    setTimeout(() => {
      const supportMessage: Message = {
        id: messages.length + 2,
        text: "We're busy at the moment. Sorry about that. Leave us your email, and we will contact you as soon as possible.",
        sender: "support",
        timestamp: "Just now"
      }
      setMessages(prev => [...prev, supportMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
  }

  const emojis = ["😊", "👍", "❤️", "🚀", "💪", "🎯", "📈", "💰", "🔥", "🤔"]

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
          <div className="relative w-full max-w-md h-[500px]">
            <Card className="w-full h-full flex flex-col border-primary/30 shadow-2xl">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Customer Support</h3>
                    <p className="text-xs text-muted-foreground">Typically replies in a few minutes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Picker - Responsive */}
              {showEmojiPicker && (
                <div className="border-t p-3 bg-background">
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded-md transition-colors"
                        aria-label={`Add ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input Area - Responsive */}
              <div className="border-t p-3 bg-background">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label="Add emoji"
                  >
                    <Smile className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label="Add attachment"
                  >
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-12 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={1}
                      style={{ maxHeight: "100px" }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-primary hover:bg-primary/90 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Support hours: 24/7 • Response time: 2-5 minutes
                </p>
              </div>
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