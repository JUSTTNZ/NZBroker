"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const [bankAccount, setBankAccount] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your trading account</p>
      </div>

      <Card className="p-6 bg-yellow-500/10 border border-yellow-500/30 flex gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-600 mb-1">Withdrawal Processing</p>
          <p className="text-sm text-yellow-700">
            Withdrawals are processed within 1-3 business days depending on your bank
          </p>
        </div>
      </Card>

      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Withdrawal Details</h3>

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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Account</label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
            >
              <option value="">Select a bank account</option>
              <option value="1">Chase Checking ****5678</option>
              <option value="2">Wells Fargo Savings ****1234</option>
              <option value="3">Add New Bank Account</option>
            </select>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-semibold">
          Request Withdrawal
        </Button>
      </Card>
    </div>
  )
}
