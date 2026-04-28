import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, CalendarPlus, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an account",
    description:
      "Register as a customer to book, or use an admin account to manage services and every booking in one place.",
  },
  {
    number: "02",
    icon: CalendarPlus,
    title: "Choose service & time",
    description:
      "Pick a service, a date, and an available slot. The app checks windows and conflicts so only valid times are offered.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Confirm & manage",
    description:
      "Bookings land as confirmed in your dashboard. Cancel when needed—customers for their own; admins for anyone.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-border bg-background py-24 sm:py-28"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Three steps from browse to booked
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            A straight path for customers and a calm control surface for your team.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.number}
                  className="h-full border-border/80 bg-card shadow-none"
                >
                  <CardContent className="flex h-full flex-col p-6 sm:p-8">
                    <div className="mb-6 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-foreground text-background">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-3xl font-light tabular-nums text-muted-foreground/40">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
