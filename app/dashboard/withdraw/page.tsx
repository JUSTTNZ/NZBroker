"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Building, Wallet, CreditCard, Copy, Check, Loader2, MailCheck, Shield, PlayCircle, PauseCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function WithdrawPage() {
  const { user, userProfile, currentWallet, refreshAllData, switchAccountType } = useAuth()
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [bankAccount, setBankAccount] = useState("")
  const [eWallet, setEWallet] = useState("")
  const [cryptoWallet, setCryptoWallet] = useState("")
  const [cryptoAddressCopied, setCryptoAddressCopied] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState("btc")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const withdrawalMethods = [
    { id: "bank", name: "Bank Transfer", icon: Building, desc: "1-3 business days", color: "text-blue-500" },
    { id: "ewallet", name: "E-Wallet", icon: CreditCard, desc: "Instant - 24 hours", color: "text-purple-500" },
    { id: "crypto", name: "Cryptocurrency", icon: Wallet, desc: "5-30 minutes", color: "text-green-500" },
  ]

  const bankAccounts = [
    { id: "1", name: "Chase Checking", number: "****5678" },
    { id: "2", name: "Wells Fargo Savings", number: "****1234" },
  ]

  const eWallets = [
    { id: "paypal", name: "PayPal" },
    { id: "skrill", name: "Skrill" },
    { id: "neteller", name: "Neteller" },
    { id: "perfectmoney", name: "Perfect Money" },
  ]

  const cryptocurrencies = [
    { id: "btc", name: "Bitcoin (BTC)", icon: "₿" },
    { id: "eth", name: "Ethereum (ETH)", icon: "Ξ" },
    { id: "usdt", name: "Tether (USDT)", icon: "₮" },
    { id: "solana", name: "Solana (SOL)", icon: "◎" },
  ]

  const cryptoWallets = {
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    eth: "0x74d0cb9b52ED68f69980899b19c42Ee9B9eCB72C",
    usdt: "TKrjq7L8x2dY7vq1V2nTqP3k4M5n6B7v8C9d0E1f2G3",
    solana: "So1anaWaL1etAddR3ss1234567890ABCDEFGHIJKLM",
  }

  // Check if email is verified
  useEffect(() => {
    if (user) {
      setEmailVerified(user.email_confirmed_at !== null)
    }
  }, [user])

  // Get Total Available Balance from wallet
  const totalAvailableBalance = currentWallet?.total_balance || 0

  // Check if user is on Demo account
  const isDemoAccount = userProfile?.account_type === "demo"

  const handleCopyCryptoAddress = () => {
    navigator.clipboard.writeText(cryptoWallets[selectedCrypto as keyof typeof cryptoWallets])
    setCryptoAddressCopied(true)
    setTimeout(() => setCryptoAddressCopied(false), 2000)
  }

  const handleWithdraw = async () => {
    if (!user) {
      toast.error("Please login to withdraw")
      return
    }

    // Check if user is on Demo account
    if (isDemoAccount) {
      toast.error("Cannot withdraw from Demo account. Switch to Live account to withdraw real funds.")
      return
    }

    // Validation checks
    const withdrawAmount = parseFloat(amount)
    
    if (!emailVerified) {
      toast.error("Please verify your email address before withdrawing.")
      return
    }

    if (selectedMethod === "bank" && withdrawAmount < 1) {
      toast.error("Minimum withdrawal amount for bank transfer is $100")
      return
    }

    if (selectedMethod === "ewallet" && withdrawAmount < 50) {
      toast.error("Minimum withdrawal amount for e-wallet is $50")
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

    // Check if user has existing pending withdrawals
    try {
      const supabase = createClient()
      const { data: pendingWithdrawals } = await supabase
        .from("withdrawals")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")

      if (pendingWithdrawals && pendingWithdrawals.length > 0) {
        toast.error("You already have a pending withdrawal request. Please wait for admin approval.")
        return
      }
    } catch (error) {
      console.error("Error checking pending withdrawals:", error)
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Calculate admin fee (admin will set this later)
      const adminFee = 0 // Admin will set this when approving
      const netAmount = withdrawAmount - adminFee

      // 1. Create withdrawal request with "pending_payment" status
      const { error: withdrawalError } = await supabase.from("withdrawals").insert([
        {
          user_id: user.id,
          amount: withdrawAmount,
          account_type: userProfile?.account_type || "demo",
          method: selectedMethod,
          status: "pending_payment",
          admin_fee: adminFee,
          net_amount: netAmount,
          details: getWithdrawalDetails(),
          payment_details: "", // Admin will provide payment instructions
          created_at: new Date().toISOString()
        },
      ])

      if (withdrawalError) {
        console.error("Withdrawal error:", withdrawalError)
        throw new Error(withdrawalError.message || "Failed to create withdrawal request")
      }

      // 2. Lock the funds in wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          locked_balance: (currentWallet?.locked_balance || 0) + withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("account_type", userProfile?.account_type || "demo")

      if (walletError) {
        console.error("Wallet update error:", walletError)
        // Continue anyway
      }

      // 3. Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          account_type: userProfile?.account_type || "demo",
          type: "withdrawal",
          amount: -withdrawAmount,
          description: `Withdrawal request via ${selectedMethod} - Awaiting admin payment instructions`,
          status: "pending",
          reference_id: `WDR_${user.id}_${Date.now()}`,
          created_at: new Date().toISOString()
        },
      ])

      if (transactionError) {
        console.error("Transaction error:", transactionError)
        // Continue anyway
      }

      // 4. Create notification for user
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Withdrawal Request Submitted",
          message: `Your withdrawal request for $${withdrawAmount.toFixed(2)} has been received. Admin will contact you with payment instructions to approve it.`,
          type: "withdrawal_request",
          read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.warn("Notification error:", notificationError)
      }

      // 5. Refresh data
      await refreshAllData()
      
      // 6. Reset form
      setAmount("")
      setBankAccount("")
      setEWallet("")
      
      toast.success("Withdrawal request submitted! Admin will contact you with payment instructions to approve your request.")

    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast.error(error.message || 'Failed to submit withdrawal request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFee = (method: string, amount: number) => {
    switch(method) {
      case "bank": return Math.max(25, amount * 0.02) // $25 or 2%
      case "ewallet": return Math.max(10, amount * 0.01) // $10 or 1%
      case "crypto": return 0 // Network fee only
      default: return 0
    }
  }

  const getWithdrawalDetails = () => {
    let details = ""
    
    if (selectedMethod === "bank") {
      const bank = bankAccounts.find(b => b.id === bankAccount)
      details = `Bank: ${bank?.name} ${bank?.number}`
    } else if (selectedMethod === "ewallet") {
      const wallet = eWallets.find(w => w.id === eWallet)
      details = `E-Wallet: ${wallet?.name}`
    } else if (selectedMethod === "crypto") {
      const crypto = cryptocurrencies.find(c => c.id === selectedCrypto)
      details = `Crypto: ${crypto?.name} - ${cryptoWallets[selectedCrypto as keyof typeof cryptoWallets]}`
    }
    
    return details
  }

  // Determine if withdrawal is allowed
  const canWithdraw = () => {
    if (!user) return false
    if (!emailVerified) return false
    if (isDemoAccount) return false // Demo accounts cannot withdraw
    
    const withdrawAmount = parseFloat(amount)
    if (!amount || withdrawAmount <= 0) return false
    if (withdrawAmount > totalAvailableBalance) return false
    
    // Method-specific minimums
    if (selectedMethod === "bank" && withdrawAmount < 1) return false
    if (selectedMethod === "ewallet" && withdrawAmount < 50) return false
    if (selectedMethod === "crypto" && withdrawAmount < 100) return false
    
    return true
  }

  // Send verification email
  const handleSendVerificationEmail = async () => {
    if (!user) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      })

      if (error) throw error
      
      toast.success("Verification email sent! Check your inbox.")
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email")
    }
  }

  // Switch to Live account
  const handleSwitchToLiveAccount = async () => {
    try {
      await switchAccountType("live")
      toast.success("Switched to Live account")
    } catch (error: any) {
      toast.error(error.message || "Failed to switch to Live account")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Withdraw from your Total Available Balance</p>
      </div>

      {/* Balance Summary */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Wallet Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-sm text-muted-foreground mb-1">Total Available Balance</p>
            <p className="text-2xl font-bold text-green-400">${totalAvailableBalance.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">✅ Withdraw from this balance</p>
          </div>
          
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm text-muted-foreground mb-1">Trading Balance</p>
            <p className="text-2xl font-bold text-blue-400">${currentWallet?.trading_balance.toFixed(2) || "0.00"}</p>
            <p className="text-xs text-blue-600 mt-1">
              {isDemoAccount ? "Demo Trading" : "Live Trading"}
            </p>
          </div>
          
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <p className="text-sm text-muted-foreground mb-1">Bot Trading Balance</p>
            <p className="text-2xl font-bold text-purple-400">${currentWallet?.bot_trading_balance.toFixed(2) || "0.00"}</p>
            <p className="text-xs text-purple-600 mt-1">
              {isDemoAccount ? "Demo Bot Trading" : "Live Bot Trading"}
            </p>
          </div>
        </div>
        
        {/* Account Type Indicator */}
        <div className="mt-4 p-3 rounded-lg bg-background/30 border border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDemoAccount ? (
                <PlayCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <PauseCircle className="w-5 h-5 text-green-500" />
              )}
              <div>
                <p className="font-medium">
                  {isDemoAccount ? "Demo Account" : "Live Account"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDemoAccount 
                    ? "Practice with virtual funds. Cannot withdraw." 
                    : "Trade with real funds. Withdrawals allowed."
                  }
                </p>
              </div>
            </div>
            {isDemoAccount && (
              <Button 
                onClick={handleSwitchToLiveAccount}
                variant="outline"
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-500/10"
              >
                Switch to Live Account
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Demo Account Alert */}
      {isDemoAccount && (
        <Card className="p-6 bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-600 mb-1">Demo Account - Withdrawals Not Allowed</p>
              <p className="text-sm text-yellow-700">
                You are currently using a Demo account with virtual funds. To withdraw real money, 
                you need to switch to a Live account. Demo accounts are for practice only.
              </p>
              <div className="flex gap-3 mt-3">
                <Button 
                  onClick={handleSwitchToLiveAccount}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Switch to Live Account
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open("/dashboard/deposit", "_blank")}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                >
                  Deposit to Live Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Email Verification Alert */}
      {!emailVerified && (
        <Card className="p-6 bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <MailCheck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-600 mb-1">Email Verification Required</p>
              <p className="text-sm text-yellow-700 mb-3">
                You must verify your email address before you can withdraw funds.
              </p>
              <Button 
                onClick={handleSendVerificationEmail}
                variant="outline" 
                size="sm" 
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
              >
                Send Verification Email
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="p-6 bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-600 mb-1">How Withdrawal Works</p>
            <p className="text-sm text-blue-700">
              1. Submit withdrawal request → 2. Admin will contact you with payment instructions → 
              3. Make required payment → 4. Admin approves withdrawal → 5. Funds sent to you
            </p>
          </div>
        </div>
      </Card>

      {/* Only show withdrawal form for Live accounts */}
      {!isDemoAccount ? (
        <>
          {/* Withdrawal Method Selection */}
          <Card className="p-6 bg-card/50 border-border/40">
            <h3 className="text-xl font-semibold mb-6">Select Withdrawal Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onClick={() => setSelectedMethod(method.id)}
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
          {selectedMethod === "bank" && (
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

                <div>
                  <label className="block text-sm font-medium mb-2">Select Bank Account</label>
                  <select
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">Select a bank account</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} {account.number}
                      </option>
                    ))}
                    <option value="new">+ Add New Bank Account</option>
                  </select>
                </div>

                {bankAccount === "new" && (
                  <div className="p-4 bg-background/30 rounded-lg border border-border/40">
                    <h4 className="font-medium mb-3">Add New Bank Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Account Number</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Routing Number</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bank Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={!canWithdraw() || isSubmitting || !bankAccount}
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
                After submitting, admin will contact you with payment instructions
              </p>
            </Card>
          )}

          {/* E-Wallet Withdrawal Form */}
          {selectedMethod === "ewallet" && (
            <Card className="p-8 bg-card/50 border-border/40">
              <h3 className="text-xl font-semibold mb-6">E-Wallet Withdrawal</h3>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Withdrawal Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50"
                      className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                      min="50"
                      max={totalAvailableBalance}
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Available: ${totalAvailableBalance.toFixed(2)} • Minimum: $50
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select E-Wallet</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {eWallets.map(wallet => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setEWallet(wallet.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          eWallet === wallet.id
                            ? "border-primary bg-primary/10"
                            : "border-border/40 bg-background/50 hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium">{wallet.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {eWallet && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter Your {eWallets.find(w => w.id === eWallet)?.name} Email/ID</label>
                    <input
                      type="text"
                      placeholder="example@paypal.com or Wallet ID"
                      className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={!canWithdraw() || isSubmitting || !eWallet}
                className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Request E-Wallet Withdrawal"
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center mt-3">
                After submitting, admin will contact you with payment instructions
              </p>
            </Card>
          )}

          {/* Cryptocurrency Withdrawal Form */}
          {selectedMethod === "crypto" && (
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
                    {cryptocurrencies.map(crypto => (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          selectedCrypto === crypto.id
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
                  <label className="block text-sm font-medium mb-2">Destination Wallet Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cryptoWallets[selectedCrypto as keyof typeof cryptoWallets]}
                      readOnly
                      className="w-full px-4 py-3 pr-16 rounded-lg bg-background/50 border border-border/40 text-sm font-mono"
                    />
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
                After submitting, admin will contact you with payment instructions
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
                <p>After submitting your withdrawal request, the admin will review it and contact you with payment instructions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-500">2</span>
                </div>
                <p>You must make the required payment to get your withdrawal approved</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-500">3</span>
                </div>
                <p>Once payment is confirmed, your withdrawal will be processed and funds will be sent to you</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-500">4</span>
                </div>
                <p>Processing time depends on the withdrawal method selected</p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* Show message for Demo accounts */
        <Card className="p-8 bg-card/50 border-border/40 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
              <PlayCircle className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Demo Account Active</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You are currently using a Demo account with virtual funds. Demo accounts are for 
              practice and learning only. To withdraw real money, switch to a Live account.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={handleSwitchToLiveAccount}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Switch to Live Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open("/dashboard/deposit", "_blank")}
              >
                Deposit Funds
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}