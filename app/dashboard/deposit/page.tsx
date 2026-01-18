"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { 
  DollarSign, 
  Copy, 
  Check, 
  Upload,
  ArrowRightLeft,
  Wallet,
  TrendingUp,
  Bot,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import QRCode from "react-qr-code"

export default function DepositPage() {
  const { user, currentWallet, userProfile, refreshAllData } = useAuth()
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("transfer")
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [walletCopied, setWalletCopied] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [transferFrom, setTransferFrom] = useState<string>("total")
  const [transferTo, setTransferTo] = useState<string>("trading")
  const [transferring, setTransferring] = useState(false)
  
  const supabase = createClient()

  // Payment methods - only internal transfer and crypto
  const paymentMethods = [
    { id: "transfer", name: "Internal Transfer", icon: ArrowRightLeft, desc: "Move funds between wallets" },
    { id: "crypto", name: "Cryptocurrency", icon: DollarSign, desc: "External deposit" },
  ]

  // Same wallet addresses used for both funding section and crypto deposit
  const walletAddresses = {
    eth: "0x74d0cb9b52ED68f69980899b19c42Ee9B9eCB72C",
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    usdt: "TKrjq7L8x2dY7vq1V2nTqP3k4M5n6B7v8C9d0E1f2G3",
  }

  // Cryptocurrencies - removed solana
  const cryptoCurrencies = [
    { id: "eth", name: "Ethereum (ETH)", symbol: "ETH", icon: "Ξ" },
    { id: "btc", name: "Bitcoin (BTC)", symbol: "BTC", icon: "₿" },
    { id: "usdt", name: "Tether (USDT)", symbol: "USDT", icon: "₮" },
  ]

  const transferOptions = [
    { id: "total", name: "Total Balance", icon: Wallet, description: "Main wallet balance" },
    { id: "trading", name: "Trading Balance", icon: TrendingUp, description: "For manual trading" },
    { id: "bot", name: "Bot Trading Balance", icon: Bot, description: "For auto trading" },
  ]

  // User wallet addresses for funding section - using the same addresses
  const userWalletAddresses = [
    { currency: "USDT", address: walletAddresses.usdt, network: "ERC20", symbol: "USDT" },
    { currency: "ETH", address: walletAddresses.eth, network: "Ethereum", symbol: "ETH" },
    { currency: "BTC", address: walletAddresses.btc, network: "Bitcoin", symbol: "BTC" },
  ]
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const getCurrentBalance = (walletType: string) => {
    if (!currentWallet) return 0
    
    switch(walletType) {
      case "total": return currentWallet.total_balance
      case "trading": return currentWallet.trading_balance
      case "bot": return currentWallet.bot_trading_balance
      default: return 0
    }
  }

  const handleCopyWallet = (wallet: string, currency: string) => {
    navigator.clipboard.writeText(wallet)
    setCopiedAddress(currency)
    toast.success(`${currency} address copied!`)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCryptoSelect = (cryptoId: string) => {
    setSelectedCrypto(cryptoId)
  }

  const handleTransfer = async () => {
    if (!user || !currentWallet) {
      toast.error("Please login to transfer funds")
      return
    }

    const transferAmount = parseFloat(amount)
    
    if (!transferAmount || transferAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (transferFrom === transferTo) {
      toast.error("Cannot transfer to the same wallet")
      return
    }

    const fromBalance = getCurrentBalance(transferFrom)
    if (transferAmount > fromBalance) {
      toast.error(`Insufficient balance in ${transferFrom} wallet`)
      return
    }

    setTransferring(true)
    
    try {
      console.log(`🔄 Transferring $${transferAmount} from ${transferFrom} to ${transferTo}`)

      // Calculate new balances
      const newFromBalance = fromBalance - transferAmount
      const toBalance = getCurrentBalance(transferTo)
      const newToBalance = toBalance + transferAmount

      // Prepare update object
      const updateData: any = { updated_at: new Date().toISOString() }
      
      // Set from balance
      if (transferFrom === "total") updateData.total_balance = newFromBalance
      else if (transferFrom === "trading") updateData.trading_balance = newFromBalance
      else if (transferFrom === "bot") updateData.bot_trading_balance = newFromBalance
      
      // Set to balance
      if (transferTo === "total") updateData.total_balance = newToBalance
      else if (transferTo === "trading") updateData.trading_balance = newToBalance
      else if (transferTo === "bot") updateData.bot_trading_balance = newToBalance

      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update(updateData)
        .eq("id", currentWallet.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          account_type: currentWallet.account_type,
          type: "transfer",
          amount: transferAmount,
          description: `Transfer from ${transferFrom} to ${transferTo} balance`,
          status: "completed",
          reference_id: `TRANSFER_${user.id}_${Date.now()}`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.warn("Transaction log error:", transactionError)
        // Continue anyway
      }

      // Create notification
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Funds Transferred",
        message: `Successfully transferred $${transferAmount.toFixed(2)} from ${transferFrom} to ${transferTo}`,
        type: "transfer",
        read: false,
        created_at: new Date().toISOString()
      })
      
      if(notificationError){
        console.warn("Notification error:", notificationError)
      }
      
      // Refresh data
      await refreshAllData()
      
      // Reset form
      setAmount("")
      
      toast.success(`✅ Successfully transferred $${transferAmount.toFixed(2)}`)
      
    } catch (error: any) {
      console.error("❌ Transfer error:", error)
      toast.error(error.message || "Failed to transfer funds")
    } finally {
      setTransferring(false)
    }
  }

  const formatBalance = (balance: number) => {
    return `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deposit & Transfer</h1>
        <p className="text-muted-foreground">Deposit funds or transfer between your wallets</p>
      </div>

      {/* WALLET ADDRESSES FOR FUNDING - Add this section */}
      {currentWallet?.account_type === 'live' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Wallet Addresses for Funding</h2>
            <Badge className="bg-green-500">Live Account</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userWalletAddresses.map((wallet) => (
              <Card key={wallet.currency} className="p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Pay to this {wallet.currency} Wallet</h3>
                    <p className="text-sm text-gray-500">For admin to fund your live account</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Wallet Address */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium">Wallet Address:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyWallet(wallet.address, wallet.currency)}
                        className="h-8 px-2"
                      >
                        {copiedAddress === wallet.currency ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">
                        {wallet.address}
                      </p>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      Network: {wallet.network}
                    </Badge>
                  </div>
                </div>

                {/* Notice */}
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Send only {wallet.symbol} to this address. After payment, contact support with transaction details.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* General Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Important:</strong> Send funds to any wallet above, then contact support with the transaction ID. 
              Your account will be credited within 5-30 minutes after confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Current Wallet Balances */}
      <Card className="p-6 bg-card/50 border-border/40">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Current Balances</h2>
          <Badge variant="outline" className="ml-auto">
            {currentWallet?.account_type === 'demo' ? 'Demo Account' : 'Live Account'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transferOptions.map((wallet) => (
            <Card key={wallet.id} className="p-4 bg-background/30 border-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <wallet.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{wallet.name}</h3>
                  <p className="text-xs text-muted-foreground">{wallet.description}</p>
                </div>
              </div>
              <p className="text-2xl font-bold">
                {formatBalance(getCurrentBalance(wallet.id))}
              </p>
              <Badge variant="secondary" className="mt-2">
                Available
              </Badge>
            </Card>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <Card
                key={method.id}
                className={`p-6 cursor-pointer border-2 transition-all ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/10"
                    : "border-border/40 bg-card/50 hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedMethod(method.id)
                  if (method.id !== "crypto") {
                    setSelectedCrypto(null)
                  }
                }}
              >
                <IconComponent className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* INTERNAL TRANSFER SECTION */}
      {selectedMethod === "transfer" && (
        <Card className="p-8 bg-card/50 border-border/40">
          <div className="flex items-center gap-3 mb-6">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Transfer Between Wallets</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transfer From */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="from" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>From</span>
                  <Badge variant="outline" className="text-xs">
                    Current: {formatBalance(getCurrentBalance(transferFrom))}
                  </Badge>
                </Label>
                <Select value={transferFrom} onValueChange={setTransferFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferOptions.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        <div className="flex items-center gap-3">
                          <wallet.icon className="w-4 h-4" />
                          <span>{wallet.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transfer To */}
              <div>
                <Label htmlFor="to" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>To</span>
                  <Badge variant="outline" className="text-xs">
                    Current: {formatBalance(getCurrentBalance(transferTo))}
                  </Badge>
                </Label>
                <Select value={transferTo} onValueChange={setTransferTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferOptions
                      .filter(w => w.id !== transferFrom)
                      .map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center gap-3">
                            <wallet.icon className="w-4 h-4" />
                            <span>{wallet.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount & Action */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2">
                  Amount (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={getCurrentBalance(transferFrom)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Available: {formatBalance(getCurrentBalance(transferFrom))}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    disabled={preset > getCurrentBalance(transferFrom)}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>

              {/* Transfer Button */}
              <Button
                onClick={handleTransfer}
                disabled={transferring || !amount || parseFloat(amount) <= 0 || transferFrom === transferTo}
                className="w-full py-3 text-base font-semibold gap-2"
              >
                {transferring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer Funds
                  </>
                )}
              </Button>

              {/* Transfer Rules */}
              <Card className="p-4 bg-muted/30 border-border/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Important Transfer Rules:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Withdrawals only allowed from Total Balance</li>
                      <li>• Bot profits must be moved to Total Balance first</li>
                      <li>• Trading profits can be moved to Total Balance</li>
                      <li>• Transfers are instant and free</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      )}

      {/* Cryptocurrency Selection */}
      {selectedMethod === "crypto" && (
        <Card className="p-6 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-4">Select Cryptocurrency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cryptoCurrencies.map((crypto) => (
              <Card
                key={crypto.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  selectedCrypto === crypto.id
                    ? "border-primary bg-primary/10"
                    : "border-border/40 bg-card/30 hover:border-primary/50"
                }`}
                onClick={() => handleCryptoSelect(crypto.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{crypto.icon}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                    {crypto.symbol}
                  </span>
                </div>
                <h4 className="font-medium text-sm">{crypto.name}</h4>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Payment Details Card - Shows after crypto selection */}
      {selectedMethod === "crypto" && selectedCrypto && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">
            Make your payment to the {cryptoCurrencies.find(c => c.id === selectedCrypto)?.name} wallet address below.
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="font-medium mb-4">QR Code</h4>
                <div className="inline-block p-4 bg-white rounded-lg">
                  <QRCode 
                    value={walletAddresses[selectedCrypto as keyof typeof walletAddresses]} 
                    size={200}
                  />
                </div>
              </div>
            </div>

            {/* Wallet Address Section */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Wallet Address:</h4>
                <div className="p-4 bg-background/50 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm break-all">
                      {walletAddresses[selectedCrypto as keyof typeof walletAddresses]}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddresses[selectedCrypto as keyof typeof walletAddresses])
                        setWalletCopied(true)
                        toast.success(`${selectedCrypto.toUpperCase()} address copied!`)
                        setTimeout(() => setWalletCopied(false), 2000)
                      }}
                      className="ml-2 shrink-0"
                    >
                      {walletCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {walletCopied && (
                  <p className="text-green-500 text-sm mt-2">✓ Wallet Address Copied to Clipboard!</p>
                )}
              </div>

              {/* Deposit Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Enter Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1,000"
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Receipt Section */}
              <div>
                <h4 className="font-medium mb-2">Kindly Upload Payment Receipt below.</h4>
                <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="receipt-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {file ? file.name : "No file chosen"}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      Please use the Upload Receipt Choose File/Browse File
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported: JPG, PNG, PDF, DOC (Max: 5MB)
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Important:</strong> Please confirm payment after making deposit from your account 
              or contact our Live Chat agent to receive the appropriate payment details if not clear. 
              Alternatively, you can contact your Account Manager to help you fund your account. 
              Thanks for trusting us.
            </p>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold mt-6">
            Confirm Deposit
          </Button>
        </Card>
      )}
    </div>
  )
}