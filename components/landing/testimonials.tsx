import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Salon owner",
    company: "Bella Beauty",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "We moved off phone tag and sticky notes. Clients book online and we see everything in one list.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Coach",
    company: "FitLife Studio",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "The flow is simple for members and for staff. Fewer double-bookings and less time on scheduling.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Consultant",
    company: "Elite Consulting",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content:
      "Clear services and time slots mean fewer back-and-forth emails before a meeting is locked in.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border bg-muted/25 py-24 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Teams that value clarity
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Representative feedback from businesses that prioritize a calm booking
            experience.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border-border/80 bg-card shadow-none transition-shadow hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col p-6 sm:p-7">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                      aria-hidden
                    />
                  ))}
                </div>

                <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-3 border-t border-border pt-5">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
