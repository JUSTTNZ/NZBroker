"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Wallet, Copy, Check, Loader2, Shield, AlertTriangle, ArrowRightLeft, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supportEmail = "support@barcrestcapital.com"

export default function WithdrawPage() {
  const { user, currentWallet, userProfile, refreshAllData, switchAccountType } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [isSwitching, setIsSwitching] = useState(false)

  // Check if user is on demo account
  const isDemoAccount = userProfile?.account_type === "demo"

  const handleSwitchToLive = async () => {
    setIsSwitching(true)
    try {
      await switchAccountType("live")
      await refreshAllData()
    } catch (error) {
      console.error("Failed to switch account:", error)
    } finally {
      setIsSwitching(false)
    }
  }
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Simple input fields for bank info
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankRoutingNumber, setBankRoutingNumber] = useState("")
  const [bankName, setBankName] = useState("")
  
  // Simple input fields for crypto info
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [selectedCryptoType, setSelectedCryptoType] = useState("btc")
  const [cryptoAddressCopied, setCryptoAddressCopied] = useState(false)

  const withdrawalMethods = [
    { id: "bank", name: "Bank Transfer", icon: Building, desc: "1-3 business days", color: "text-blue-500" },
    { id: "crypto", name: "Cryptocurrency", icon: Wallet, desc: "5-30 minutes", color: "text-green-500" },
  ]

  const cryptoTypes = [
    { id: "btc", name: "Bitcoin (BTC)", icon: "₿" },
    { id: "eth", name: "Ethereum (ETH)", icon: "Ξ" },
    { id: "usdt", name: "Tether (USDT)", icon: "₮" },
 
    
  ]

  // Get Total Available Balance from wallet
  const totalAvailableBalance = currentWallet?.total_balance || 0

  const handleCopyCryptoAddress = () => {
    if (cryptoAddress) {
      navigator.clipboard.writeText(cryptoAddress)
      setCryptoAddressCopied(true)
      setTimeout(() => setCryptoAddressCopied(false), 2000)
    }
  }

  const handleWithdraw = async () => {
    if (!user) {
      toast.error("Please login to withdraw")
      return
    }

    // Block demo account withdrawals
    if (isDemoAccount) {
      toast.error("Withdrawals are not available for demo accounts. Please switch to a live account.")
      return
    }

    // Validation checks
    const withdrawAmount = parseFloat(amount)
    
    if (selectedMethod === "bank" && withdrawAmount < 100) {
      toast.error("Minimum withdrawal amount for bank transfer is $100")
      return
    }

    if (selectedMethod === "crypto" && withdrawAmount < 100) {
      toast.error("Minimum withdrawal amount for cryptocurrency is $100")
      return
    }

    if (withdrawAmount > totalAvailableBalance) {
      toast.error("Insufficient funds in Total Available Balance")
      return
    }

    // Check if user has filled required fields
    if (selectedMethod === "bank") {
      if (!bankAccountName || !bankAccountNumber) {
        toast.error("Please enter bank account details")
        return
      }
    }

    if (selectedMethod === "crypto") {
      if (!cryptoAddress) {
        toast.error("Please enter crypto wallet address")
        return
      }
    }

    // Check if user has existing pending withdrawals
    try {
      const supabase = createClient()
      const { data: pendingWithdrawals } = await supabase
        .from("withdrawals")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")

      if (pendingWithdrawals && pendingWithdrawals.length > 0) {
        toast.error("You already have a pending withdrawal request. Please wait for it to be processed.")
        return
      }
    } catch (error) {
      console.error("Error checking pending withdrawals:", error)
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Create withdrawal details string
      let withdrawalDetails = ""
      if (selectedMethod === "bank") {
        withdrawalDetails = `Bank: ${bankName} | Account: ${bankAccountName} (${bankAccountNumber}) | Routing: ${bankRoutingNumber}`
      } else if (selectedMethod === "crypto") {
        withdrawalDetails = `Crypto: ${cryptoTypes.find(c => c.id === selectedCryptoType)?.name} | Address: ${cryptoAddress}`
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from("withdrawals").insert([
        {
          user_id: user.id,
          amount: withdrawAmount,
          account_type: userProfile?.account_type || "demo",
          method: selectedMethod,
          status: "pending_payment",
          details: withdrawalDetails,
          payment_details: "", 
          admin_fee:0,
          net_amount: withdrawAmount,
          created_at: new Date().toISOString()
        }
      ])

      if (withdrawalError) {
        console.error("Withdrawal error:", withdrawalError)
        throw new Error(withdrawalError.message || "Failed to create withdrawal request")
      }

      // Lock the funds in wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          locked_balance: (currentWallet?.locked_balance || 0) + withdrawAmount,
          total_balance: (currentWallet?.total_balance || 0) - withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (walletError) {
        console.error("Wallet update error:", walletError)
      }

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          account_type: userProfile?.account_type || "demo",
          type: "withdrawal",
          amount: -withdrawAmount,
          description: `Withdrawal request via ${selectedMethod} - Pending approval`,
          status: "pending",
          reference_id: `WDR_${user.id}_${Date.now()}`,
          created_at: new Date().toISOString()
        },
      ])

      if (transactionError) {
        console.error("Transaction error:", transactionError)
      }

      // Create notification for user
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Withdrawal Request Submitted",
          message: `Your withdrawal request for $${withdrawAmount.toFixed(2)} has been received and is being processed.`,
          type: "withdrawal",
          read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.warn("Notification error:", notificationError)
      }

      // Refresh data
      await refreshAllData()
      
      // Reset form
      setAmount("")
      setBankAccountName("")
      setBankAccountNumber("")
      setBankRoutingNumber("")
      setBankName("")
      setCryptoAddress("")
      
      toast.success("Withdrawal request submitted! It is now being processed.")

    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast.error(error.message || 'Failed to submit withdrawal request')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if withdrawal is allowed
  const canWithdraw = () => {
    if (!user) return false
    if (isDemoAccount) return false // Block demo account withdrawals

    const withdrawAmount = parseFloat(amount)
    if (!amount || withdrawAmount <= 0) return false
    if (withdrawAmount > totalAvailableBalance) return false

    // Method-specific minimums
    if (selectedMethod === "bank" && withdrawAmount < 100) return false
    if (selectedMethod === "crypto" && withdrawAmount < 100) return false

    // Check if required fields are filled
    if (selectedMethod === "bank" && (!bankAccountName || !bankAccountNumber)) return false
    if (selectedMethod === "crypto" && !cryptoAddress) return false

    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Withdraw from your Total Available Balance</p>
      </div>

      {/* Demo Account Warning */}
      {isDemoAccount && (
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-600 mb-1">Demo Account - Withdrawals Not Available</h3>
                <p className="text-sm text-yellow-700">
                  You are currently using a demo account. Withdrawals are only available for live accounts with real funds.
                  Switch to your live account to make a withdrawal.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSwitchToLive}
              disabled={isSwitching}
              className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2 whitespace-nowrap"
            >
              {isSwitching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
              Switch to Live
            </Button>
          </div>
        </Card>
      )}

      {/* Balance Summary */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Wallet Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-sm text-muted-foreground mb-1">Total Available Balance</p>
            <p className="text-2xl font-bold text-green-400">${totalAvailableBalance.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">✅ Withdraw from this balance</p>
          </div>
          
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm text-muted-foreground mb-1">Locked Balance</p>
            <p className="text-2xl font-bold text-blue-400">${currentWallet?.locked_balance.toFixed(2) || "0.00"}</p>
            <p className="text-xs text-blue-600 mt-1">Pending withdrawals</p>
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      <Card className="p-6 bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-600 mb-1">Withdrawal Process</p>
            <p className="text-sm text-blue-700">
              1. Select method and enter details → 2. Submit request → 3. Verification & approval → 4. Funds sent to you
            </p>
          </div>
        </div>
      </Card>

      {/* Withdrawal Method Selection */}
      <Card className={`p-6 bg-card/50 border-border/40 ${isDemoAccount ? "opacity-50 pointer-events-none" : ""}`}>
        <h3 className="text-xl font-semibold mb-6">Select Withdrawal Method</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {withdrawalMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <Card
                key={method.id}
                className={`p-6 cursor-pointer border-2 transition-all ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/10"
                    : "border-border/40 bg-card/30 hover:border-primary/50"
                }`}
                onClick={() => !isDemoAccount && setSelectedMethod(method.id)}
              >
                <IconComponent className={`w-8 h-8 ${method.color} mb-4`} />
                <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.desc}</p>
              </Card>
            )
          })}
        </div>
      </Card>

      {/* Bank Withdrawal Form */}
      {selectedMethod === "bank" && !isDemoAccount && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">Bank Withdrawal</h3>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Withdrawal Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  min="100"
                  max={totalAvailableBalance}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available: ${totalAvailableBalance.toFixed(2)} • Minimum: $100
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Chase Bank"
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Account Number *</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Routing Number</label>
                <input
                  type="text"
                  value={bankRoutingNumber}
                  onChange={(e) => setBankRoutingNumber(e.target.value)}
                  placeholder="021000021"
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleWithdraw}
            disabled={!canWithdraw() || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Bank Withdrawal"
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center mt-3">
            Your withdrawal will be processed after verification
          </p>
        </Card>
      )}

      {/* Cryptocurrency Withdrawal Form */}
      {selectedMethod === "crypto" && !isDemoAccount && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">Cryptocurrency Withdrawal</h3>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Withdrawal Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  min="100"
                  max={totalAvailableBalance}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available: ${totalAvailableBalance.toFixed(2)} • Minimum: $100
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Cryptocurrency</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {cryptoTypes.map(crypto => (
                  <button
                    key={crypto.id}
                    type="button"
                    onClick={() => setSelectedCryptoType(crypto.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedCryptoType === crypto.id
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{crypto.icon}</span>
                    <p className="font-medium text-sm">{crypto.name.split(' ')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Wallet Address *</label>
              <div className="relative">
                <input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Enter your crypto wallet address"
                  className="w-full px-4 py-3 pr-16 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
                {cryptoAddress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCryptoAddress}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {cryptoAddressCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              {cryptoAddressCopied && (
                <p className="text-green-500 text-sm mt-2">✓ Address copied to clipboard!</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Please double-check the wallet address. Cryptocurrency transactions are irreversible.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleWithdraw}
            disabled={!canWithdraw() || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Crypto Withdrawal"
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center mt-3">
            Your withdrawal will be processed after verification
          </p>
        </Card>
      )}

      {/* Important Information */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Important Information</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-blue-500">1</span>
            </div>
            <p>Withdrawals require verification and are processed within 1-3 business days</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-blue-500">2</span>
            </div>
            <p>Minimum withdrawal: $100 for all methods</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-blue-500">3</span>
            </div>
            <p>Ensure all bank/crypto details are correct before submitting</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-blue-500">4</span>
            </div>
            <p>Funds will be deducted from your Total Available Balance immediately</p>
          </div>
        </div>
      </Card>

      {/* Customer Support Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Need Help with Your Withdrawal?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If you have any questions or issues with your withdrawal request, please contact our support team.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              {supportEmail}
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}