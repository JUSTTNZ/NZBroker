"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Zap, DollarSign, Copy, Check, Upload } from "lucide-react"
import QRCode from "react-qr-code"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("crypto")
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [walletCopied, setWalletCopied] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const paymentMethods = [
        { id: "crypto", name: "Cryptocurrency", icon: DollarSign, desc: "Instant deposit" },
    { id: "card", name: "Credit Card", icon: CreditCard, desc: "Instant deposit" },
    { id: "bank", name: "Bank Transfer", icon: Zap, desc: "1-2 business days" },

  ]

  const cryptoCurrencies = [
    { id: "eth", name: "Ethereum (ETH)", symbol: "ETH", icon: "Ξ" },
    { id: "btc", name: "Bitcoin (BTC)", symbol: "BTC", icon: "₿" },
    { id: "usdt", name: "Tether (USDT)", symbol: "USDT", icon: "₮" },
    { id: "solana", name: "Solana (SOL)", symbol: "SOL", icon: "◎" },
  ]

  const cryptoWallets = {
    eth: "0x74d0cb9b52ED68f69980899b19c42Ee9B9eCB72C",
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    usdt: "TKrjq7L8x2dY7vq1V2nTqP3k4M5n6B7v8C9d0E1f2G3",
    solana: "So1anaWaL1etAddR3ss1234567890ABCDEFGHIJKLM",
  }

  const handleCopyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet)
    setWalletCopied(true)
    setTimeout(() => setWalletCopied(false), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCryptoSelect = (cryptoId: string) => {
    setSelectedCrypto(cryptoId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
        <p className="text-muted-foreground">Make deposit through any of our available payment methods.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Cryptocurrency Selection */}
      {selectedMethod === "crypto" && (
        <Card className="p-6 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-4">Select Cryptocurrency</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    value={cryptoWallets[selectedCrypto as keyof typeof cryptoWallets]} 
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
                      {cryptoWallets[selectedCrypto as keyof typeof cryptoWallets]}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyWallet(cryptoWallets[selectedCrypto as keyof typeof cryptoWallets])}
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

      {/* Regular Payment Card (for non-crypto methods) */}
      {selectedMethod !== "crypto" && (
        <Card className="p-8 bg-card/50 border-border/40">
          <h3 className="text-xl font-semibold mb-6">Deposit Amount</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount (USD)</label>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="p-3 rounded-lg bg-background/50 border border-border/40 hover:border-primary/50 transition-colors text-sm font-medium"
              >
                ${preset}
              </button>
            ))}
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold">
            Continue to Payment
          </Button>
        </Card>
      )}
    </div>
  )
}