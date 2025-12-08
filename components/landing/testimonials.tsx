import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Salon Owner",
    company: "Bella Beauty",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "Bookify has transformed how we manage appointments. Our booking process is now seamless, and customers love the convenience.",
    rating: 5,
    highlight: "40% increase in bookings",
  },
  {
    name: "Michael Chen",
    role: "Fitness Coach",
    company: "FitLife Studio",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content: "The automated notifications and calendar sync have saved us hours every week. Highly recommend for any service business.",
    rating: 5,
    highlight: "Saves 10+ hours/week",
  },
  {
    name: "Emily Rodriguez",
    role: "Consultant",
    company: "Elite Consulting",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content: "The admin dashboard gives us incredible insights into our business. We've increased bookings by 40% since switching.",
    rating: 5,
    highlight: "Best ROI we've seen",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/30 via-background to-background py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Star className="h-4 w-4" />
            <span>Customer Stories</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Loved by
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            See what our customers are saying about Bookify
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Quote icon decoration */}
              <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="h-16 w-16 text-primary" />
              </div>

              <CardContent className="relative p-6">
                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mb-6 text-muted-foreground leading-relaxed relative z-10">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Highlight badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <span>✨</span>
                  <span>{testimonial.highlight}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {testimonial.company}
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
