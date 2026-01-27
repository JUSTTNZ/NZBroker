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
  Calendar,
  X,
  Wallet,
  ArrowDownToLine,
  ArrowUpToLine,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { fetchAllUsers, fetchUserDetails, type AdminUser, type DetailedUserInfo } from "@/lib/admin"

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DetailedUserInfo | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'deposits' | 'withdrawals' | 'trades' | 'transactions'>('profile')
  const [showPassword, setShowPassword] = useState(false)

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // User management actions
  const handleApproveUser = (user: AdminUser) => {
    console.log("Approve user:", user.id)
  }

  const handleSuspendUser = (user: AdminUser) => {
    console.log("Suspend user:", user.id)
  }

  const handleActivateUser = (user: AdminUser) => {
    console.log("Activate user:", user.id)
  }

  const handleViewDetails = async (user: AdminUser) => {
    setLoadingDetails(true)
    setShowUserModal(true)
    setActiveTab('profile')
    setShowPassword(false)

    const details = await fetchUserDetails(user.id)
    setSelectedUser(details)
    setLoadingDetails(false)
  }

  const closeModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setShowPassword(false)
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string, text: string, border: string }> = {
      completed: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
      pending: { bg: "bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500/30" },
      pending_payment: { bg: "bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500/30" },
      payment_pending: { bg: "bg-orange-500/20", text: "text-orange-500", border: "border-orange-500/30" },
      approved: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
      rejected: { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500/30" },
      failed: { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500/30" },
      cancelled: { bg: "bg-gray-500/20", text: "text-gray-500", border: "border-gray-500/30" },
      open: { bg: "bg-blue-500/20", text: "text-blue-500", border: "border-blue-500/30" },
      closed: { bg: "bg-gray-500/20", text: "text-gray-500", border: "border-gray-500/30" },
      filled: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
    }
    const c = config[status] || { bg: "bg-gray-500/20", text: "text-gray-500", border: "border-gray-500/30" }
    return (
      <Badge className={`${c.bg} ${c.text} ${c.border} capitalize`}>
        {status.replace('_', ' ')}
      </Badge>
    )
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
      <Card className="p-4 md:p-6 bg-card/50 border-border/40">
        <div className="flex flex-col gap-4">
          {/* Search - Full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Status Filter - Responsive grid */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2 text-muted-foreground">Filter by Status</p>
              <div className="grid grid-cols-2 sm:flex gap-2">
                {["all", "active", "pending", "inactive"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="flex-1 sm:flex-initial justify-between sm:justify-center"
                  >
                    <span className="hidden sm:inline">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="sm:hidden">
                      {status === "all" ? "All" :
                       status === "active" ? "Active" :
                       status === "pending" ? "Pending" :
                       "Inactive"}
                    </span>
                    <Badge className="ml-2 bg-muted text-muted-foreground text-xs">
                      {statusCounts[status as keyof typeof statusCounts]}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6 bg-card/50 border-border/40">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
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
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border/40 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {loadingDetails ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading user details...</p>
              </div>
            ) : selectedUser ? (
              <div className="p-4 md:p-6">
                {/* User Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-6 border-b border-border/40">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedUser.profile.full_name || "No Name"}</h3>
                    <p className="text-muted-foreground">{selectedUser.profile.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={
                        selectedUser.profile.status === "active" ? "bg-green-500/20 text-green-500" :
                        selectedUser.profile.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-gray-500/20 text-gray-500"
                      }>
                        {selectedUser.profile.status}
                      </Badge>
                      <Badge className={
                        selectedUser.profile.kyc_status === "verified" ? "bg-green-500/20 text-green-500" :
                        selectedUser.profile.kyc_status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-gray-500/20 text-gray-500"
                      }>
                        KYC: {selectedUser.profile.kyc_status}
                      </Badge>
                      <Badge className={
                        selectedUser.profile.current_plan === "elite" ? "bg-purple-500/20 text-purple-500" :
                        selectedUser.profile.current_plan === "pro" ? "bg-blue-500/20 text-blue-500" :
                        "bg-gray-500/20 text-gray-500"
                      }>
                        {selectedUser.profile.current_plan} Plan
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs">{selectedUser.profile.id}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-border/40 pb-4">
                  {[
                    { id: 'profile', label: 'Profile Details', icon: Users },
                    { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine },
                    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpToLine },
                    { id: 'trades', label: 'Trades', icon: TrendingUp },
                    { id: 'transactions', label: 'All Transactions', icon: Activity },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as any)}
                      className="gap-2"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.id === 'deposits' && (
                        <Badge variant="secondary" className="ml-1">{selectedUser.deposits.length}</Badge>
                      )}
                      {tab.id === 'withdrawals' && (
                        <Badge variant="secondary" className="ml-1">{selectedUser.withdrawals.length}</Badge>
                      )}
                      {tab.id === 'trades' && (
                        <Badge variant="secondary" className="ml-1">{selectedUser.trades.length}</Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Information */}
                    <Card className="p-6 bg-card/50 border-border/40">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Profile Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium">{selectedUser.profile.full_name || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedUser.profile.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedUser.profile.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Country</p>
                            <p className="font-medium">{selectedUser.profile.country || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="font-medium capitalize">{selectedUser.profile.role}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Account Type</p>
                            <Badge variant="outline">{selectedUser.profile.account_type}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Referral Code</p>
                            <p className="font-mono">{selectedUser.profile.referral_code || "None"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Joined</p>
                            <p className="font-medium">{formatDateTime(selectedUser.profile.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Security Information */}
                    <Card className="p-6 bg-card/50 border-border/40">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">User ID</p>
                          <p className="font-mono text-sm break-all">{selectedUser.profile.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Password</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">
                              {showPassword
                                ? (selectedUser.profile.password || "Stored in Auth System")
                                : "••••••••••••"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedUser.profile.password
                              ? "Plain text password stored"
                              : "Password is securely hashed in Supabase Auth"}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Wallet Balances */}
                    <Card className="p-6 bg-card/50 border-border/40">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Wallet Balances
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUser.wallets.map((wallet) => (
                          <Card key={wallet.id} className={`p-4 ${wallet.account_type === 'live' ? 'border-green-500/30' : 'border-blue-500/30'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={wallet.account_type === 'live' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}>
                                {wallet.account_type.toUpperCase()} Account
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Balance:</span>
                                <span className="font-bold">${wallet.total_balance?.toLocaleString() || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Trading Balance:</span>
                                <span className="font-medium">${wallet.trading_balance?.toLocaleString() || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Bot Trading:</span>
                                <span className="font-medium">${wallet.bot_trading_balance?.toLocaleString() || '0.00'}</span>
                              </div>
                              {wallet.locked_balance !== undefined && wallet.locked_balance > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Locked:</span>
                                  <span className="font-medium text-yellow-500">${wallet.locked_balance?.toLocaleString()}</span>
                                </div>
                              )}
                              {wallet.bonus_balance !== undefined && wallet.bonus_balance > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Bonus:</span>
                                  <span className="font-medium text-purple-500">${wallet.bonus_balance?.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                        {selectedUser.wallets.length === 0 && (
                          <p className="text-muted-foreground col-span-2 text-center py-4">No wallets found</p>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'deposits' && (
                  <Card className="p-6 bg-card/50 border-border/40">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowDownToLine className="w-5 h-5 text-green-500" />
                      Deposits ({selectedUser.deposits.length})
                    </h4>
                    {selectedUser.deposits.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Amount</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Type</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Status</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.deposits.map((deposit) => (
                              <tr key={deposit.id} className="border-b border-border/20">
                                <td className="py-2 px-3 text-sm">{formatDateTime(deposit.created_at)}</td>
                                <td className="py-2 px-3 text-sm font-bold text-green-500">
                                  +${Math.abs(deposit.amount).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-sm">
                                  <Badge variant="outline">{deposit.type}</Badge>
                                </td>
                                <td className="py-2 px-3">{getStatusBadge(deposit.status)}</td>
                                <td className="py-2 px-3 text-sm text-muted-foreground max-w-[200px] truncate">
                                  {deposit.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No deposits found</p>
                    )}
                  </Card>
                )}

                {activeTab === 'withdrawals' && (
                  <Card className="p-6 bg-card/50 border-border/40">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowUpToLine className="w-5 h-5 text-red-500" />
                      Withdrawals ({selectedUser.withdrawals.length})
                    </h4>
                    {selectedUser.withdrawals.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Amount</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Method</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Status</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Fee</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Net Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.withdrawals.map((withdrawal) => (
                              <tr key={withdrawal.id} className="border-b border-border/20">
                                <td className="py-2 px-3 text-sm">{formatDateTime(withdrawal.created_at)}</td>
                                <td className="py-2 px-3 text-sm font-bold text-red-500">
                                  -${withdrawal.amount.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-sm">
                                  <Badge variant="outline" className="capitalize">{withdrawal.method}</Badge>
                                </td>
                                <td className="py-2 px-3">{getStatusBadge(withdrawal.status)}</td>
                                <td className="py-2 px-3 text-sm">${withdrawal.admin_fee?.toLocaleString() || '0'}</td>
                                <td className="py-2 px-3 text-sm font-medium">${withdrawal.net_amount?.toLocaleString() || withdrawal.amount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No withdrawals found</p>
                    )}
                  </Card>
                )}

                {activeTab === 'trades' && (
                  <Card className="p-6 bg-card/50 border-border/40">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Trades ({selectedUser.trades.length})
                    </h4>
                    {selectedUser.trades.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Symbol</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Side</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Quantity</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Entry Price</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Exit Price</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">P/L</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.trades.map((trade) => (
                              <tr key={trade.id} className="border-b border-border/20">
                                <td className="py-2 px-3 text-sm">{formatDateTime(trade.created_at)}</td>
                                <td className="py-2 px-3 text-sm font-medium">{trade.symbol}</td>
                                <td className="py-2 px-3">
                                  <Badge className={trade.side === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                                    {trade.side.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 text-sm">{trade.quantity}</td>
                                <td className="py-2 px-3 text-sm">${trade.entry_price?.toFixed(2)}</td>
                                <td className="py-2 px-3 text-sm">{trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}</td>
                                <td className="py-2 px-3 text-sm">
                                  {trade.profit_loss !== undefined ? (
                                    <span className={trade.profit_loss >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                      {trade.profit_loss >= 0 ? '+' : ''}{trade.profit_loss.toFixed(2)}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="py-2 px-3">{getStatusBadge(trade.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No trades found</p>
                    )}
                  </Card>
                )}

                {activeTab === 'transactions' && (
                  <Card className="p-6 bg-card/50 border-border/40">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      All Transactions ({selectedUser.transactions.length})
                    </h4>
                    {selectedUser.transactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Type</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Amount</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Account</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Status</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-border/20">
                                <td className="py-2 px-3 text-sm">{formatDateTime(tx.created_at)}</td>
                                <td className="py-2 px-3">
                                  <Badge variant="outline" className="capitalize">{tx.type.replace('_', ' ')}</Badge>
                                </td>
                                <td className={`py-2 px-3 text-sm font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-sm">
                                  <Badge variant="secondary">{tx.account_type}</Badge>
                                </td>
                                <td className="py-2 px-3">{getStatusBadge(tx.status)}</td>
                                <td className="py-2 px-3 text-sm text-muted-foreground max-w-[200px] truncate" title={tx.description}>
                                  {tx.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No transactions found</p>
                    )}
                  </Card>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p>Failed to load user details</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
