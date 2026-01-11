// app/admin/plan-requests/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client" // Import browser client
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Calendar,
  CreditCard,
  AlertCircle
} from "lucide-react"

interface PlanRequest {
  id: string
  user_id: string
  plan: "basic" | "pro" | "elite"
  amount_paid: number
  payment_method: string | null
  status: "pending" | "approved" | "rejected" | "active" | "cancelled" | "expired"
  starts_at: string | null
  ends_at: string | null
  created_at: string
  profiles: {
    id: string
    email: string
    full_name: string
    current_plan: string
    created_at: string
  }
}

export default function PlanRequestsPage() {
  const [requests, setRequests] = useState<PlanRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<PlanRequest[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const supabase = createClient() // Browser client

  useEffect(() => {
    loadPlanRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, search, statusFilter])

  const loadPlanRequests = async () => {
    setLoading(true)
    try {
      // Fetch plan requests with user profiles
      const { data: requestsData, error } = await supabase
        .from("user_plans")
        .select(`
          *,
          profiles:profiles!user_plans_user_id_fkey (
            id,
            email,
            full_name,
            current_plan,
            created_at
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading plan requests:", error)
        toast.error("Failed to load plan requests")
        setRequests([])
      } else {
        setRequests(requestsData || [])
      }
    } catch (error) {
      console.error("Error loading plan requests:", error)
      toast.error("Failed to load plan requests")
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(request =>
        request.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        request.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
        request.plan.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleApprovePlan = async (requestId: string, userId: string, plan: string) => {
    if (!confirm("Are you sure you want to approve this plan request?")) return

    setProcessingId(requestId)
    try {
      // Calculate end date based on plan
      const startsAt = new Date().toISOString()
      let endsAt = null
      
      if (plan === "pro") {
        endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } else if (plan === "elite") {
        endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      // 1. Update the plan request to active
      const { error: updateError } = await supabase
        .from("user_plans")
        .update({
          status: "active",
          starts_at: startsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // 2. Update user's profile with new plan
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          current_plan: plan,
          plan_expires_at: endsAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (profileError) {
        console.warn("Profile update warning:", profileError)
        // Continue anyway
      }

      // 3. Invalidate any other pending requests for this user
      await supabase
        .from("user_plans")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("status", "pending")
        .neq("id", requestId)

      // 4. Create notification for user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Plan Upgrade Approved! 🎉",
        message: `Your upgrade to ${plan} plan has been approved. Your new features are now active!`,
        type: "plan_upgrade",
        is_read: false,
        created_at: new Date().toISOString()
      })

      toast.success("Plan approved successfully!")
      await loadPlanRequests() // Refresh data
      
    } catch (error: any) {
      console.error("Error approving plan:", error)
      toast.error(error.message || "Failed to approve plan")
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectPlan = async (requestId: string, userId: string, plan: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    setProcessingId(requestId)
    try {
      // 1. Update the plan request to rejected
      const { error: updateError } = await supabase
        .from("user_plans")
        .update({
          status: "rejected",
          payment_method: reason ? `Rejected: ${reason}` : "Rejected by admin",
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // 2. Create notification for user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Plan Upgrade Declined",
        message: `Your upgrade to ${plan} plan was declined. ${reason ? `Reason: ${reason}` : "Please contact support for more information."}`,
        type: "plan_upgrade",
        is_read: false,
        created_at: new Date().toISOString()
      })

      toast.success("Plan request rejected!")
      await loadPlanRequests() // Refresh data
      
    } catch (error: any) {
      console.error("Error rejecting plan:", error)
      toast.error(error.message || "Failed to reject plan")
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      approved: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      active: "bg-green-500/20 text-green-600 border-green-500/30",
      rejected: "bg-red-500/20 text-red-600 border-red-500/30",
      cancelled: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      expired: "bg-gray-500/20 text-gray-600 border-gray-500/30"
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants = {
      basic: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      pro: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      elite: "bg-purple-500/20 text-purple-600 border-purple-500/30"
    }
    
    return (
      <Badge className={variants[plan as keyof typeof variants] || variants.basic}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plan Upgrade Requests</h1>
        <p className="text-muted-foreground">Review and manage user plan upgrade requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Total Requests</p>
          <p className="text-2xl font-bold">{requests.length}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">
            {requests.filter(r => r.status === "pending").length}
          </p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Approved</p>
          <p className="text-2xl font-bold text-blue-500">
            {requests.filter(r => r.status === "approved").length}
          </p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Active</p>
          <p className="text-2xl font-bold text-green-500">
            {requests.filter(r => r.status === "active").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <Badge className="ml-2 bg-muted text-muted-foreground">
                  {requests.filter(r => status === "all" || r.status === status).length}
                </Badge>
              </Button>
            ))}
          </div>
          <Button onClick={loadPlanRequests} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="p-6 bg-card/50 border-border/40">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading plan requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {requests.length === 0 
              ? "No plan requests found" 
              : "No plan requests matching your criteria"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="p-6 border-border/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.profiles?.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {request.profiles?.email || "No email"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Requested: {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Plan</p>
                        {getPlanBadge(request.profiles?.current_plan || "basic")}
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requested Plan</p>
                        {getPlanBadge(request.plan)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="w-3 h-3 mr-1" />
                        ${request.amount_paid}
                      </Badge>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectPlan(request.id, request.user_id, request.plan)}
                          disabled={processingId === request.id}
                          className="gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprovePlan(request.id, request.user_id, request.plan)}
                          disabled={processingId === request.id}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processingId === request.id ? "Processing..." : "Approve"}
                        </Button>
                      </>
                    ) : request.status === "approved" || request.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </Button>
                    ) : request.status === "rejected" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </Button>
                    ) : null}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // View more details
                        console.log("View details for:", request.id)
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>

                {/* Request Details */}
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{request.payment_method || "Upgrade Request"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {request.plan === "pro" ? "7 days" : 
                         request.plan === "elite" ? "30 days" : "Forever"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User Since</p>
                      <p className="font-medium">
                        {formatDate(request.profiles?.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}