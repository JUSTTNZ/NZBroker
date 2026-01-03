"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Zap, DollarSign } from "lucide-react"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("card")

  const paymentMethods = [
    { id: "card", name: "Credit Card", icon: CreditCard, desc: "Instant deposit" },
    { id: "bank", name: "Bank Transfer", icon: Zap, desc: "1-2 business days" },
    { id: "wallet", name: "Crypto Wallet", icon: DollarSign, desc: "Instant deposit" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
        <p className="text-muted-foreground">Add funds to your trading account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              onClick={() => setSelectedMethod(method.id)}
            >
              <IconComponent className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
              <p className="text-sm text-muted-foreground">{method.desc}</p>
            </Card>
          )
        })}
      </div>

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

        <div className="grid grid-cols-2 gap-4 mb-8">
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
    </div>
  )
}
