"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Upload, User, FileText, Home, Shield, AlertCircle, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface KYCData {
  id?: string
  // Personal Info
  full_name: string
  date_of_birth: string
  nationality: string
  phone_number: string
  // Document Info
  document_type: "passport" | "national_id" | "drivers_license"
  document_number: string
  document_expiry: string
  document_country: string
  // Address Info
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  // Status
  status?: "pending" | "under_review" | "approved" | "rejected"
  rejection_reason?: string
  submitted_at?: string
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Nigeria", "South Africa", "India", "Japan", "China",
  "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "New Zealand"
]

export default function KycPage() {
  const { user, userProfile, refreshAllData } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingKYC, setExistingKYC] = useState<KYCData | null>(null)

  // Form data
  const [formData, setFormData] = useState<KYCData>({
    full_name: "",
    date_of_birth: "",
    nationality: "",
    phone_number: "",
    document_type: "passport",
    document_number: "",
    document_expiry: "",
    document_country: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  })

  // Track uploaded files (not saved to DB, just for UI)
  const [idUploaded, setIdUploaded] = useState(false)
  const [addressUploaded, setAddressUploaded] = useState(false)

  const supabase = createClient()

  // Fetch existing KYC on mount
  useEffect(() => {
    const fetchKYC = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("kyc_verifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (data && !error) {
          setExistingKYC(data)
          setFormData({
            ...data,
            date_of_birth: data.date_of_birth || "",
            document_expiry: data.document_expiry || "",
          })
          // If KYC exists and is not rejected, go to review step
          if (data.status !== "rejected") {
            setCurrentStep(4)
          }
        }
      } catch (err) {
        // No existing KYC, that's fine
        console.log("No existing KYC found")
      } finally {
        setLoading(false)
      }
    }

    fetchKYC()
  }, [user, supabase])

  // Pre-fill name from profile
  useEffect(() => {
    if (userProfile && !existingKYC) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || "",
      }))
    }
  }, [userProfile, existingKYC])

  const updateFormData = (field: keyof KYCData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (type: 'id' | 'address') => {
    // We don't actually save files, just mark as uploaded for UI
    if (type === 'id') {
      setIdUploaded(true)
      toast.success("ID document marked as uploaded")
    } else {
      setAddressUploaded(true)
      toast.success("Address proof marked as uploaded")
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.date_of_birth && formData.nationality && formData.phone_number)
      case 2:
        return !!(formData.document_type && formData.document_number && formData.document_country && idUploaded)
      case 3:
        return !!(formData.address_line1 && formData.city && formData.postal_code && formData.country && addressUploaded)
      default:
        return true
    }
  }

  const handleContinue = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields")
      return
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in")
      return
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please complete all steps before submitting")
      return
    }

    setSubmitting(true)

    try {
      // If updating a rejected KYC, update it. Otherwise, insert new.
      if (existingKYC?.status === "rejected") {
        const { error } = await supabase
          .from("kyc_verifications")
          .update({
            ...formData,
            status: "pending",
            rejection_reason: null,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingKYC.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("kyc_verifications")
          .insert({
            user_id: user.id,
            ...formData,
            status: "pending",
            submitted_at: new Date().toISOString(),
          })

        if (error) throw error
      }

      // Update profile kyc_status
      await supabase
        .from("profiles")
        .update({ kyc_status: "pending" })
        .eq("id", user.id)

      toast.success("KYC verification submitted successfully!")

      // Refresh data
      await refreshAllData()

      // Reload KYC data
      const { data } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setExistingKYC(data)
      }

    } catch (error: any) {
      console.error("KYC submission error:", error)
      toast.error(error.message || "Failed to submit KYC")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-600 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Pending Review</span>
          </div>
        )
      case "under_review":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Under Review</span>
          </div>
        )
      case "approved":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Approved</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-600 rounded-full">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">Rejected</span>
          </div>
        )
      default:
        return null
    }
  }

  const steps = [
    { id: 1, title: "Personal Information", desc: "Basic details", icon: User },
    { id: 2, title: "Document Upload", desc: "ID verification", icon: FileText },
    { id: 3, title: "Address Verification", desc: "Proof of address", icon: Home },
    { id: 4, title: "Review & Submit", desc: "Final review", icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading KYC data...</p>
        </div>
      </div>
    )
  }

  // If KYC is approved, show success state
  if (existingKYC?.status === "approved") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">Your account verification status</p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Complete</h2>
            <p className="text-muted-foreground mb-6">
              Your identity has been verified. You now have full access to all trading features.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Verified Name</p>
                <p className="font-medium">{existingKYC.full_name}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium capitalize">{existingKYC.document_type?.replace("_", " ")}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{existingKYC.country}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Verified On</p>
                <p className="font-medium">{existingKYC.submitted_at ? new Date(existingKYC.submitted_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // If KYC is pending or under review
  if (existingKYC && (existingKYC.status === "pending" || existingKYC.status === "under_review")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">Your verification is being processed</p>
        </div>

        <Card className="p-8 bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Verification Status</h3>
              <p className="text-sm text-muted-foreground">Submitted on {existingKYC.submitted_at ? new Date(existingKYC.submitted_at).toLocaleString() : "N/A"}</p>
            </div>
            {getStatusBadge(existingKYC.status || "pending")}
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-background/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Personal Information</span>
                </div>
                <span className="text-sm text-green-500">Submitted</span>
              </div>
            </div>
            <div className="p-4 bg-background/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Document Verification</span>
                </div>
                <span className="text-sm text-green-500">Submitted</span>
              </div>
            </div>
            <div className="p-4 bg-background/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Address Verification</span>
                </div>
                <span className="text-sm text-green-500">Submitted</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-600 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Our team will review your documents within 24-48 hours</li>
              <li>• You'll receive a notification once verified</li>
              <li>• Once verified, all trading limits will be removed</li>
            </ul>
          </div>
        </Card>
      </div>
    )
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name (as on ID) *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateFormData("full_name", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateFormData("date_of_birth", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nationality *</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => updateFormData("nationality", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => updateFormData("phone_number", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <p className="text-sm text-blue-600">
                <strong>Note:</strong> Your personal information must match your government-issued ID.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!validateStep(1)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Save & Continue
            </Button>
          </Card>
        )

      case 2:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Document Verification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Document Type *</label>
                <select
                  value={formData.document_type}
                  onChange={(e) => updateFormData("document_type", e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID Card</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Document Number *</label>
                <input
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => updateFormData("document_number", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="AB123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.document_expiry}
                  onChange={(e) => updateFormData("document_expiry", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issuing Country *</label>
                <select
                  value={formData.document_country}
                  onChange={(e) => updateFormData("document_country", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload ID Document *</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  idUploaded ? "border-green-500/50 bg-green-500/5" : "border-border/40 hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("id-upload")?.click()}
              >
                <input
                  type="file"
                  id="id-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={() => handleFileUpload("id")}
                />
                {idUploaded ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-green-600 font-medium">Document uploaded successfully</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload your ID document</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
              <h4 className="font-medium text-yellow-600 mb-2">Requirements</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Document must be valid (not expired)</li>
                <li>• All corners must be visible</li>
                <li>• Text must be clear and readable</li>
              </ul>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!validateStep(2)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          </Card>
        )

      case 3:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Address Verification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => updateFormData("address_line1", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => updateFormData("address_line2", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="Apt 4B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State/Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code *</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => updateFormData("postal_code", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload Proof of Address *</label>
              <p className="text-sm text-muted-foreground mb-4">
                Accepted: Utility bill, Bank statement, Tax statement (issued within last 3 months)
              </p>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  addressUploaded ? "border-green-500/50 bg-green-500/5" : "border-border/40 hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("address-upload")?.click()}
              >
                <input
                  type="file"
                  id="address-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={() => handleFileUpload("address")}
                />
                {addressUploaded ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-green-600 font-medium">Document uploaded successfully</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload proof of address</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!validateStep(3)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue to Review
            </Button>
          </Card>
        )

      case 4:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Review & Submit</h3>
            </div>

            {existingKYC?.status === "rejected" && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                <h4 className="font-medium text-red-600 mb-2">Previous Submission Rejected</h4>
                <p className="text-sm text-red-700">
                  Reason: {existingKYC.rejection_reason || "No reason provided"}
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Please update your information and resubmit.
                </p>
              </div>
            )}

            <div className="space-y-6 mb-8">
              {/* Personal Info Summary */}
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Personal Information</h4>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formData.full_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{formData.date_of_birth}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nationality:</span>
                    <p className="font-medium">{formData.nationality}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{formData.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Document Info Summary */}
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Document Information</h4>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Document Type:</span>
                    <p className="font-medium capitalize">{formData.document_type?.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Document Number:</span>
                    <p className="font-medium">{formData.document_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuing Country:</span>
                    <p className="font-medium">{formData.document_country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Uploaded:</span>
                    <p className="font-medium text-green-500">{idUploaded ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Address Summary */}
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Address Information</h4>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">
                      {formData.address_line1}
                      {formData.address_line2 && `, ${formData.address_line2}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>
                    <p className="font-medium">{formData.city}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Postal Code:</span>
                    <p className="font-medium">{formData.postal_code}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{formData.country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address Proof:</span>
                    <p className="font-medium text-green-500">{addressUploaded ? "Uploaded" : "Not uploaded"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
              <h4 className="font-medium text-green-600 mb-2">What happens next?</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Our team will review your documents within 24-48 hours</li>
                <li>• You'll receive a notification once verified</li>
                <li>• Once verified, all trading limits will be removed</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !validateStep(1) || !validateStep(2) || !validateStep(3)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">Complete your account verification to unlock full trading features</p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const IconComponent = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <Card
              key={step.id}
              className={`p-4 cursor-pointer transition-all ${
                isCurrent
                  ? "border-primary bg-primary/10"
                  : isCompleted
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-border/40 bg-card/50"
              }`}
              onClick={() => {
                // Only allow going back or to current step
                if (step.id <= currentStep) {
                  setCurrentStep(step.id)
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-muted"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <IconComponent className={`w-5 h-5 ${isCurrent ? "text-white" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}
