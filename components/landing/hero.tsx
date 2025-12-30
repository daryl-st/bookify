import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Zap, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-muted/20 py-24 sm:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute right-1/2 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/3 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Trusted by 10,000+ businesses</span>
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  Book Smarter,
                  <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Not Harder.
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl lg:mx-0">
                  The all-in-one booking platform that transforms how you manage appointments. 
                  Beautiful, powerful, and designed for growth.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">40%</div>
                    <div className="text-xs text-muted-foreground">More Bookings</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5min</div>
                    <div className="text-xs text-muted-foreground">Setup Time</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/book">
                  <Button size="lg" className="group w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                    Book a Service
                    <Play className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual - Enhanced Dashboard Preview */}
            <div className="relative">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                          <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Bookify</div>
                          <div className="text-xs text-muted-foreground">Dashboard</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live</span>
                      </div>
                    </div>

                    {/* Visual Calendar Grid */}
                    <div className="rounded-xl bg-background/80 border border-border/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold">This Week</span>
                        <span className="text-xs text-muted-foreground">8 bookings</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                          <div
                            key={i}
                            className={`text-center text-xs py-1.5 font-semibold ${
                              i === 2 ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 grid grid-cols-7 gap-1.5">
                        {[25, 26, 27, 28, 29, 30, 1].map((date, i) => (
                          <div
                            key={i}
                            className={`relative flex h-10 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                              i === 2
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : i === 0 || i === 4
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {date}
                            {i === 2 && (
                              <div className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary-foreground"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Cards */}
                    <div className="space-y-2">
                      {[
                        { name: "Sarah J.", time: "10:00 AM", status: "confirmed" },
                        { name: "Michael C.", time: "2:30 PM", status: "confirmed" },
                      ].map((booking, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl bg-background/80 border border-border/50 p-3 shadow-sm"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                            <div className="h-6 w-6 rounded-full bg-primary/30"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold">{booking.name}</div>
                            <div className="text-xs text-muted-foreground">{booking.time}</div>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      ))}
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">24</div>
                        <div className="text-xs text-muted-foreground">This Month</div>
                      </div>
                      <div className="text-center border-x border-border/50">
                        <div className="text-xl font-bold text-primary">8</div>
                        <div className="text-xs text-muted-foreground">Today</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">$2.4k</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl bg-primary/10 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/5 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
