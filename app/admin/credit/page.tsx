// app/admin/credit/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, CreditCard, AlertCircle } from "lucide-react"
import { fetchAllUsers, creditUserWallet, type AdminUser } from "@/lib/admin"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
export default function CreditPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [creditAmount, setCreditAmount] = useState("")
  const [creditAccountType, setCreditAccountType] = useState<"demo" | "live">("demo")
  const [creditDescription, setCreditDescription] = useState("")
  const [isCrediting, setIsCrediting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const fetchedUsers = await fetchAllUsers()
    setUsers(fetchedUsers)
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCredit = async () => {
    if (!selectedUser || !creditAmount || parseFloat(creditAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsCrediting(true)
    const amount = parseFloat(creditAmount)
    
    const result = await creditUserWallet(
      selectedUser.id,
      amount,
      creditAccountType,
      creditDescription || undefined
    )

    if (result.success) {
      toast.success(`Credited $${amount.toFixed(2)} to ${selectedUser.full_name}`)
      // Reset form
      setCreditAmount("")
      setCreditDescription("")
      // Refresh balances
      await loadUsers()
    } else {
      toast.error("Failed to credit user")
    }
    
    setIsCrediting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="md:text-3xl text-lg font-bold mb-2">Credit User Accounts</h1>
        <p className="text-muted-foreground">Add funds to user demo or live accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Selection */}
        <Card className="lg:col-span-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Select User</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`p-4 cursor-pointer transition-all hover:bg-accent ${
                  selectedUser?.id === user.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {user.account_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.current_plan}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Right: Credit Form */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-6">Credit Account</h2>
          
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedUser.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-xl font-bold">
                      ${selectedUser.wallets?.find(w => w.account_type === creditAccountType)?.total_balance || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Credit Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select 
                      value={creditAccountType} 
                      onValueChange={(value: 'demo' | 'live') => setCreditAccountType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demo Account</SelectItem>
                        <SelectItem value="live">Live Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder="e.g., Bonus, Refund, Initial funding"
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                  />
                </div>

                {/* Info Box */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700">Important Notes</p>
                      <ul className="text-sm text-blue-600 mt-1 space-y-1">
                        <li>• Funds will be added to user's total balance</li>
                        <li>• Transaction will be recorded in history</li>
                        <li>• User will receive a notification</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedUser(null)
                      setCreditAmount("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCredit}
                    disabled={isCrediting || !creditAmount || parseFloat(creditAmount) <= 0}
                    className="gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {isCrediting ? "Processing..." : "Credit Account"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a User</h3>
              <p className="text-muted-foreground">Choose a user from the list to credit their account</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}