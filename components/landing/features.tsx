import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Bell, BarChart3, User, BookOpen, Shield, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Online Booking Management",
    description: "Streamline your booking process with an intuitive interface that makes scheduling effortless for both you and your customers.",
    gradient: "from-blue-500/10 to-primary/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Calendar,
    title: "Calendar Scheduling",
    description: "Smart calendar integration that syncs seamlessly with Google Calendar, Outlook, and other popular calendar services.",
    gradient: "from-purple-500/10 to-primary/10",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description: "Keep everyone informed with automated email and SMS notifications for confirmations, reminders, and updates.",
    gradient: "from-green-500/10 to-primary/10",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard + Analytics",
    description: "Comprehensive analytics and insights to help you understand your business performance and make data-driven decisions.",
    gradient: "from-orange-500/10 to-primary/10",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: User,
    title: "Customer Profiles",
    description: "Maintain detailed customer profiles with booking history, preferences, and communication logs all in one place.",
    gradient: "from-pink-500/10 to-primary/10",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-level security with PCI compliance. Your data and your customers' data are always protected.",
    gradient: "from-indigo-500/10 to-primary/10",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/30 via-background to-background py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/3 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Everything You Need to
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            Powerful features designed to streamline your booking process and grow your business
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
                <CardContent className="relative p-6">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
