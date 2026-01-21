import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us - AstralisX Vault",
  description: "Get in touch with AstralisX Vault support team",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground">Have questions? We're here to help</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none transition-colors resize-none"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Office Location</h3>
              </div>
              <p className="text-muted-foreground">
                AstralisX Vault
                <br />
                123 Financial Plaza
                <br />
                New York, NY 10001
                <br />
                United States
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Support Hours</h3>
              </div>
              <p className="text-muted-foreground mb-2">Monday - Friday: 8:00 AM - 8:00 PM UTC</p>
              <p className="text-muted-foreground">Saturday - Sunday: 10:00 AM - 6:00 PM UTC</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
