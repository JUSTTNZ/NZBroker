"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle } from "lucide-react"

const steps = [
  { id: 1, title: "Personal Information", desc: "Basic details", completed: true },
  { id: 2, title: "Document Upload", desc: "Passport or ID", completed: true },
  { id: 3, title: "Address Verification", desc: "Utility bill or statement", completed: false },
  { id: 4, title: "Verification", desc: "Under review", completed: false },
]

export default function KycPage() {
  const [currentStep, setCurrentStep] = useState(2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">Complete your account verification to unlock full trading features</p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`p-6 border-2 cursor-pointer transition-all ${
              currentStep === step.id
                ? "border-primary bg-primary/10"
                : step.completed
                  ? "border-green-500/50"
                  : "border-border/40 bg-card/50"
            }`}
            onClick={() => !step.completed && setCurrentStep(step.id)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
              {step.completed && <span className="text-sm text-green-400 font-medium">Completed</span>}
            </div>
          </Card>
        ))}
      </div>

      {currentStep === 3 && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">Address Verification</h3>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Address Proof</label>
              <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <p className="text-muted-foreground mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90">Continue</Button>
        </Card>
      )}
    </div>
  )
}
