import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookOpen, Video, BarChart2, Users } from "lucide-react"

export const metadata = {
  title: "Education - Barcrest Capital",
  description: "Free trading education and learning resources for all skill levels",
}

export default function EducationPage() {
  const courses = [
    {
      level: "Beginner",
      title: "Introduction to Trading",
      description: "Learn the basics of forex, crypto, and stock trading",
      lessons: 15,
    },
    {
      level: "Intermediate",
      title: "Technical Analysis Masterclass",
      description: "Master chart patterns, indicators, and trading strategies",
      lessons: 24,
    },
    {
      level: "Advanced",
      title: "Professional Trading Systems",
      description: "Develop sophisticated trading algorithms and strategies",
      lessons: 32,
    },
  ]

  const resources = [
    {
      title: "Trading Guides",
      description: "Comprehensive guides on trading strategies, risk management, and market analysis",
      icon: BookOpen,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video lessons covering all aspects of trading and platform features",
      icon: Video,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/20",
    },
    {
      title: "Webinars",
      description: "Live webinars with professional traders sharing insights and market analysis",
      icon: BarChart2,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Community",
      description: "Connect with other traders, share ideas, and discuss market movements",
      icon: Users,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/20",
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
            Free Trading Education
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn from beginner to advanced level with our comprehensive courses
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.level}
              className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-4">
                {course.level}
              </span>
              <h3 className="text-2xl font-semibold mb-3">{course.title}</h3>
              <p className="text-muted-foreground mb-6">{course.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{course.lessons} lessons</span>
                <span className="text-sm font-semibold text-primary">Free</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <h2 className="text-3xl font-bold mb-8">Learning Resources</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource) => {
            const IconComponent = resource.icon
            return (
              <div
                key={resource.title}
                className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${resource.bgColor} flex items-center justify-center shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${resource.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
