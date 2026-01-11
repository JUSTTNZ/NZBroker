"use client"

import { useState, useEffect } from "react"
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
import { fetchAllUsers, type AdminUser } from "@/lib/admin"

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Fetch users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const fetchedUsers = await fetchAllUsers()
    setUsers(fetchedUsers)
    setLoading(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      user.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getWalletBalance = (user: AdminUser, accountType: 'demo' | 'live') => {
    const wallet = user.wallets?.find(w => w.account_type === accountType)
    return wallet?.total_balance || 0
  }

  const statusCounts = {
    all: users.length,
    active: users.filter(u => u.status === "active").length,
    pending: users.filter(u => u.status === "pending").length,
    inactive: users.filter(u => u.status === "inactive").length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // User management actions
  const handleApproveUser = (user: AdminUser) => {
    // TODO: Implement user approval
    console.log("Approve user:", user.id)
  }

  const handleSuspendUser = (user: AdminUser) => {
    // TODO: Implement user suspension
    console.log("Suspend user:", user.id)
  }

  const handleActivateUser = (user: AdminUser) => {
    // TODO: Implement user activation
    console.log("Activate user:", user.id)
  }

  const handleViewDetails = (user: AdminUser) => {
    // TODO: Navigate to user details page
    console.log("View details for user:", user.id)
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
          <p className="text-sm text-muted-foreground mb-2">Total Live Balance</p>
          <p className="text-2xl font-bold text-blue-500">
            ${users.reduce((sum, user) => sum + getWalletBalance(user, 'live'), 0).toLocaleString()}
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
          <Button onClick={loadUsers} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6 bg-card/50 border-border/40">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-medium">User</th>

                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/20 hover:bg-background/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {formatDate(user.created_at)}
                        </p>
                      
                      </div>
                    </td>
                
                    <td className="py-3 px-4">
                      <Badge className={
                        user.current_plan === 'elite' ? 'bg-purple-500/20 text-purple-500 border-purple-500/30' :
                        user.current_plan === 'pro' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                        'bg-gray-500/20 text-gray-500 border-gray-500/30'
                      }>
                        {user.current_plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        <Badge className={
                          user.status === "active" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                          user.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                          "bg-gray-500/20 text-gray-500 border-gray-500/30"
                        }>
                          {user.status}
                        </Badge>
                        <div>
                          <Badge className={
                            user.kyc_status === "verified" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                            user.kyc_status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                            user.kyc_status === "rejected" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                            "bg-gray-500/20 text-gray-500 border-gray-500/30"
                          }>
                            KYC: {user.kyc_status}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewDetails(user)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="flex-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          {user.status === "active" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleSuspendUser(user)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleActivateUser(user)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}