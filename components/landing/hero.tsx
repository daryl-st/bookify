import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-28 sm:py-36">
      {/* Single restrained graphic: fine grid + soft vertical emphasis */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.88_0.01_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.88_0.01_260)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <div className="absolute right-0 top-0 h-[min(70vh,640px)] w-[min(45vw,520px)] bg-gradient-to-bl from-primary/[0.07] via-transparent to-transparent" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="space-y-10 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Service appointments
                </span>
              </div>

              <div className="space-y-6">
                <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl sm:tracking-[-0.045em] lg:text-7xl">
                  Schedule work
                  <span className="mt-1 block text-foreground/90">
                    without friction.
                  </span>
                </h1>
                <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                  Bookify helps service businesses publish services, open hours, and
                  let customers book confirmed time slots—clear for you and for them.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-start">
                <Link href="/book" className="sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full px-8 text-base font-medium sm:w-auto"
                  >
                    Book a service
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/register" className="sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full border-border bg-background/80 px-8 text-base font-medium backdrop-blur-sm sm:w-auto"
                  >
                    Create account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Preview: editorial panel, no glass stack */}
            <div className="relative lg:pl-4">
              <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
                <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Preview
                      </p>
                      <p className="text-lg font-semibold tracking-tight">This week</p>
                    </div>
                    <span className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      8 bookings
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d}>{d.slice(0, 1)}</span>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {[24, 25, 26, 27, 28, 1, 2].map((d, i) => (
                      <div
                        key={`${d}-${i}`}
                        className={`flex aspect-square items-center justify-center rounded-md text-sm font-medium ${
                          i === 2
                            ? "bg-primary text-primary-foreground"
                            : "border border-transparent text-muted-foreground hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <ul className="mt-8 space-y-3 border-t border-border pt-6">
                    {[
                      { name: "Studio consult", time: "10:00", sub: "Confirmed" },
                      { name: "Follow-up session", time: "14:30", sub: "Confirmed" },
                    ].map((row) => (
                      <li
                        key={row.name}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{row.name}</p>
                          <p className="text-xs text-muted-foreground">{row.sub}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {row.time}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Customers pick a service, date, and slot—then manage bookings in
                    their dashboard.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
