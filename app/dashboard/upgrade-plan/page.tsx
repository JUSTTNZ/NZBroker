"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Define plans (these can also come from a database if needed)
const availablePlans = [
  {
    name: "Basic",
    price: "$0",
    period: "Forever",
    description: "Perfect for beginners",
    features: ["$10,000 Demo Account", "Duration: 9 Days", "Basic Support"],
    plan_id: "basic",
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For serious traders",
    features: [
      "$50,000 Demo Account",
      "Duration: 15 Days",
      "Priority Support",
    ],
    plan_id: "pro",
    popular: true,
  },
  {
    name: "Elite",
    price: "$199",
    period: "per month",
    description: "For professionals",
    features: [
      "Unlimited Demo Account",
      "Duration: 30 Days",
      "24/7 Premium Support",
    ],
    plan_id: "elite",
  },
]

export default function UpgradePlanPage() {
  const { user, userProfile, activePlan, userPlans, refreshAllData } = useAuth()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Get user's current plan
  const currentPlan = userProfile?.current_plan || "basic"
  
  // Find the plan object for current plan
  const currentPlanData = availablePlans.find(p => p.plan_id === currentPlan)
  
  // Check if user has pending upgrade request
  const pendingPlan = userPlans?.find(p => p.status === "pending")
  
  const handleUpgradeRequest = async (planId: string, planName: string, planPrice: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to request plan upgrade' })
      return
    }
    
    if (planId === currentPlan) {
      setMessage({ type: 'error', text: 'You are already on this plan' })
      return
    }
    
    if (pendingPlan) {
      setMessage({ type: 'error', text: 'You already have a pending upgrade request' })
      return
    }
    
    setLoadingPlanId(planId)
    setMessage(null)
    
    try {
      console.log(`📝 Requesting upgrade to ${planName} for user: ${user.id}`)
      
      // Create upgrade request in database
      const response = await fetch('/api/plans/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: userProfile?.full_name || user.email,
          currentPlan: currentPlan,
          requestedPlan: planId,
          planName: planName,
          planPrice: planPrice,
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit upgrade request')
      }
      
      // Refresh user data to show pending request
      await refreshAllData()
      
      setMessage({ 
        type: 'success', 
        text: `Upgrade request for ${planName} plan submitted successfully! Our admin team will review your request and contact you shortly.` 
      })
      
    } catch (error: any) {
      console.error('❌ Upgrade request error:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit upgrade request. Please try again.' 
      })
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">Choose a plan that fits your trading needs</p>
        
        {/* Current Plan Display */}
        {userProfile && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Plan: <span className="capitalize">{currentPlan}</span></h3>
                <p className="text-sm text-muted-foreground">
                  {activePlan ? (
                    `Active until ${new Date(activePlan.ends_at!).toLocaleDateString()}`
                  ) : (
                    "Free trial"
                  )}
                </p>
              </div>
              <div className="text-right">
                {pendingPlan ? (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-sm">
                    ⏳ Pending: {pendingPlan.plan}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm">
                    ✅ Active
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? '✅' : '❌'}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Pending Request Alert */}
      {pendingPlan && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-700">Upgrade Request Pending</h4>
              <p className="text-sm text-yellow-600">
                Your request to upgrade to <span className="font-semibold capitalize">{pendingPlan.plan}</span> plan is under review.
                Our admin team will process your request and update your account shortly.
              </p>
              <p className="text-xs text-yellow-500 mt-2">
                Requested on: {new Date(pendingPlan.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = plan.plan_id === currentPlan
          const isPendingPlan = pendingPlan?.plan === plan.plan_id
          const isLoading = loadingPlanId === plan.plan_id
          
          return (
            <Card
              key={plan.name}
              className={`p-5 relative border-2 transition-all ${
                plan.popular
                  ? "border-primary bg-primary/10 scale-105"
                  : isCurrentPlan
                    ? "border-secondary bg-secondary/10"
                    : "border-border/40 bg-card/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>

              <div className="my-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgradeRequest(plan.plan_id, plan.name, plan.price)}
                disabled={isCurrentPlan || isPendingPlan || isLoading}
                className={`w-full py-3 font-semibold ${
                  isCurrentPlan
                    ? "bg-muted cursor-not-allowed"
                    : isPendingPlan
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-background border border-border/40 hover:bg-background/50"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                
                {isCurrentPlan 
                  ? "Current Plan" 
                  : isPendingPlan 
                    ? "Request Pending" 
                    : "Request Upgrade"}
              </Button>
              
              {/* Plan Status Badge */}
              <div className="mt-3 text-center">
                {isCurrentPlan && (
                  <span className="text-xs text-green-600 font-medium">✓ You are on this plan</span>
                )}
                {isPendingPlan && (
                  <span className="text-xs text-yellow-600 font-medium">⏳ Upgrade request pending</span>
                )}
                {isLoading && (
                  <span className="text-xs text-blue-600 font-medium">Submitting request...</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* How It Works Section */}
      <Card className="p-6 border-border/40">
        <h3 className="text-lg font-bold mb-4">How Plan Upgrades Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-semibold mb-2">Request Upgrade</h4>
            <p className="text-sm text-muted-foreground">
              Submit a request for your desired plan
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h4 className="font-semibold mb-2">Admin Review</h4>
            <p className="text-sm text-muted-foreground">
              Our team reviews and approves your request
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h4 className="font-semibold mb-2">Plan Activated</h4>
            <p className="text-sm text-muted-foreground">
              Your new plan features are activated immediately
            </p>
          </div>
        </div>
      </Card>

      {/* Contact Support */}
      <div className="text-center p-6 border border-border/40 rounded-lg">
        <h4 className="font-semibold mb-2">Need Help?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Contact our support team for any questions about plan upgrades
        </p>
        <Button variant="outline" className="gap-2">
          ✉️ Contact Support
        </Button>
      </div>
    </div>
  )
}