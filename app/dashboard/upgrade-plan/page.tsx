// app/dashboard/upgrade/page.tsx - UPDATED VERSION
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client" // Import browser client
import { toast } from "sonner"
import { 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowUpRight, 
  Shield,
  Zap,
  Crown,
  Calendar,
  Clock,
  Users,
  CreditCard
} from "lucide-react"

const availablePlans = [
  {
    name: "Basic",
    price: "$0",
    period: "Forever",
    description: "Perfect for beginners",
    features: ["$10,000 Demo Account", "Basic Support", "Email Support", "7-day Trial"],
    plan_id: "basic",
    icon: <Users className="w-6 h-6" />,
    color: "bg-gray-500/20 border-gray-500/30",
    textColor: "text-gray-600",
    duration: "Forever"
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For serious traders",
    features: ["$50,000 Demo Account", "7 Days Duration", "Priority Support", "Advanced Analytics", "Bot Trading Access"],
    plan_id: "pro",
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    color: "bg-blue-500/20 border-blue-500/30",
    textColor: "text-blue-600",
    duration: "7 Days"
  },
  {
    name: "Elite",
    price: "$199",
    period: "per month",
    description: "For professionals",
    features: ["Unlimited Demo Account", "30 Days Duration", "24/7 Premium Support", "Advanced Bot Trading", "Personal Account Manager", "Custom Strategies"],
    plan_id: "elite",
    icon: <Crown className="w-6 h-6" />,
    color: "bg-purple-500/20 border-purple-500/30",
    textColor: "text-purple-600",
    duration: "30 Days"
  },
]

