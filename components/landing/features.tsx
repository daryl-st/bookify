import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Bell,
  BarChart3,
  User,
  BookOpen,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Services & slots",
    description:
      "Define services with duration and price, set availability windows, and let customers choose from generated time slots.",
  },
  {
    icon: Calendar,
    title: "Availability you control",
    description:
      "Recurring weekday windows or one-off dates shape when bookings can start—aligned with how your business actually operates.",
  },
  {
    icon: Bell,
    title: "Notifications (roadmap)",
    description:
      "The architecture is ready for confirmations and reminders; today the focus is reliable booking and clear in-app status.",
  },
  {
    icon: BarChart3,
    title: "Admin oversight",
    description:
      "Admins create services, review all bookings, and cancel when plans change—without digging through spreadsheets.",
  },
  {
    icon: User,
    title: "Customer accounts",
    description:
      "Customers sign in, book in a guided flow, and return to a dashboard to see or cancel their upcoming appointments.",
  },
  {
    icon: Shield,
    title: "Roles & access",
    description:
      "JWT sessions in httpOnly cookies separate customer and admin capabilities so the right people see the right data.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-b border-border bg-muted/25 py-24 sm:py-28"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Built for real booking workflows
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Less noise, more clarity—from first visit to confirmed appointment.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="border-border/80 bg-card shadow-none transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/40">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
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
