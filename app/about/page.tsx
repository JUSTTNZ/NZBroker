import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About AstralisX Vault - Global Trading Platform",
  description: "Learn about AstralisX Vault's mission, values, and commitment to traders",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            About AstralisX Vault
          </h1>
          <p className="text-lg text-muted-foreground">
            Empowering traders worldwide with professional-grade tools and resources
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Founded in 2020, AstralisX Vault was created with a simple mission: to democratize access to professional
          trading tools and make global markets accessible to everyone. We believed that traders deserved better, and we
          set out to build a platform that combines institutional-grade technology with user-friendly design.
        </p>
        <p className="text-muted-foreground text-lg">
          Today, we serve thousands of traders across 50+ countries, offering access to crypto, forex, indices, and
          stocks with zero commission and world-class execution speeds.
        </p>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Excellence</h3>
            <p className="text-muted-foreground">
              We strive for excellence in every aspect of our platform and service
            </p>
          </div>
          <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="w-16 h-16 rounded-lg bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Transparency</h3>
            <p className="text-muted-foreground">We believe in transparent operations and clear communication</p>
          </div>
          <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Security</h3>
            <p className="text-muted-foreground">Your security and privacy are our top priorities</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose AstralisX Vault?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold mb-2">Ultra-Fast Execution</h3>
              <p className="text-muted-foreground">Execute trades in milliseconds with our advanced infrastructure</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-2xl">🌍</span>
            <div>
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-muted-foreground">Access 500+ trading instruments across all asset classes</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-semibold mb-2">Zero Commission</h3>
              <p className="text-muted-foreground">Trade with zero hidden fees and competitive spreads</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-semibold mb-2">Multi-Platform</h3>
              <p className="text-muted-foreground">Trade on web, desktop, iOS, or Android anytime, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Warning */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">Risk Warning</h3>
          <p className="text-sm text-muted-foreground text-balance">
            CFDs are complex financial products. Trading CFDs involves substantial risk of loss. 74-89% of retail
            investor accounts lose money when trading CFDs. You should not risk more than you can afford to lose. Before
            trading, please ensure you fully understand the risks involved and seek advice from independent financial
            advisors if necessary.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
