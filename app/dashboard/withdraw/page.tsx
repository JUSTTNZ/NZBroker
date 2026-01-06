"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Building, Wallet, CreditCard, Copy, Check } from "lucide-react"

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [bankAccount, setBankAccount] = useState("")
  const [eWallet, setEWallet] = useState("")
  const [cryptoWallet, setCryptoWallet] = useState("")
  const [cryptoAddressCopied, setCryptoAddressCopied] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState("btc")

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

  const handleCopyCryptoAddress = () => {
    navigator.clipboard.writeText(cryptoWallets[selectedCrypto as keyof typeof cryptoWallets])
    setCryptoAddressCopied(true)
    setTimeout(() => setCryptoAddressCopied(false), 2000)
  }

  const handleWithdraw = () => {
    let methodDetails = ""
    
    if (selectedMethod === "bank") {
      methodDetails = bankAccounts.find(b => b.id === bankAccount)?.name || ""
    } else if (selectedMethod === "ewallet") {
      methodDetails = eWallet
    } else if (selectedMethod === "crypto") {
      methodDetails = cryptocurrencies.find(c => c.id === selectedCrypto)?.name || ""
    }

    alert(`Withdrawal request for $${amount} via ${methodDetails} has been submitted!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your trading account</p>
      </div>

      {/* Alert Banner */}
      <Card className="p-6 bg-yellow-500/10 border border-yellow-500/30 flex gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-600 mb-1">Withdrawal Information</p>
          <p className="text-sm text-yellow-700">
            • Minimum withdrawal: $100<br />
            • Processing time varies by method<br />
            • Fees may apply based on withdrawal method<br />
            • Ensure all details are correct before submitting
          </p>
        </div>
      </Card>

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
              <label className="block text-sm font-medium mb-2">Available Balance</label>
              <p className="text-3xl font-bold text-green-400">$8,500.00</p>
            </div>

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
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Minimum withdrawal: $100</p>
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
            className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold"
            disabled={!amount || parseFloat(amount) < 100 || !bankAccount}
          >
            Request Bank Withdrawal
          </Button>
        </Card>
      )}

      {/* E-Wallet Withdrawal Form */}
      {selectedMethod === "ewallet" && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">E-Wallet Withdrawal</h3>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Available Balance</label>
              <p className="text-3xl font-bold text-green-400">$8,500.00</p>
            </div>

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
                  min="50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Minimum withdrawal: $50</p>
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
            className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold"
            disabled={!amount || parseFloat(amount) < 50 || !eWallet}
          >
            Request E-Wallet Withdrawal
          </Button>
        </Card>
      )}

      {/* Cryptocurrency Withdrawal Form */}
      {selectedMethod === "crypto" && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">Cryptocurrency Withdrawal</h3>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Available Balance</label>
              <p className="text-3xl font-bold text-green-400">$8,500.00</p>
              <p className="text-sm text-muted-foreground mt-1">
                Balance will be converted to your selected cryptocurrency
              </p>
            </div>

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
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Minimum withdrawal: $100</p>
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

            <div>
              <label className="block text-sm font-medium mb-2">Estimated Crypto Amount</label>
              <div className="p-4 bg-background/30 rounded-lg">
                <p className="text-lg font-bold">
                  {amount ? (
                    <>
                      {(parseFloat(amount) * 0.000025).toFixed(6)} BTC
                      <span className="text-sm text-muted-foreground ml-2">
                        ≈ ${amount} USD
                      </span>
                    </>
                  ) : (
                    "Enter amount above to see estimate"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Important Crypto Warning */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
            <p className="text-sm text-red-600">
              ⚠️ <strong>Important:</strong> Make sure the wallet address supports {cryptocurrencies.find(c => c.id === selectedCrypto)?.name}. 
              Sending to the wrong address will result in permanent loss of funds.
            </p>
          </div>

          <Button 
            onClick={handleWithdraw}
            className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold"
            disabled={!amount || parseFloat(amount) < 100}
          >
            Request Crypto Withdrawal
          </Button>
        </Card>
      )}

      {/* Fee Information Card */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Withdrawal Fees & Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/30 rounded-lg">
            <h4 className="font-medium mb-2">Bank Transfer</h4>
            <p className="text-sm text-muted-foreground">Fee: $25 or 2%</p>
            <p className="text-sm text-muted-foreground">Min: $100, Max: $50,000/day</p>
          </div>
          <div className="p-4 bg-background/30 rounded-lg">
            <h4 className="font-medium mb-2">E-Wallet</h4>
            <p className="text-sm text-muted-foreground">Fee: $10 or 1%</p>
            <p className="text-sm text-muted-foreground">Min: $50, Max: $20,000/day</p>
          </div>
          <div className="p-4 bg-background/30 rounded-lg">
            <h4 className="font-medium mb-2">Cryptocurrency</h4>
            <p className="text-sm text-muted-foreground">Fee: Network fee only</p>
            <p className="text-sm text-muted-foreground">Min: $100, Max: $100,000/day</p>
          </div>
        </div>
      </Card>
    </div>
  )
}