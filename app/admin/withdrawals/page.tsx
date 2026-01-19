"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  Search,
  User,
  Building,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquare,
  Send
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { read } from "fs"

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  account_type: "demo" | "live"
  method: "bank" | "ewallet" | "crypto"
  status: "pending_payment" | "payment_pending" | "payment_received" | "approved" | "processing" | "completed" | "rejected" | "cancelled"
  admin_fee: number
  net_amount: number
  details: string
  payment_details: string
  admin_notes: string
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  user_email?: string
  user_name?: string
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("pending_payment")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentInstructions, setPaymentInstructions] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch withdrawals from database
  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      
      // Fetch withdrawals with user information
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false })

      if (withdrawalsError) throw withdrawalsError

      // Fetch user information for each withdrawal
      const withdrawalsWithUserInfo = await Promise.all(
        withdrawalsData.map(async (withdrawal) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", withdrawal.user_id)
            .single()

          return {
            ...withdrawal,
            user_email: userData?.email || "Unknown",
            user_name: userData?.full_name || "Unknown User"
          }
        })
      )

      setWithdrawals(withdrawalsWithUserInfo)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      toast.error("Failed to load withdrawals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesStatus = statusFilter === "all" || w.status === statusFilter
    const matchesSearch = searchTerm === "" || 
      w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.method.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Calculate statistics
  const stats = {
    pending_payment: withdrawals.filter(w => w.status === "pending_payment").length,
    payment_pending: withdrawals.filter(w => w.status === "payment_pending").length,
    approved: withdrawals.filter(w => w.status === "approved").length,
    completed: withdrawals.filter(w => w.status === "completed").length,
    total_pending_amount: withdrawals
      .filter(w => ["pending_payment", "payment_pending"].includes(w.status))
      .reduce((sum, w) => sum + w.amount, 0)
  }

  // Handle providing payment instructions
// Handle providing payment instructions
const handleProvidePaymentInstructions = async (withdrawal: Withdrawal) => {
  if (!paymentAmount || !paymentInstructions) {
    toast.error("Please enter admin fee amount and payment instructions")
    return
  }

  const adminFeeValue = parseFloat(paymentAmount) || 0
  
  setProcessingAction("providing_payment")
  try {
    const { error } = await supabase
      .from("withdrawals")
      .update({
        status: "payment_pending",
        admin_fee: adminFeeValue, // KEEP THIS
        net_amount: withdrawal.amount - adminFeeValue, // KEEP THIS
        payment_details: paymentInstructions,
        updated_at: new Date().toISOString()
      })
      .eq("id", withdrawal.id)

    if (error) throw error

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: withdrawal.user_id,
      title: "Payment Instructions Received",
      message: `Admin has provided payment instructions for your $${withdrawal.amount} withdrawal. Please check the payment details.`,
      type: "withdrawal",
      read: false,
      created_at: new Date().toISOString()
    })

    toast.success("Payment instructions sent to user")
    setShowPaymentModal(false)
    setPaymentAmount("")
    setPaymentInstructions("")
    fetchWithdrawals()
  } catch (error) {
    console.error("Error updating withdrawal:", error)
    toast.error("Failed to send payment instructions")
  } finally {
    setProcessingAction(null)
  }
}

  // Handle approving withdrawal
