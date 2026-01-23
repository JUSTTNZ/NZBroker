import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Target, Handshake, Lock, Zap, Globe, Wallet, Smartphone } from "lucide-react"

export const metadata = {
  title: "About Barcrest Capital - Global Trading Platform",
  description: "Learn about Barcrest Capital's mission, values, and commitment to traders",
}

export default function AboutPage() {
  const values = [
    {
      title: "Excellence",
      description: "We strive for excellence in every aspect of our platform and service",
      icon: Target,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Transparency",
      description: "We believe in transparent operations and clear communication",
      icon: Handshake,
      iconColor: "text-secondary",
      bgColor: "bg-secondary/20",
    },
    {
      title: "Security",
      description: "Your security and privacy are our top priorities",
      icon: Lock,
      iconColor: "text-accent",
      bgColor: "bg-accent/20",
    },
  ]

  const features = [
    {
      title: "Ultra-Fast Execution",
      description: "Execute trades in milliseconds with our advanced infrastructure",
      icon: Zap,
    },
    {
      title: "Global Reach",
      description: "Access 500+ trading instruments across all asset classes",
      icon: Globe,
    },
    {
      title: "Zero Commission",
      description: "Trade with zero hidden fees and competitive spreads",
      icon: Wallet,
    },
    {
      title: "Multi-Platform",
      description: "Trade on web, desktop, iOS, or Android anytime, anywhere",
      icon: Smartphone,
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            About Barcrest Capital
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
          Founded in 2020, Barcrest Capital was created with a simple mission: to democratize access to professional
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
          {values.map((value) => {
            const IconComponent = value.icon
            return (
              <div
                key={value.title}
                className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-lg ${value.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`w-8 h-8 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Barcrest Capital?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
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
