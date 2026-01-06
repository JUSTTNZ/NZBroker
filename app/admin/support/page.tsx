"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  User
} from "lucide-react"

const supportTickets = [
  { id: 1, user: "John Doe", subject: "Withdrawal Issue", status: "open", lastMessage: "2 hours ago", priority: "high" },
  { id: 2, user: "Jane Smith", subject: "Account Verification", status: "open", lastMessage: "1 day ago", priority: "medium" },
  { id: 3, user: "Bob Johnson", subject: "Deposit Problem", status: "closed", lastMessage: "3 days ago", priority: "low" },
  { id: 4, user: "Alice Brown", subject: "Trading Questions", status: "open", lastMessage: "5 hours ago", priority: "medium" },
]

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", balance: 12500, online: true },
  { id: 2, name: "Jane Smith", email: "jane@example.com", balance: 8500, online: false },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", balance: 3200, online: true },
  { id: 4, name: "Alice Brown", email: "alice@example.com", balance: 15400, online: false },
]

interface Message {
  id: number
  text: string
  sender: "admin" | "user"
  timestamp: string
}

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(1)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello, I need help with my withdrawal", sender: "user", timestamp: "10:30 AM" },
    { id: 2, text: "Sure, I can help you with that. What's the issue?", sender: "admin", timestamp: "10:32 AM" },
    { id: 3, text: "The withdrawal has been pending for 3 days", sender: "user", timestamp: "10:35 AM" },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return
    setMessages([
      ...messages,
      { id: messages.length + 1, text: message, sender: "admin", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ])
    setMessage("")
  }

  const handleCloseTicket = (ticketId: number) => {
    alert(`Ticket ${ticketId} closed`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
        <p className="text-muted-foreground">Manage support tickets and chat with users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Tickets */}
        <Card className="lg:col-span-1 p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Support Tickets</h3>
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              {supportTickets.filter(t => t.status === "open").length} open
            </Badge>
          </div>
          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedTicket === ticket.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-background/30 border-border/40 hover:bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{ticket.user}</h4>
                  <Badge className={
                    ticket.priority === "high" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                    ticket.priority === "medium" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                    "bg-green-500/20 text-green-500 border-green-500/30"
                  }>
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{ticket.subject}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={
                    ticket.status === "open" 
                      ? "bg-green-500/10 text-green-500 border-green-500/30" 
                      : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                  }>
                    {ticket.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ticket.lastMessage}
                  </p>
                </div>
                {selectedTicket === ticket.id && ticket.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => handleCloseTicket(ticket.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Close Ticket
                  </Button>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {supportTickets.find(t => t.id === selectedTicket)?.user || "Select Ticket"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {supportTickets.find(t => t.id === selectedTicket)?.subject || "No ticket selected"}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Online
            </Badge>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 mb-6 p-4 bg-background/30 rounded-lg">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === "admin"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
            />
            <Button onClick={handleSendMessage} className="px-6">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* User Chat List */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Direct Chat with Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedUser === user.id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-background/30 border-border/40 hover:bg-background/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  {user.online && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">${user.balance.toLocaleString()}</p>
                </div>
              </div>
              <Button size="sm" className="w-full" variant={selectedUser === user.id ? "default" : "outline"}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}