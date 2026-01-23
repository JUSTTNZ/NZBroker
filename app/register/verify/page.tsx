"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Shield,
  ArrowRight,
  Clock,
  User,
  FileText,
  Home,
  Upload,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface KYCData {
  full_name: string
  date_of_birth: string
  nationality: string
  phone_number: string
  document_type: "passport" | "national_id" | "drivers_license"
  document_number: string
  document_expiry: string
  document_country: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Nigeria", "South Africa", "India", "Japan", "China",
  "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "New Zealand"
]

export default function VerifyPage() {
  const { user, userProfile, refreshAllData } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0) // 0 = welcome, 1-4 = KYC steps
  const [submitting, setSubmitting] = useState(false)

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

  const [idUploaded, setIdUploaded] = useState(false)
  const [addressUploaded, setAddressUploaded] = useState(false)

  const supabase = createClient()

  // Pre-fill name from profile
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || "",
      }))
    }
  }, [userProfile])

  const updateFormData = (field: keyof KYCData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (type: 'id' | 'address') => {
    if (type === 'id') {
      setIdUploaded(true)
      toast.success("ID document uploaded")
    } else {
      setAddressUploaded(true)
      toast.success("Address proof uploaded")
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
    if (currentStep > 0 && !validateStep(currentStep)) {
      toast.error("Please fill in all required fields")
      return
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in")
      return
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please complete all steps")
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .insert({
          user_id: user.id,
          ...formData,
          status: "pending",
          submitted_at: new Date().toISOString(),
        })

      if (error) throw error

      await supabase
        .from("profiles")
        .update({ kyc_status: "pending" })
        .eq("id", user.id)

      toast.success("KYC verification submitted!")
      await refreshAllData()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("KYC submission error:", error)
      toast.error(error.message || "Failed to submit KYC")
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "ID Document", icon: FileText },
    { id: 3, title: "Address", icon: Home },
    { id: 4, title: "Review", icon: Shield },
  ]

  // Welcome screen
  if (currentStep === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />

        <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

          <div className="max-w-2xl w-full relative z-10">
            <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-sm border-border/40">
              {/* Success Icon */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Account Created Successfully!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Welcome to the trading platform. Let&apos;s get you verified.
                </p>
              </div>

              {/* Benefits of KYC */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Unlock Full Trading Access</h3>
                    <p className="text-sm text-muted-foreground">Verify your identity to access all trading features</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Higher Withdrawal Limits</h3>
                    <p className="text-sm text-muted-foreground">Verified accounts enjoy unlimited withdrawals</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Verification</h3>
                    <p className="text-sm text-muted-foreground">Takes only 3-5 minutes to complete</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-6 text-lg font-semibold"
                >
                  Verify Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Skip for now, I&apos;ll verify later
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                You can always complete verification later in your dashboard settings
              </p>
            </Card>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  // KYC Steps
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="relative py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 md:w-24 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-green-500" : "bg-muted"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/40">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => updateFormData("full_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    placeholder="As shown on your ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateFormData("date_of_birth", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nationality *</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => updateFormData("nationality", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
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
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for Later
                </Button>
                <Button onClick={handleContinue} disabled={!validateStep(1)} className="flex-1 bg-primary">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/40">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Document Verification</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Type *</label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => updateFormData("document_type", e.target.value as any)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID Card</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Document Number *</label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => updateFormData("document_number", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    placeholder="AB123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.document_expiry}
                    onChange={(e) => updateFormData("document_expiry", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Issuing Country *</label>
                  <select
                    value={formData.document_country}
                    onChange={(e) => updateFormData("document_country", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload ID Document *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    idUploaded ? "border-green-500 bg-green-500/5" : "border-border/40 hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById("id-upload")?.click()}
                >
                  <input type="file" id="id-upload" className="hidden" accept="image/*,.pdf" onChange={() => handleFileUpload("id")} />
                  {idUploaded ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">Document uploaded</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Click to upload</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleContinue} disabled={!validateStep(2)} className="flex-1 bg-primary">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/40">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Address Verification</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => updateFormData("address_line1", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => updateFormData("address_line2", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    placeholder="Apt 4B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code *</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => updateFormData("postal_code", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateFormData("country", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Proof of Address *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    addressUploaded ? "border-green-500 bg-green-500/5" : "border-border/40 hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById("address-upload")?.click()}
                >
                  <input type="file" id="address-upload" className="hidden" accept="image/*,.pdf" onChange={() => handleFileUpload("address")} />
                  {addressUploaded ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">Document uploaded</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Utility bill, bank statement (last 3 months)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleContinue} disabled={!validateStep(3)} className="flex-1 bg-primary">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/40">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Review & Submit</h2>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> {formData.full_name}</div>
                    <div><span className="text-muted-foreground">DOB:</span> {formData.date_of_birth}</div>
                    <div><span className="text-muted-foreground">Nationality:</span> {formData.nationality}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {formData.phone_number}</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Document Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Type:</span> {formData.document_type?.replace("_", " ")}</div>
                    <div><span className="text-muted-foreground">Number:</span> {formData.document_number}</div>
                    <div><span className="text-muted-foreground">Country:</span> {formData.document_country}</div>
                    <div><span className="text-muted-foreground">ID Upload:</span> <span className="text-green-500">Done</span></div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Address Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {formData.address_line1}</div>
                    <div><span className="text-muted-foreground">City:</span> {formData.city}</div>
                    <div><span className="text-muted-foreground">Country:</span> {formData.country}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
                <p className="text-sm text-green-700">
                  Our team will review your documents within 24-48 hours. You&apos;ll be notified once verified.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary">
                  {submitting ? "Submitting..." : "Submit Verification"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
