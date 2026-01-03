"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, TrendingUp } from "lucide-react"

export default function ReferralProgramPage() {
  const referralLink = "https://astralisx.com/ref/john123"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">Earn commissions by referring friends</p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-primary/20 to-accent/10 border-border/40">
        <h3 className="text-xl font-semibold mb-4">Your Referral Link</h3>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/40 text-sm"
          />
          <Button variant="outline" onClick={copyToClipboard} className="bg-transparent">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card/50 border-border/40">
          <TrendingUp className="w-8 h-8 text-primary mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Referrals</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground mt-2">Active referrals</p>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Commission Earned</p>
          <p className="text-3xl font-bold">$2,450</p>
          <p className="text-xs text-green-400 mt-2">Lifetime earnings</p>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <TrendingUp className="w-8 h-8 text-secondary mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Commission Rate</p>
          <p className="text-3xl font-bold">20%</p>
          <p className="text-xs text-muted-foreground mt-2">Recurring commission</p>
        </Card>
      </div>
    </div>
  )
}
