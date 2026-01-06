"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX,
  MoreVertical,
  Mail,
  Calendar
} from "lucide-react"

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", balance: 12500, status: "active", kyc: "verified", joined: "2024-12-01" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", balance: 8500, status: "active", kyc: "pending", joined: "2024-12-02" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", balance: 3200, status: "inactive", kyc: "rejected", joined: "2024-12-03" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", balance: 15400, status: "active", kyc: "verified", joined: "2024-12-04" },
  { id: 5, name: "Mike Wilson", email: "mike@example.com", balance: 0, status: "pending", kyc: "none", joined: "2024-12-05" },
  { id: 6, name: "Sarah Davis", email: "sarah@example.com", balance: 500, status: "pending", kyc: "none", joined: "2024-12-06" },
]

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [balanceInput, setBalanceInput] = useState("")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                         user.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApproveUser = (userId: number) => {
    alert(`User ${userId} approved`)
  }

  const handleRejectUser = (userId: number) => {
    alert(`User ${userId} rejected`)
  }

  const handleSetBalance = (userId: number) => {
    if (balanceInput && !isNaN(parseFloat(balanceInput))) {
      alert(`Balance for user ${userId} set to $${parseFloat(balanceInput)}`)
      setBalanceInput("")
    }
  }

  const statusCounts = {
    all: users.length,
    active: users.filter(u => u.status === "active").length,
    pending: users.filter(u => u.status === "pending").length,
    inactive: users.filter(u => u.status === "inactive").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, balances, and verification</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Active Users</p>
          <p className="text-2xl font-bold text-green-500">{statusCounts.active}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-500">{statusCounts.pending}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">KYC Verified</p>
          <p className="text-2xl font-bold text-blue-500">
            {users.filter(u => u.kyc === "verified").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "pending", "inactive"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <Badge className="ml-2 bg-muted text-muted-foreground">
                  {statusCounts[status as keyof typeof statusCounts]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Balance</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">KYC</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/20 hover:bg-background/30">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {user.joined}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">${user.balance.toLocaleString()}</p>
                      {user.status === "pending" && (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder="Set balance"
                            value={selectedUser === user.id ? balanceInput : ""}
                            onChange={(e) => setBalanceInput(e.target.value)}
                            className="w-32"
                            onClick={() => setSelectedUser(user.id)}
                          />
                          <Button size="sm" onClick={() => handleSetBalance(user.id)}>
                            Set
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={
                      user.status === "active" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                      user.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                      "bg-gray-500/20 text-gray-500 border-gray-500/30"
                    }>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={
                      user.kyc === "verified" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                      user.kyc === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                      user.kyc === "rejected" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                      "bg-gray-500/20 text-gray-500 border-gray-500/30"
                    }>
                      {user.kyc}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {user.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleRejectUser(user.id)}>
                            <UserX className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApproveUser(user.id)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}