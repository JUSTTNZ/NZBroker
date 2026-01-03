"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Phone } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-card/50 border-border/40">
          <MessageSquare className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Live Chat</h3>
          <p className="text-sm text-muted-foreground mb-4">Average response time: 2 minutes</p>
          <Button className="w-full bg-primary hover:bg-primary/90">Start Chat</Button>
        </Card>

        <Card className="p-6 bg-card/50 border-border/40">
          <Mail className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-muted-foreground mb-4">support@astralisx.com</p>
          <Button variant="outline" className="w-full bg-transparent">
            Send Email
          </Button>
        </Card>

        <Card className="p-6 bg-card/50 border-border/40">
          <Phone className="w-8 h-8 text-accent mb-4" />
          <h3 className="font-semibold mb-2">Phone Support</h3>
          <p className="text-sm text-muted-foreground mb-4">+1 (555) 123-4567</p>
          <Button variant="outline" className="w-full bg-transparent">
            Call Us
          </Button>
        </Card>
      </div>

      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Send us a Message</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              placeholder="Describe your issue..."
              rows={6}
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none resize-none"
            ></textarea>
          </div>

          <Button className="bg-primary hover:bg-primary/90">Send Message</Button>
        </div>
      </Card>
    </div>
  )
}
