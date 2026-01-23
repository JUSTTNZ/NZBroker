"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, TrendingUp, Check, Share2, Users, DollarSign } from "lucide-react"
import { useState } from "react"

export default function ReferralProgramPage() {
  const referralLink = "https://barcrestcapital.com/ref/john123"
  const [copied, setCopied] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = (platform: string) => {
    let shareUrl = ""
    const text = "Join me on Barcrest Capital Trading Platform! Use my referral link: "

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + referralLink)}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`
        break
      case "email":
        shareUrl = `mailto:?subject=Join me on Barcrest Capital&body=${encodeURIComponent(text + referralLink)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + referralLink)}`
        break
      case "copy":
        copyToClipboard()
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
    setShowShareOptions(false)
  }

  const sharePlatforms = [
    { id: "whatsapp", name: "WhatsApp", color: "bg-green-500 hover:bg-green-600" },
    { id: "telegram", name: "Telegram", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "twitter", name: "Twitter", color: "bg-sky-500 hover:bg-sky-600" },
    { id: "email", name: "Email", color: "bg-gray-500 hover:bg-gray-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">Earn commissions by referring friends and colleagues</p>
      </div>

      {/* Referral Link Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/20 to-accent/10 border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Your Unique Referral Link</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Share Options Dropdown */}
        {showShareOptions && (
          <div className="mb-4 p-4 bg-background/50 rounded-lg border border-border/40">
            <p className="text-sm font-medium mb-3">Share via:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sharePlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => shareReferral(platform.id)}
                  className={`${platform.color} text-white`}
                  size="sm"
                >
                  {platform.name}
                </Button>
              ))}
              <Button
                onClick={() => shareReferral("copy")}
                variant="outline"
                className="col-span-2 md:col-span-4"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link Instead
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full px-4 py-3 pr-24 rounded-lg bg-background/50 border border-border/40 text-sm"
            />
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              <Button 
                variant="ghost" 
                onClick={copyToClipboard} 
                className="h-full"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {copied && (
          <div className="flex items-center text-green-500 text-sm">
            <Check className="w-4 h-4 mr-2" />
            Link copied to clipboard! You can now paste it anywhere.
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-card/50 border-border/40">
          <Users className="w-8 h-8 text-primary mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Total Referrals</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground mt-2">Active referrals</p>
        </Card>
        <Card className="p-6 bg-card/50 border-border/40">
          <DollarSign className="w-8 h-8 text-green-400 mb-4" />
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
        <Card className="p-6 bg-card/50 border-border/40">
          <DollarSign className="w-8 h-8 text-purple-400 mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Pending Payout</p>
          <p className="text-3xl font-bold">$850</p>
          <p className="text-xs text-muted-foreground mt-2">Available for withdrawal</p>
        </Card>
      </div>

      {/* How It Works & Commission Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 border-border/40">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <ul className="space-y-3">
            {[
              "Share your referral link with friends",
              "They sign up and make their first deposit",
              "You earn 20% commission on their trading fees",
              "Commissions are paid out monthly",
              "No limit on how many people you can refer"
            ].map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-3 shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 bg-card/50 border-border/40">
          <h3 className="text-lg font-semibold mb-4">Commission Tiers</h3>
          <div className="space-y-4">
            {[
              { referrals: "1-10", rate: "20%", bonus: "Standard" },
              { referrals: "11-25", rate: "25%", bonus: "+$100 bonus" },
              { referrals: "26-50", rate: "30%", bonus: "+$500 bonus" },
              { referrals: "51+", rate: "35%", bonus: "VIP Support" },
            ].map((tier, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                <div>
                  <p className="font-medium">{tier.referrals} Referrals</p>
                  <p className="text-xs text-muted-foreground">{tier.bonus}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{tier.rate}</p>
                  <p className="text-xs text-muted-foreground">Commission Rate</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="p-6 bg-card/50 border-border/40">
        <h3 className="text-lg font-semibold mb-4">Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              title: "Share Widely", 
              desc: "Post on social media, forums, and communities related to trading" 
            },
            { 
              title: "Create Content", 
              desc: "Share your trading success stories to attract serious traders" 
            },
            { 
              title: "Track Performance", 
              desc: "Monitor which channels bring the most successful referrals" 
            },
          ].map((tip, index) => (
            <div key={index} className="p-4 bg-background/30 rounded-lg">
              <h4 className="font-medium mb-2">{tip.title}</h4>
              <p className="text-sm text-muted-foreground">{tip.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}