export default function UpgradePlanPage() {
  const { user, userProfile, userPlans, refreshAllData } = useAuth()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Get user's current plan
  const currentPlan = userProfile?.current_plan || "basic"
  
  // Find pending upgrade request
  const pendingPlan = userPlans?.find(p => p.status === "pending")
  
  // Find active plan
  const activePlan = userPlans?.find(p => p.status === "active")
  
  // Find the plan object for current plan
  const currentPlanData = availablePlans.find(p => p.plan_id === currentPlan)

  // UPDATED: Handle upgrade request WITHOUT API
  const handleUpgradeRequest = async (planId: string, planName: string, planPrice: string) => {
    if (!user) {
      toast.error("Please login to request plan upgrade")
      return
    }
    
    if (planId === currentPlan) {
      toast.error("You are already on this plan")
      return
    }
    
    if (pendingPlan) {
      toast.error("You already have a pending upgrade request")
      return
    }
    
    setLoadingPlanId(planId)
    setMessage(null)
    
    try {
      console.log(`📝 Requesting upgrade to ${planName} for user: ${user.id}`)
      
      // 1. Create Supabase browser client
      const supabase = createClient() // Browser client, same as in auth context
      
      // 2. Check if user already has a pending request (double-check)
      const { data: existingRequests } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1)

      if (existingRequests && existingRequests.length > 0) {
        throw new Error("You already have a pending upgrade request")
      }

      // 3. Create upgrade request record
      const { error: insertError } = await supabase.from("user_plans").insert([
        {
          user_id: user.id,
          plan: planId,
          amount_paid: 0,
          payment_method: "upgrade_request",
          status: "pending",
          starts_at: null,
          ends_at: null,
  
        },
      ])

      if (insertError) {
        console.error("❌ Insert error:", insertError)
        throw new Error(insertError.message || "Failed to create upgrade request")
      }

      // 4. Update user's profile to show requested plan (temporarily)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          current_plan: planId,
          plan_expires_at: null,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("⚠️ Profile update error:", updateError)
        // Continue anyway - the main request was created
      }

      // 5. Create notification for user
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Upgrade Request Submitted",
          message: `Your request to upgrade to ${planName} plan has been received. Our admin team will review it shortly.`,
          type: "plan_upgrade",
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.warn("⚠️ Notification error:", notificationError)
        // Continue anyway
      }

      // 6. Refresh user data to show pending request
      await refreshAllData()
      
      toast.success(`✅ Upgrade request for ${planName} plan submitted successfully!`)
      
      setMessage({ 
        type: 'success', 
        text: `Your request for ${planName} plan has been submitted. Our admin team will review it and update your account shortly.` 
      })
      
    } catch (error: any) {
      console.error('❌ Upgrade request error:', error)
      toast.error(error.message || 'Failed to submit upgrade request')
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit upgrade request. Please try again.' 
      })
    } finally {
      setLoadingPlanId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Trading Plan</h1>
        <p className="text-muted-foreground">Choose a plan that fits your trading needs and goals</p>
      </div>

      {/* Current Plan Status */}
      <Card className="p-6 border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Current Plan Status</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className={`capitalize px-3 py-1 ${currentPlanData?.color} ${currentPlanData?.textColor}`}>
                    {currentPlan}
                  </Badge>
                  {activePlan ? (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      Expires: {formatDate(activePlan.ends_at)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Free Trial
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {pendingPlan && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-700">Upgrade Request Pending</h4>
                  <p className="text-sm text-yellow-600">
                    Your request to upgrade to <span className="font-semibold capitalize">{pendingPlan.plan}</span> plan is under review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? '✅' : '❌'}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = plan.plan_id === currentPlan
          const isPendingPlan = pendingPlan?.plan === plan.plan_id
          const isLoading = loadingPlanId === plan.plan_id
          const isUpgradeAvailable = !isCurrentPlan && !pendingPlan
          
          return (
            <Card
              key={plan.name}
              className={`p-6 relative border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-primary scale-105"
                  : isCurrentPlan
                    ? "border-secondary"
                    : "border-border/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center`}>
                  <div className={plan.textColor}>
                    {plan.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-background/50 rounded-lg">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Duration: {plan.duration}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Features</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleUpgradeRequest(plan.plan_id, plan.name, plan.price)}
                disabled={!isUpgradeAvailable || isLoading}
                className={`w-full py-3 font-semibold gap-2 ${
                  isCurrentPlan
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : isPendingPlan
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-background border border-border/40 hover:bg-background/50"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                
                {isCurrentPlan 
                  ? "Current Plan" 
                  : isPendingPlan 
                    ? <><Clock className="w-4 h-4" /> Request Pending</>
                    : <><ArrowUpRight className="w-4 h-4" /> Request Upgrade</>}
              </Button>
              
              {/* Status Info */}
              <div className="mt-3 text-center">
                {isCurrentPlan && (
                  <div className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> You are on this plan
                  </div>
                )}
                {isPendingPlan && (
                  <div className="text-xs text-yellow-600 font-medium flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Upgrade request pending admin approval
                  </div>
                )}
                {isUpgradeAvailable && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Requires admin approval
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* How It Works */}
      <Card className="p-6 border-border/40">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          How Plan Upgrades Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
            </div>
            <h4 className="font-semibold mb-2">Request Upgrade</h4>
            <p className="text-sm text-muted-foreground">
              Submit a request for your desired plan. No payment required upfront.
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
            </div>
            <h4 className="font-semibold mb-2">Admin Review</h4>
            <p className="text-sm text-muted-foreground">
              Our admin team reviews your request (usually within 24 hours).
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
            </div>
            <h4 className="font-semibold mb-2">Get Activated</h4>
            <p className="text-sm text-muted-foreground">
              Once approved, your new plan features are activated immediately.
            </p>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6 border-border/40">
        <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">How long does approval take?</h4>
            <p className="text-sm text-muted-foreground">
              Usually within 24 hours during business days. You'll receive a notification when approved.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Can I cancel my request?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can contact support to cancel a pending request before it's approved.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">What happens after my plan expires?</h4>
            <p className="text-sm text-muted-foreground">
              You'll automatically revert to the Basic plan. You can request an upgrade again at any time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}