// Handle approving withdrawal
const handleApproveWithdrawal = async (withdrawal: Withdrawal) => {
  setProcessingAction("approving")
  try {
    // First get the current wallet to see the locked_balance
    const { data: currentWallet, error: walletFetchError } = await supabase
      .from("wallets")
      .select("locked_balance")
      .eq("user_id", withdrawal.user_id)
      .eq("account_type", withdrawal.account_type)
      .single()

    if (walletFetchError) {
      console.error("Error fetching wallet:", walletFetchError)
      throw new Error("Failed to fetch wallet data")
    }

    // Calculate new locked balance
    const currentLockedBalance = currentWallet?.locked_balance || 0
    const newLockedBalance = currentLockedBalance - withdrawal.amount

    // Update withdrawal status
    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .update({
        status: "completed", // Directly to completed
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", withdrawal.id)

    if (withdrawalError) throw withdrawalError

    // Update wallet - deduct from locked balance
    const { error: walletUpdateError } = await supabase
      .from("wallets")
      .update({
        locked_balance: newLockedBalance,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", withdrawal.user_id)
      .eq("account_type", withdrawal.account_type)

    if (walletUpdateError) {
      console.error("Wallet update error:", walletUpdateError)
      // Continue anyway - we already updated withdrawal status
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      account_type: withdrawal.account_type,
      type: "withdrawal",
      amount: -withdrawal.amount,
      description: `Withdrawal completed via ${withdrawal.method}`,
      status: "completed",
      reference_id: `WDR_COMPLETED_${withdrawal.id}`,
      created_at: new Date().toISOString()
    })

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: withdrawal.user_id,
      title: "Withdrawal Completed",
      message: `Your withdrawal request for $${withdrawal.amount} has been processed and funds have been sent.`,
      type: "withdrawal",
      read: false,
      created_at: new Date().toISOString()
    })

    toast.success("Withdrawal approved and completed")
    setShowApproveModal(false)
    fetchWithdrawals()
  } catch (error) {
    console.error("Error approving withdrawal:", error)
    toast.error("Failed to approve withdrawal")
  } finally {
    setProcessingAction(null)
  }
}

  // Handle rejecting withdrawal
  const handleRejectWithdrawal = async (withdrawal: Withdrawal) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setProcessingAction("rejecting")
    try {
      const { error } = await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          admin_notes: rejectReason,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", withdrawal.id)

      if (error) throw error

      // Return locked funds to wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          locked_balance: supabase.rpc('decrement', { 
            table_name: 'wallets', 
            column_name: 'locked_balance', 
            x: withdrawal.amount,
            user_id: withdrawal.user_id,
            account_type: withdrawal.account_type 
          }),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", withdrawal.user_id)
        .eq("account_type", withdrawal.account_type)

      if (walletError) {
        console.error("Wallet update error:", walletError)
        // Continue anyway
      }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Withdrawal Rejected",
        message: `Your withdrawal request for $${withdrawal.amount} has been rejected. Reason: ${rejectReason}`,
        type: "withdrawal_rejection",
        is_read: false,
        created_at: new Date().toISOString()
      })

      toast.success("Withdrawal rejected")
      setShowRejectModal(false)
      setRejectReason("")
      fetchWithdrawals()
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      toast.error("Failed to reject withdrawal")
    } finally {
      setProcessingAction(null)
    }
  }



  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, bg: string, border: string }> = {
      pending_payment: { color: "text-yellow-500", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
      payment_pending: { color: "text-orange-500", bg: "bg-orange-500/20", border: "border-orange-500/30" },
      payment_received: { color: "text-blue-500", bg: "bg-blue-500/20", border: "border-blue-500/30" },
      approved: { color: "text-green-500", bg: "bg-green-500/20", border: "border-green-500/30" },
      processing: { color: "text-purple-500", bg: "bg-purple-500/20", border: "border-purple-500/30" },
      completed: { color: "text-green-700", bg: "bg-green-700/20", border: "border-green-700/30" },
      rejected: { color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/30" },
      cancelled: { color: "text-gray-500", bg: "bg-gray-500/20", border: "border-gray-500/30" }
    }

    const config = statusConfig[status] || { color: "text-gray-500", bg: "bg-gray-500/20", border: "border-gray-500/30" }
    
    return (
      <Badge className={`${config.bg} ${config.color} ${config.border} capitalize`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getMethodIcon = (method: string) => {
    switch(method) {
      case "bank": return <Building className="w-4 h-4" />
      case "ewallet": return <CreditCard className="w-4 h-4" />
      case "crypto": return <Wallet className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-muted-foreground">Review and process user withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Awaiting Payment</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending_payment}</p>
              <p className="text-xs text-muted-foreground">Need payment instructions</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Pending Amount</p>
              <p className="text-2xl font-bold">${stats.total_pending_amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Across all pending statuses</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Payment Pending</p>
              <p className="text-2xl font-bold text-orange-500">{stats.payment_pending}</p>
              <p className="text-xs text-muted-foreground">Waiting user payment</p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by user, email, ID, or method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "pending_payment", "payment_pending", "completed", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "All" : status.replace('_', ' ')}
                {status !== "all" && (
                  <Badge className="ml-2">
                    {withdrawals.filter(w => w.status === status).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWithdrawals}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Withdrawals List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading withdrawals...</p>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No withdrawals found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="p-6 bg-card/50 border-border/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getMethodIcon(withdrawal.method)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{withdrawal.user_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {withdrawal.account_type === "demo" ? "Demo" : "Live"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{withdrawal.user_email}</p>
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold">${withdrawal.amount.toLocaleString()}</p>
                      {withdrawal.admin_fee > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Fee: ${withdrawal.admin_fee} • Net: ${withdrawal.net_amount}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium capitalize">{withdrawal.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID</p>
                      <p className="font-mono text-sm truncate" title={withdrawal.id}>
                        {withdrawal.id.substring(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Details</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => setSelectedWithdrawal(
                          selectedWithdrawal?.id === withdrawal.id ? null : withdrawal
                        )}
                      >
                        {selectedWithdrawal?.id === withdrawal.id ? (
                          <EyeOff className="w-4 h-4 mr-1" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {withdrawal.status === "pending_payment" && (
                    <Button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal)
                        setShowPaymentModal(true)
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Provide Payment
                    </Button>
                  )}
                  
                  {withdrawal.status === "payment_pending" && (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setShowApproveModal(true)
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setShowRejectModal(true)
                        }}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {withdrawal.status === "approved" && (
                    <Button
                      // onClick={() => handleCompleteWithdrawal(withdrawal)}
                      disabled={processingAction === "completing"}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {processingAction === "completing" ? "Processing..." : "Mark as Sent"}
                    </Button>
                  )}
                  
                  {withdrawal.status === "completed" && (
                    <Badge className="bg-green-700/20 text-green-700 border-green-700/30">
                      Completed
                    </Badge>
                  )}
                  
                  {withdrawal.status === "rejected" && (
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Details Panel */}
              {selectedWithdrawal?.id === withdrawal.id && (
                <div className="mt-4 p-4 bg-background/30 rounded-lg border border-border/40">
                  <h4 className="font-medium mb-2">Withdrawal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">User Details:</p>
                      <p className="text-sm">{withdrawal.user_name} ({withdrawal.user_email})</p>
                      <p className="text-sm">Account Type: {withdrawal.account_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Withdrawal Info:</p>
                      <p className="text-sm">Method: {withdrawal.method}</p>
                      <p className="text-sm">Requested: {new Date(withdrawal.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {withdrawal.details && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">User Provided Details:</p>
                      <p className="text-sm bg-background/50 p-2 rounded">{withdrawal.details}</p>
                    </div>
                  )}
                  {withdrawal.payment_details && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Payment Instructions:</p>
                      <p className="text-sm bg-blue-500/10 p-2 rounded">{withdrawal.payment_details}</p>
                    </div>
                  )}
                  {withdrawal.admin_notes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm bg-red-500/10 p-2 rounded">{withdrawal.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Payment Instructions Modal */}

{showPaymentModal && selectedWithdrawal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-md p-6">
      <h3 className="text-lg font-semibold mb-4">Provide Payment Instructions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        User: {selectedWithdrawal.user_name}<br />
        Amount: ${selectedWithdrawal.amount}
      </p>
      <div className="space-y-4">
        {/* KEEP THIS ADMIN FEE INPUT */}
        <div>
          <label className="block text-sm font-medium mb-2">Admin Fee Amount ($)</label>
          <Input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter admin fee amount"
            min="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the admin fee amount (e.g., 25 for $25 fee)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment Instructions</label>
          <Textarea
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="Provide payment details (bank account, crypto address, etc.)"
            rows={4}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setShowPaymentModal(false)
            setPaymentAmount("")
            setPaymentInstructions("")
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          onClick={() => handleProvidePaymentInstructions(selectedWithdrawal)}
          disabled={processingAction === "providing_payment"}
        >
          {processingAction === "providing_payment" ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Instructions
            </>
          )}
        </Button>
      </div>
    </Card>
  </div>
)}

      {/* Approve Modal */}
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Approve Withdrawal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to approve this withdrawal?<br /><br />
              User: {selectedWithdrawal.user_name}<br />
              Amount: ${selectedWithdrawal.amount}<br />
              Method: {selectedWithdrawal.method}
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleApproveWithdrawal(selectedWithdrawal)}
                disabled={processingAction === "approving"}
              >
                {processingAction === "approving" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Withdrawal
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Withdrawal</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                User: {selectedWithdrawal.user_name}<br />
                Amount: ${selectedWithdrawal.amount}
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this withdrawal..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason("")
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => handleRejectWithdrawal(selectedWithdrawal)}
                disabled={processingAction === "rejecting"}
              >
                {processingAction === "rejecting" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Withdrawal
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