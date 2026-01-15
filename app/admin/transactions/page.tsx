"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Search, 
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpToLine,
  Smartphone,
  Building,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Transaction {
  idx: number
  id: string
  user_id: string
  account_type: string
  type: string
  amount: string
  description: string
  metadata: any
  status: string
  reference_id: string
  created_at: string
  user_name?: string
  user_email?: string
}

type TransactionType = "deposit" | "withdrawal" | "transfer" | "all"
type TransactionStatus = "completed" | "pending" | "failed" | "all"

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TransactionType>("all")
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Initialize Supabase client[citation:1][citation:4]
  const supabase = createClient()

  // Fetch transactions from Supabase[citation:1][citation:4]
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        
        // Create base query
        let query = supabase
          .from("transactions")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })

        // Apply filters
        if (typeFilter !== "all") {
          query = query.eq("type", typeFilter)
        }

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        if (search) {
          query = query.or(`reference_id.ilike.%${search}%,description.ilike.%${search}%`)
        }

        // Pagination
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) throw error

        // Fetch user details for each transaction[citation:4]
        const enrichedTransactions = await Promise.all(
          (data || []).map(async (transaction) => {
            try {
              const { data: userData } = await supabase
                .from("users")
                .select("email, name")
                .eq("id", transaction.user_id)
                .single()

              return {
                ...transaction,
                user_name: userData?.name || `User ${transaction.user_id.slice(0, 8)}`,
                user_email: userData?.email || "N/A"
              }
            } catch {
              return {
                ...transaction,
                user_name: `User ${transaction.user_id.slice(0, 8)}`,
                user_email: "N/A"
              }
            }
          })
        )

        setTransactions(enrichedTransactions)
        setTotalPages(Math.ceil((count || 0) / itemsPerPage))
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [search, typeFilter, statusFilter, currentPage])

  const totalDeposits = transactions
    .filter(t => t.type === "transfer" && t.status === "completed" && parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalWithdrawals = transactions
    .filter(t => t.type === "transfer" && t.status === "completed" && parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

  const pendingAmount = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getPaymentMethod = (description: string) => {
    if (description.includes("bank")) return "Bank"
    if (description.includes("crypto")) return "Crypto"
    if (description.includes("card")) return "Card"
    return "Wallet"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">View and manage all user transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 md:p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Deposits</p>
              <p className="text-xl md:text-2xl font-bold text-green-500">${totalDeposits.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Withdrawals</p>
              <p className="text-xl md:text-2xl font-bold text-red-500">${totalWithdrawals.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pending Amount</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-500">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters - Responsive Layout */}
      <Card className="p-4 md:p-6 bg-card/50 border-border/40">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Reference ID or Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={typeFilter} onValueChange={(value: TransactionType) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={statusFilter} onValueChange={(value: TransactionStatus) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table - Responsive */}
      <Card className="p-4 md:p-6 bg-card/50 border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold">All Transactions</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">
                        {t.reference_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{t.user_name}</p>
                          <p className="text-xs text-muted-foreground">{t.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          t.type === "deposit" 
                            ? "bg-green-500/20 text-green-500 border-green-500/30" 
                            : t.type === "withdrawal"
                            ? "bg-red-500/20 text-red-500 border-red-500/30"
                            : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                        }>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-bold ${
                        parseFloat(t.amount) > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {parseFloat(t.amount) > 0 ? '+' : ''}${Math.abs(parseFloat(t.amount)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          t.status === "completed" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                          t.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                          "bg-red-500/20 text-red-500 border-red-500/30"
                        }>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethod(t.description.toLowerCase()) === "Bank" && <Building className="w-4 h-4" />}
                          {getPaymentMethod(t.description.toLowerCase()) === "Crypto" && <Smartphone className="w-4 h-4" />}
                          {getPaymentMethod(t.description.toLowerCase()) === "Card" && <CreditCard className="w-4 h-4" />}
                          {getPaymentMethod(t.description.toLowerCase())}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(t.created_at)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(t.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {transactions.map((t) => (
                <Card key={t.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.user_name}</p>
                        <p className="text-xs text-muted-foreground">{t.user_email}</p>
                      </div>
                      <Badge className={
                        t.status === "completed" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                        t.status === "pending" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                        "bg-red-500/20 text-red-500 border-red-500/30"
                      }>
                        {t.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={
                        t.type === "deposit" 
                          ? "bg-green-500/20 text-green-500 border-green-500/30" 
                          : t.type === "withdrawal"
                          ? "bg-red-500/20 text-red-500 border-red-500/30"
                          : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                      }>
                        {t.type}
                      </Badge>
                      <p className={`text-lg font-bold ${
                        parseFloat(t.amount) > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {parseFloat(t.amount) > 0 ? '+' : ''}${Math.abs(parseFloat(t.amount)).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {getPaymentMethod(t.description.toLowerCase()) === "Bank" && <Building className="w-3 h-3" />}
                        {getPaymentMethod(t.description.toLowerCase()) === "Crypto" && <Smartphone className="w-3 h-3" />}
                        {getPaymentMethod(t.description.toLowerCase()) === "Card" && <CreditCard className="w-3 h-3" />}
                        {getPaymentMethod(t.description.toLowerCase())}
                      </div>
                      <div className="text-right">
                        <p>{formatDate(t.created_at)}</p>
                        <p className="text-xs">{formatTime(t.created_at)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs font-mono truncate">{t.reference_id}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{t.description}</p>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}