"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter
} from "lucide-react"

const withdrawals = [
  { id: 1, user: "John Doe", amount: 2500, method: "Bank Transfer", date: "2024-12-15", status: "pending" },
  { id: 2, user: "Jane Smith", amount: 1500, method: "Crypto (BTC)", date: "2024-12-14", status: "pending" },
  { id: 3, user: "Bob Johnson", amount: 3200, method: "E-Wallet", date: "2024-12-13", status: "approved" },
  { id: 4, user: "Alice Brown", amount: 1800, method: "Bank Transfer", date: "2024-12-12", status: "rejected" },
  { id: 5, user: "Mike Wilson", amount: 4200, method: "Crypto (ETH)", date: "2024-12-11", status: "pending" },
  { id: 6, user: "Sarah Davis", amount: 950, method: "E-Wallet", date: "2024-12-10", status: "pending" },
]

export default function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<number | null>(null)

  const filteredWithdrawals = withdrawals.filter(w => 
    statusFilter === "all" || w.status === statusFilter
  )

  const handleApprove = (id: number) => {
    alert(`Withdrawal ${id} approved`)
  }

  const handleReject = (id: number) => {
    alert(`Withdrawal ${id} rejected`)
  }

  const totalPending = withdrawals.filter(w => w.status === "pending").length
  const totalAmount = withdrawals.filter(w => w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-muted-foreground">Review and approve user withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-500">{totalPending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Pending Amount</p>
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Requires Attention</p>
              <p className="text-2xl font-bold text-red-500">3</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <Badge className="ml-2">
                {withdrawals.filter(w => status === "all" || w.status === status).length}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {filteredWithdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="p-6 bg-card/50 border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">{withdrawal.user}</h3>
                  <Badge className={
                    withdrawal.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                    withdrawal.status === "approved" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                    "bg-red-500/20 text-red-500 border-red-500/30"
                  }>
                    {withdrawal.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold">${withdrawal.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">{withdrawal.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{withdrawal.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-mono">#{withdrawal.id.toString().padStart(6, '0')}</p>
                  </div>
                </div>
              </div>
              {withdrawal.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleReject(withdrawal.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(withdrawal.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
            {selectedWithdrawal === withdrawal.id && (
              <div className="mt-4 p-4 bg-background/30 rounded-lg border border-border/40">
                <h4 className="font-medium mb-2">Withdrawal Details</h4>
                <p className="text-sm text-muted-foreground">
                  User has completed KYC verification. Bank details verified. 
                  Previous withdrawals: 3 successful transactions.
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}