import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, CalendarPlus, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an account",
    description: "Sign up in minutes with just your email. No credit card required to get started.",
    color: "from-blue-500 to-primary",
  },
  {
    number: "02",
    icon: CalendarPlus,
    title: "Add services and schedule",
    description: "Set up your services, availability, and pricing. Customize your booking rules.",
    color: "from-purple-500 to-primary",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Start accepting bookings",
    description: "Share your booking link and start accepting reservations from customers instantly.",
    color: "from-green-500 to-primary",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/20 to-background py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <CheckCircle className="h-4 w-4" />
            <span>Simple Process</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Get Started in
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Three Steps
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            Setting up your booking system has never been easier
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connecting Arrow (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 md:block z-10">
                      <div className="flex items-center gap-2">
                        <div className="h-0.5 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                        <ArrowRight className="h-5 w-5 text-primary/50" />
                        <div className="h-0.5 w-12 bg-gradient-to-l from-primary/50 to-transparent"></div>
                      </div>
                    </div>
                  )}

                  <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                    
                    <CardContent className="relative p-8">
                      {/* Step number badge */}
                      <div className="mb-6 flex items-center justify-between">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg shadow-primary/25`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-5xl font-bold text-muted-foreground/10">
                          {step.number}
                        </span>
                      </div>
                      
                      <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
