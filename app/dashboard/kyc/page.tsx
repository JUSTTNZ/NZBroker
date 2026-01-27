"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Upload, User, FileText, Home, Shield, AlertCircle, Clock, XCircle, BadgeCheck } from "lucide-react"
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

// Comprehensive list of all countries with their flag emojis
const countries = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Andorra", flag: "🇦🇩" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Antigua and Barbuda", flag: "🇦🇬" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Azerbaijan", flag: "🇦🇿" },
  { name: "Bahamas", flag: "🇧🇸" },
  { name: "Bahrain", flag: "🇧🇭" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Barbados", flag: "🇧🇧" },
  { name: "Belarus", flag: "🇧🇾" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Belize", flag: "🇧🇿" },
  { name: "Benin", flag: "🇧🇯" },
  { name: "Bhutan", flag: "🇧🇹" },
  { name: "Bolivia", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { name: "Botswana", flag: "🇧🇼" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Brunei", flag: "🇧🇳" },
  { name: "Bulgaria", flag: "🇧🇬" },
  { name: "Burkina Faso", flag: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮" },
  { name: "Cabo Verde", flag: "🇨🇻" },
  { name: "Cambodia", flag: "🇰🇭" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Central African Republic", flag: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Comoros", flag: "🇰🇲" },
  { name: "Congo (DRC)", flag: "🇨🇩" },
  { name: "Congo (Republic)", flag: "🇨🇬" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Cyprus", flag: "🇨🇾" },
  { name: "Czech Republic", flag: "🇨🇿" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Djibouti", flag: "🇩🇯" },
  { name: "Dominica", flag: "🇩🇲" },
  { name: "Dominican Republic", flag: "🇩🇴" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "El Salvador", flag: "🇸🇻" },
  { name: "Equatorial Guinea", flag: "🇬🇶" },
  { name: "Eritrea", flag: "🇪🇷" },
  { name: "Estonia", flag: "🇪🇪" },
  { name: "Eswatini", flag: "🇸🇿" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Fiji", flag: "🇫🇯" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
  { name: "Gabon", flag: "🇬🇦" },
  { name: "Gambia", flag: "🇬🇲" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Grenada", flag: "🇬🇩" },
  { name: "Guatemala", flag: "🇬🇹" },
  { name: "Guinea", flag: "🇬🇳" },
  { name: "Guinea-Bissau", flag: "🇬🇼" },
  { name: "Guyana", flag: "🇬🇾" },
  { name: "Haiti", flag: "🇭🇹" },
  { name: "Honduras", flag: "🇭🇳" },
  { name: "Hungary", flag: "🇭🇺" },
  { name: "Iceland", flag: "🇮🇸" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Iraq", flag: "🇮🇶" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Ivory Coast", flag: "🇨🇮" },
  { name: "Jamaica", flag: "🇯🇲" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Kazakhstan", flag: "🇰🇿" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Kiribati", flag: "🇰🇮" },
  { name: "Kosovo", flag: "🇽🇰" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Kyrgyzstan", flag: "🇰🇬" },
  { name: "Laos", flag: "🇱🇦" },
  { name: "Latvia", flag: "🇱🇻" },
  { name: "Lebanon", flag: "🇱🇧" },
  { name: "Lesotho", flag: "🇱🇸" },
  { name: "Liberia", flag: "🇱🇷" },
  { name: "Libya", flag: "🇱🇾" },
  { name: "Liechtenstein", flag: "🇱🇮" },
  { name: "Lithuania", flag: "🇱🇹" },
  { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Madagascar", flag: "🇲🇬" },
  { name: "Malawi", flag: "🇲🇼" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Maldives", flag: "🇲🇻" },
  { name: "Mali", flag: "🇲🇱" },
  { name: "Malta", flag: "🇲🇹" },
  { name: "Marshall Islands", flag: "🇲🇭" },
  { name: "Mauritania", flag: "🇲🇷" },
  { name: "Mauritius", flag: "🇲🇺" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Micronesia", flag: "🇫🇲" },
  { name: "Moldova", flag: "🇲🇩" },
  { name: "Monaco", flag: "🇲🇨" },
  { name: "Mongolia", flag: "🇲🇳" },
  { name: "Montenegro", flag: "🇲🇪" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Mozambique", flag: "🇲🇿" },
  { name: "Myanmar", flag: "🇲🇲" },
  { name: "Namibia", flag: "🇳🇦" },
  { name: "Nauru", flag: "🇳🇷" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nicaragua", flag: "🇳🇮" },
  { name: "Niger", flag: "🇳🇪" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "North Korea", flag: "🇰🇵" },
  { name: "North Macedonia", flag: "🇲🇰" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Oman", flag: "🇴🇲" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Palau", flag: "🇵🇼" },
  { name: "Palestine", flag: "🇵🇸" },
  { name: "Panama", flag: "🇵🇦" },
  { name: "Papua New Guinea", flag: "🇵🇬" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { name: "Saint Lucia", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
  { name: "Samoa", flag: "🇼🇸" },
  { name: "San Marino", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", flag: "🇸🇹" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Seychelles", flag: "🇸🇨" },
  { name: "Sierra Leone", flag: "🇸🇱" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Slovakia", flag: "🇸🇰" },
  { name: "Slovenia", flag: "🇸🇮" },
  { name: "Solomon Islands", flag: "🇸🇧" },
  { name: "Somalia", flag: "🇸🇴" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "South Sudan", flag: "🇸🇸" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Sudan", flag: "🇸🇩" },
  { name: "Suriname", flag: "🇸🇷" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Syria", flag: "🇸🇾" },
  { name: "Taiwan", flag: "🇹🇼" },
  { name: "Tajikistan", flag: "🇹🇯" },
  { name: "Tanzania", flag: "🇹🇿" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Timor-Leste", flag: "🇹🇱" },
  { name: "Togo", flag: "🇹🇬" },
  { name: "Tonga", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", flag: "🇹🇹" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Turkmenistan", flag: "🇹🇲" },
  { name: "Tuvalu", flag: "🇹🇻" },
  { name: "Uganda", flag: "🇺🇬" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Uzbekistan", flag: "🇺🇿" },
  { name: "Vanuatu", flag: "🇻🇺" },
  { name: "Vatican City", flag: "🇻🇦" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Yemen", flag: "🇾🇪" },
  { name: "Zambia", flag: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" },
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

        {/* Verified Badge Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-1">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
          <div className="relative bg-card/95 backdrop-blur rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Verified Badge */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 p-1 shadow-2xl shadow-green-500/30">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
              </div>

              {/* Verification Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Identity Verified</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{existingKYC.full_name}</h2>
                <p className="text-muted-foreground mb-4">
                  Your identity has been successfully verified. You have full access to all trading features.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium border border-green-500/20">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Unlimited Withdrawals
                  </span>
                  <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium border border-green-500/20">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Full Trading Access
                  </span>
                  <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium border border-green-500/20">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Priority Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Verification Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-card/50 border-border/40 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Full Name</span>
            </div>
            <p className="font-semibold text-lg">{existingKYC.full_name}</p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/40 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Document Type</span>
            </div>
            <p className="font-semibold text-lg capitalize">{existingKYC.document_type?.replace("_", " ")}</p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/40 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground">Country</span>
            </div>
            <p className="font-semibold text-lg">{existingKYC.country}</p>
          </Card>

          <Card className="p-6 bg-card/50 border-border/40 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm text-muted-foreground">Verified On</span>
            </div>
            <p className="font-semibold text-lg">
              {existingKYC.submitted_at ? new Date(existingKYC.submitted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : "N/A"}
            </p>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Account is Fully Verified</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You&apos;ve completed all verification requirements. Your account now has access to all platform features including unlimited withdrawals, higher trading limits, and priority customer support.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                  Document #{existingKYC.document_number?.slice(0, 4)}***
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                  {existingKYC.nationality}
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                  {existingKYC.city}, {existingKYC.country}
                </span>
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

        {/* Status Banner */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 p-1">
          <div className="relative bg-card/95 backdrop-blur rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Pending Badge */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="w-10 h-10 text-amber-500 mx-auto mb-1 animate-pulse" />
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
                    {existingKYC.status === "under_review" ? "Under Review" : "Pending Review"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Verification In Progress</h2>
                <p className="text-muted-foreground mb-4">
                  Your documents are being reviewed by our verification team. This usually takes 24-48 hours.
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted on {existingKYC.submitted_at ? new Date(existingKYC.submitted_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card className="p-6 bg-card/50 border-border/40">
          <h3 className="font-semibold text-lg mb-6">Verification Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Personal Information</p>
                <p className="text-sm text-muted-foreground">Your details have been submitted</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">Complete</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Document Verification</p>
                <p className="text-sm text-muted-foreground">ID document uploaded successfully</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">Complete</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Address Verification</p>
                <p className="text-sm text-muted-foreground">Proof of address uploaded</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">Complete</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Admin Review</p>
                <p className="text-sm text-muted-foreground">Our team is reviewing your submission</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium animate-pulse">In Progress</span>
            </div>
          </div>
        </Card>

        {/* What to Expect */}
        <Card className="p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Our verification team will review your documents within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll receive a notification once your verification is complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Once verified, all trading limits will be removed from your account</span>
                </li>
              </ul>
            </div>
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
                  {countries.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
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
                  {countries.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
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
                  {countries.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
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
