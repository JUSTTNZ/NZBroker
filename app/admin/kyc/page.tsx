"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  User,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface KYCVerification {
  id: string
  user_id: string
  full_name: string
  date_of_birth: string
  nationality: string
  phone_number: string
  document_type: string
  document_number: string
  document_expiry: string | null
  document_country: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  postal_code: string
  country: string
  status: "pending" | "under_review" | "approved" | "rejected"
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  submitted_at: string
  created_at: string
  // Joined data
  user_email?: string
}

export default function AdminKYCPage() {
  const { user } = useAuth()
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "under_review" | "approved" | "rejected">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  const supabase = createClient()

  const fetchVerifications = async () => {
    try {
      // First get KYC verifications
      let query = supabase
        .from("kyc_verifications")
        .select("*")
        .order("submitted_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data: kycData, error: kycError } = await query

      if (kycError) throw kycError

      // Then get user emails for each verification
      if (kycData && kycData.length > 0) {
        const userIds = [...new Set(kycData.map(k => k.user_id))]
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds)

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

        const verificationsWithEmail = kycData.map(kyc => ({
          ...kyc,
          user_email: emailMap.get(kyc.user_id) || "Unknown"
        }))

        setVerifications(verificationsWithEmail)
      } else {
        setVerifications([])
      }
    } catch (error) {
      console.error("Error fetching KYC verifications:", error)
      toast.error("Failed to load KYC verifications")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  }, [filter])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchVerifications()
  }

  const handleApprove = async (kyc: KYCVerification) => {
    if (!user) return
    setProcessing(true)

    try {
      // Update KYC status
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", kyc.id)

      if (kycError) throw kycError

      // Update user profile kyc_status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "approved" })
        .eq("id", kyc.user_id)

      if (profileError) throw profileError

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: kyc.user_id,
        type: "kyc",
        title: "KYC Approved",
        message: "Your identity verification has been approved. You now have full access to all trading features.",
        metadata: { kyc_id: kyc.id }
      })

      toast.success("KYC verification approved!")
      setSelectedKYC(null)
      setAdminNotes("")
      fetchVerifications()
    } catch (error: any) {
      console.error("Error approving KYC:", error)
      toast.error(error.message || "Failed to approve KYC")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (kyc: KYCVerification) => {
    if (!user) return
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setProcessing(true)

    try {
      // Update KYC status
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", kyc.id)

      if (kycError) throw kycError

      // Update user profile kyc_status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "rejected" })
        .eq("id", kyc.user_id)

      if (profileError) throw profileError

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: kyc.user_id,
        type: "kyc",
        title: "KYC Rejected",
        message: `Your identity verification was rejected. Reason: ${rejectionReason}. Please update your information and resubmit.`,
        metadata: { kyc_id: kyc.id, reason: rejectionReason }
      })

      toast.success("KYC verification rejected")
      setSelectedKYC(null)
      setRejectionReason("")
      setAdminNotes("")
      fetchVerifications()
    } catch (error: any) {
      console.error("Error rejecting KYC:", error)
      toast.error(error.message || "Failed to reject KYC")
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkUnderReview = async (kyc: KYCVerification) => {
    if (!user) return
    setProcessing(true)

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: "under_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", kyc.id)

      if (error) throw error

      // Update user profile kyc_status
      await supabase
        .from("profiles")
        .update({ kyc_status: "under_review" })
        .eq("id", kyc.user_id)

      toast.success("Marked as under review")
      fetchVerifications()
    } catch (error: any) {
      console.error("Error updating KYC:", error)
      toast.error(error.message || "Failed to update KYC")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-600 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case "under_review":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-600 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Under Review
          </span>
        )
      case "approved":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-600 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/20 text-red-600 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  const filteredVerifications = verifications.filter(kyc => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      kyc.full_name.toLowerCase().includes(query) ||
      kyc.user_email?.toLowerCase().includes(query) ||
      kyc.document_number.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: verifications.length,
    pending: verifications.filter(k => k.status === "pending").length,
    underReview: verifications.filter(k => k.status === "under_review").length,
    approved: verifications.filter(k => k.status === "approved").length,
    rejected: verifications.filter(k => k.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading KYC verifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Verifications</h1>
          <p className="text-muted-foreground">Review and manage user identity verifications</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-card/50 border-border/40">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <p className="text-sm text-blue-600">Under Review</p>
          <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
        </Card>
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <p className="text-sm text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </Card>
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <p className="text-sm text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or document number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* KYC List */}
      <Card className="bg-card/50 border-border/40 overflow-hidden">
        {filteredVerifications.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No KYC verifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Document</th>
                  <th className="text-left p-4 font-medium">Country</th>
                  <th className="text-left p-4 font-medium">Submitted</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredVerifications.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{kyc.full_name}</p>
                        <p className="text-sm text-muted-foreground">{kyc.user_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="capitalize">{kyc.document_type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">{kyc.document_number}</p>
                      </div>
                    </td>
                    <td className="p-4">{kyc.country}</td>
                    <td className="p-4">
                      <p className="text-sm">{new Date(kyc.submitted_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(kyc.submitted_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-4">{getStatusBadge(kyc.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedKYC(kyc)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {kyc.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkUnderReview(kyc)}
                            disabled={processing}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
            <div className="p-6 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">KYC Verification Details</h2>
                  <p className="text-sm text-muted-foreground">Review user verification documents</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedKYC.status)}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedKYC(null)}>
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Full Name:</span>
                      <span className="font-medium">{selectedKYC.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Email:</span>
                      <span className="font-medium">{selectedKYC.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">DOB:</span>
                      <span className="font-medium">{selectedKYC.date_of_birth}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedKYC.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Nationality:</span>
                      <span className="font-medium">{selectedKYC.nationality}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Type:</span>
                      <span className="font-medium capitalize">{selectedKYC.document_type.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Number:</span>
                      <span className="font-medium">{selectedKYC.document_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Expiry:</span>
                      <span className="font-medium">{selectedKYC.document_expiry || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Country:</span>
                      <span className="font-medium">{selectedKYC.document_country}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address Information
                </h3>
                <div className="p-4 bg-muted/30 rounded-lg text-sm">
                  <p className="font-medium">{selectedKYC.address_line1}</p>
                  {selectedKYC.address_line2 && <p>{selectedKYC.address_line2}</p>}
                  <p>{selectedKYC.city}{selectedKYC.state && `, ${selectedKYC.state}`} {selectedKYC.postal_code}</p>
                  <p>{selectedKYC.country}</p>
                </div>
              </div>

              {/* Submission Info */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium">{new Date(selectedKYC.submitted_at).toLocaleString()}</p>
                  </div>
                  {selectedKYC.reviewed_at && (
                    <div>
                      <span className="text-muted-foreground">Reviewed:</span>
                      <p className="font-medium">{new Date(selectedKYC.reviewed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Rejection Reason */}
              {selectedKYC.status === "rejected" && selectedKYC.rejection_reason && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="font-medium text-red-600 mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{selectedKYC.rejection_reason}</p>
                </div>
              )}

              {/* Admin Actions */}
              {(selectedKYC.status === "pending" || selectedKYC.status === "under_review") && (
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h3 className="font-semibold">Admin Actions</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Notes (optional)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                      rows={2}
                      placeholder="Internal notes about this verification..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rejection Reason (required for rejection)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                      rows={2}
                      placeholder="Reason for rejection (visible to user)..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedKYC)}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processing ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedKYC)}
                      disabled={processing || !rejectionReason.trim()}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processing ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
