"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Upload, User, FileText, Home, Shield } from "lucide-react"

const steps = [
  { 
    id: 1, 
    title: "Personal Information", 
    desc: "Basic details", 
    completed: true,
    icon: User
  },
  { 
    id: 2, 
    title: "Document Upload", 
    desc: "Passport or ID", 
    completed: true,
    icon: FileText
  },
  { 
    id: 3, 
    title: "Address Verification", 
    desc: "Utility bill or statement", 
    completed: false,
    icon: Home
  },
  { 
    id: 4, 
    title: "Verification", 
    desc: "Under review", 
    completed: false,
    icon: Shield
  },
]

export default function KycPage() {
  const [currentStep, setCurrentStep] = useState(3)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    dob: "1990-05-15",
    nationality: "United States"
  })
  const [uploadedId, setUploadedId] = useState(false)
  const [uploadedAddress, setUploadedAddress] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'address') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (type === 'id') {
        setIdFile(file)
        setUploadedId(true)
      } else {
        setAddressFile(file)
        setUploadedAddress(true)
      }
    }
  }

  const handleContinue = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = () => {
    alert("KYC verification submitted for review!")
  }

  // Step content renderer
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.dob}
                  onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nationality</label>
                <select
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo({...personalInfo, nationality: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <p className="text-sm text-blue-600">
                <strong>Note:</strong> Your personal information must match your government-issued ID.
              </p>
            </div>

            <Button onClick={handleContinue} className="w-full bg-primary hover:bg-primary/90">
              Save & Continue
            </Button>
          </Card>
        )

      case 2:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Document Upload</h3>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h4 className="font-medium mb-4">Upload Government-Issued ID</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Accepted: Passport, Driver's License, National ID Card
                </p>
                
                <div className="space-y-4">
                  {[
                    { label: "Front of ID", id: "id-front" },
                    { label: "Back of ID", id: "id-back" }
                  ].map((item) => (
                    <div key={item.id}>
                      <label className="block text-sm font-medium mb-2">{item.label}</label>
                      <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id={item.id}
                          onChange={(e) => handleFileUpload(e, 'id')}
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                        <label htmlFor={item.id} className="cursor-pointer">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            {item.id === 'id-front' && idFile ? idFile.name : "Click to upload"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, PDF (Max 10MB)
                          </p>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-medium text-yellow-600 mb-2">Requirements</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Document must be valid (not expired)</li>
                  <li>• All four corners must be visible</li>
                  <li>• Text must be clear and readable</li>
                  <li>• No glare or reflections</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!uploadedId}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {uploadedId ? "Continue" : "Please upload documents to continue"}
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

            <div className="space-y-6 mb-8">
              <div>
                <h4 className="font-medium mb-4">Upload Proof of Address</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Accepted: Utility bill, Bank statement, Tax statement (issued within last 3 months)
                </p>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address Proof Document</label>
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="address-proof"
                      onChange={(e) => handleFileUpload(e, 'address')}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                    <label htmlFor="address-proof" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">
                        {addressFile ? addressFile.name : "Drag and drop or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG (Max 10MB)
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-medium text-blue-600 mb-2">What should the document include?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your full name and current address</li>
                  <li>• Issued within the last 3 months</li>
                  <li>• From a recognized organization (bank, utility company, government)</li>
                  <li>• Document must be in English or have certified translation</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!uploadedAddress}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {uploadedAddress ? "Continue to Verification" : "Please upload address proof to continue"}
            </Button>
          </Card>
        )

      case 4:
        return (
          <Card className="p-8 bg-card/50 border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Verification Review</h3>
            </div>

            <div className="space-y-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">Your KYC Application</h4>
                    <p className="text-sm text-muted-foreground">Submitted for review</p>
                  </div>
                  <div className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Under Review
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application ID</p>
                    <p className="font-medium">KYC-2024-56789</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted Date</p>
                    <p className="font-medium">Dec 15, 2024</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Verification Status</h4>
                <div className="space-y-3">
                  {steps.slice(0, 3).map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-500' : 'bg-muted'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span>{step.title}</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        step.completed ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {step.completed ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-medium text-green-600 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Our team will review your documents within 24-48 hours</li>
                  <li>• You'll receive an email notification once verified</li>
                  <li>• Once verified, all trading limits will be removed</li>
                  <li>• You'll gain access to full platform features</li>
                </ul>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
              Submit for Verification
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
      <div className="space-y-4">
        {steps.map((step) => {
          const IconComponent = step.icon
          return (
            <Card
              key={step.id}
              className={`p-6 border-2 cursor-pointer transition-all ${
                currentStep === step.id
                  ? "border-primary bg-primary/10"
                  : step.completed
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-border/40 bg-card/50"
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <IconComponent className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                    {step.completed && (
                      <span className="text-sm text-green-400 font-medium px-3 py-1 bg-green-400/10 rounded-full">
                        Completed
                      </span>
                    )}
                    {currentStep === step.id && !step.completed && (
                      <span className="text-sm text-primary font-medium px-3 py-1 bg-primary/10 rounded-full">
                        Current Step
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Dynamic Step Content */}
      {renderStepContent()}
    </div>
  )
}