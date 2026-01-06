"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download,
  Eye,
  TrendingUp,
  TrendingDown
} from "lucide-react"

const transactions = [
  { id: 1, user: "John Doe", type: "withdrawal", amount: -2500, status: "pending", date: "2024-12-15", method: "Bank" },
  { id: 2, user: "Jane Smith", type: "deposit", amount: 5000, status: "completed", date: "2024-12-14", method: "Crypto" },
  { id: 3, user: "Bob Johnson", type: "withdrawal", amount: -1500, status: "completed", date: "2024-12-13", method: "E-Wallet" },
  { id: 4, user: "Alice Brown", type: "deposit", amount: 10000, status: "completed", date: "2024-12-12", method: "Bank" },
  { id: 5, user: "Mike Wilson", type: "withdrawal", amount: -3200, status: "rejected", date: "2024-12-11", method: "Crypto" },
  { id: 6, user: "Sarah Davis", type: "deposit", amount: 2500, status: "completed", date: "2024-12-10", method: "Card" },
]

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.user.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const totalDeposits = transactions
    .filter(t => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const pendingAmount = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">View and manage all user transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Deposits</p>
              <p className="text-2xl font-bold text-green-500">${totalDeposits.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-500">${totalWithdrawals.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-500" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-500">${pendingAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
            >
              All Types
            </Button>
            <Button
              variant={typeFilter === "deposit" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("deposit")}
            >
              Deposits
            </Button>
            <Button
              variant={typeFilter === "withdrawal" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("withdrawal")}
            >
              Withdrawals
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">All Transactions</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Method</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border/20 hover:bg-background/30">
                  <td className="py-3 px-4 font-mono">#{t.id.toString().padStart(6, '0')}</td>
                  <td className="py-3 px-4 font-medium">{t.user}</td>
                  <td className="py-3 px-4">
                    <Badge className={
                      t.type === "deposit" 
                        ? "bg-green-500/20 text-green-500 border-green-500/30" 
                        : "bg-red-500/20 text-red-500 border-red-500/30"
                    }>
                      {t.type}
                    </Badge>
                  </td>
                  <td className={`py-3 px-4 font-bold ${
                    t.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={
                      t.status === "completed" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                      t.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                      "bg-red-500/20 text-red-500 border-red-500/30"
                    }>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{t.method}</td>
                  <td className="py-3 px-4">{t.date}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
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