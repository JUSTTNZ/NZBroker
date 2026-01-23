"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  Search,
  User,
  RefreshCw,
  Send,
  Trash2,
  Mail,
  MessageSquare,
  CheckCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  current_plan: string
  account_type: string
}

interface AdminMessage {
  user_id: string
  message: string
  created_at: string
}

interface UserWithMessage extends UserProfile {
  admin_message: string | null
  admin_message_created_at: string | null
}

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<UserWithMessage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithMessage | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [clearingMessage, setClearingMessage] = useState<string | null>(null)

  const supabase = createClient()
  const supportEmail = "support@barcrestcapital.com"

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, current_plan, account_type")
        .eq("role", "user")
        .order("full_name", { ascending: true })

      if (usersError) throw usersError

      // Fetch admin messages separately
      const { data: messagesData } = await supabase
        .from("admin_messages")
        .select("user_id, message, created_at")

      // Create a map of user_id to message
      const messageMap = new Map<string, AdminMessage>()
      if (messagesData) {
        messagesData.forEach((msg: AdminMessage) => {
          messageMap.set(msg.user_id, msg)
        })
      }

      // Combine users with their messages
      const usersWithMessages: UserWithMessage[] = (usersData || []).map(user => {
        const userMessage = messageMap.get(user.id)
        return {
          ...user,
          admin_message: userMessage?.message || null,
          admin_message_created_at: userMessage?.created_at || null
        }
      })

      setUsers(usersWithMessages)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = searchTerm === "" ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Users with active messages
  const usersWithMessages = users.filter(u => u.admin_message && u.admin_message.trim() !== "")

  // Send danger message to user
  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setSendingMessage(true)
    try {
      // Upsert admin message (insert or update if exists)
      const { error } = await supabase
        .from("admin_messages")
        .upsert({
          user_id: selectedUser.id,
          message: message.trim(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      // Also create a notification for the user
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: selectedUser.id,
        title: "Important Notice",
        message: message.trim(),
        type: "warning",
        read: false,
        created_at: new Date().toISOString()
      })

      if (notificationError) {
        console.error("Notification insert failed:", notificationError.message, notificationError.code)
      }

      toast.success("Message sent successfully")
      setShowMessageModal(false)
      setMessage("")
      setSelectedUser(null)
      fetchUsers()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; code?: string; details?: string }
      console.error("Error sending message:", supabaseError?.message || error, supabaseError?.code, supabaseError?.details)
      toast.error(supabaseError?.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  // Clear message from user
  const handleClearMessage = async (userId: string) => {
    setClearingMessage(userId)
    try {
      const { error } = await supabase
        .from("admin_messages")
        .delete()
        .eq("user_id", userId)

      if (error) throw error

      toast.success("Message cleared")
      fetchUsers()
    } catch (error) {
      console.error("Error clearing message:", error)
      toast.error("Failed to clear message")
    } finally {
      setClearingMessage(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Messages</h1>
        <p className="text-muted-foreground">Send important alerts and danger messages to users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </div>
            <User className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Messages</p>
              <p className="text-2xl font-bold text-red-500">{usersWithMessages.length}</p>
              <p className="text-xs text-muted-foreground">Users with alerts</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Support Email</p>
              <p className="text-sm font-bold text-primary truncate">{supportEmail}</p>
              <p className="text-xs text-muted-foreground">Auto-linked in messages</p>
            </div>
            <Mail className="w-10 h-10 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Active Messages Section */}
      {usersWithMessages.length > 0 && (
        <Card className="p-6 bg-red-500/10 border-red-500/30">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Users with Active Messages ({usersWithMessages.length})
          </h3>
          <div className="space-y-3">
            {usersWithMessages.map((user) => (
              <div key={user.id} className="p-4 bg-white/50 dark:bg-black/50 rounded-lg border border-red-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{user.full_name}</p>
                      <Badge variant="outline" className="text-xs">{user.email}</Badge>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">{user.admin_message}</p>
                    {user.admin_message_created_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent: {new Date(user.admin_message_created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClearMessage(user.id)}
                    disabled={clearingMessage === user.id}
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    {clearingMessage === user.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and User List */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border transition-all ${
                  user.admin_message
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border/40 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.full_name}</p>
                        {user.admin_message && (
                          <Badge className="bg-red-500 text-white text-xs">Has Message</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.current_plan}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.account_type}
                    </Badge>
                    <Button
                      onClick={() => {
                        setSelectedUser(user)
                        setMessage(user.admin_message || "")
                        setShowMessageModal(true)
                      }}
                      className="bg-red-500 hover:bg-red-600"
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {user.admin_message ? "Edit Message" : "Send Alert"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Send Danger Alert
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              To: <span className="font-semibold">{selectedUser.full_name}</span> ({selectedUser.email})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your important message here..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This message will be displayed prominently on the user&apos;s dashboard.
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-red-600/20 border-2 border-red-600/50 rounded-lg">
                <p className="text-xs font-medium text-red-500 mb-2">Preview:</p>
                <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                  {message || "Your message will appear here..."}
                </p>
                <p className="text-sm text-red-800 dark:text-red-200 mt-3">
                  Contact{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="underline font-semibold text-red-700 dark:text-red-300 hover:text-red-900"
                  >
                    Customer Support
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowMessageModal(false)
                  setMessage("")
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              {selectedUser.admin_message && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={() => {
                    handleClearMessage(selectedUser.id)
                    setShowMessageModal(false)
                    setMessage("")
                    setSelectedUser(null)
                  }}
                  disabled={clearingMessage === selectedUser.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
              >
                {sendingMessage ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
