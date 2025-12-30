"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  durationMinutes: number;
};

type Availability = {
  id: string;
  serviceId: string;
  dayOfWeek: number | null;
  date: string | null;
  openTime: string;
  closeTime: string;
  durationMinutes: number;
};

const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
  time: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "Please select a time slot"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function generateSlotsForDate(
  date: Date,
  availability: Availability[],
  fallbackDurationMinutes: number
) {
  const slots: string[] = [];

  const yyyyMmDd = format(date, "yyyy-MM-dd");
  const dayOfWeek = date.getDay(); // 0-6
  const now = new Date();

  for (const window of availability) {
    const windowDate = window.date ? new Date(window.date) : null;
    const appliesByDate =
      windowDate && format(windowDate, "yyyy-MM-dd") === yyyyMmDd;
    const appliesByDay =
      window.dayOfWeek !== null && window.dayOfWeek === dayOfWeek;

    if (!appliesByDate && !appliesByDay) continue;

    const [openHour, openMinute] = window.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = window.closeTime.split(":").map(Number);

    const start = new Date(date);
    start.setHours(openHour, openMinute, 0, 0);

    const end = new Date(date);
    end.setHours(closeHour, closeMinute, 0, 0);

    const duration = window.durationMinutes || fallbackDurationMinutes;
    let cursor = new Date(start);

    while (cursor < end) {
      const slotEnd = new Date(cursor.getTime() + duration * 60000);
      if (slotEnd > end) break;

      // Filter out slots in the past for today
      if (cursor > now) {
        const label = format(cursor, "HH:mm");
        slots.push(label);
      }

      cursor = slotEnd;
    }
  }

  // Deduplicate and sort
  const unique = Array.from(new Set(slots));
  unique.sort();
  return unique;
}

export default function BookPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
    },
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  const selectedDate = useMemo(() => {
    const d = form.watch("date");
    if (!d) return null;
    try {
      return new Date(`${d}T00:00:00`);
    } catch {
      return null;
    }
  }, [form]);

  const slots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    return generateSlotsForDate(
      selectedDate,
      availability,
      selectedService.durationMinutes
    );
  }, [availability, selectedDate, selectedService]);

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        setServicesError(null);
        const res = await fetch("/api/services");
        if (!res.ok) {
          throw new Error("Failed to load services");
        }
        const data = await res.json();
        setServices(data.services ?? []);
      } catch (err) {
        setServicesError(
          err instanceof Error ? err.message : "Unable to load services"
        );
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch availability when service changes
  useEffect(() => {
    if (!selectedServiceId) return;

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        const res = await fetch(
          `/api/availability?serviceId=${encodeURIComponent(
            selectedServiceId
          )}`
        );
        if (!res.ok) {
          throw new Error("Failed to load availability");
        }
        const data = await res.json();
        setAvailability(data.availability ?? []);
      } catch (err) {
        setAvailabilityError(
          err instanceof Error ? err.message : "Unable to load availability"
        );
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedServiceId]);

  const handleCreateBooking = async (values: BookingFormValues) => {
    try {
      if (!selectedService) return;
      setBookingLoading(true);
      setBookingError(null);
      setBookingSuccess(null);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: values.date,
          startTime: values.time,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? "Unable to create booking. Please try again."
        );
      }

      const data = await res.json();
      setBookingSuccess("Your booking is confirmed!");
      form.reset({
        date: values.date,
        time: "",
      });

      // Navigate to bookings dashboard after a short delay
      setTimeout(() => {
        router.push("/bookings");
      }, 800);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Book a Service
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a service, pick a time that works for you, and confirm your
              booking in just a few clicks.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select a service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingServices && (
                    <p className="text-sm text-muted-foreground">
                      Loading services...
                    </p>
                  )}
                  {servicesError && (
                    <p className="text-sm text-destructive">{servicesError}</p>
                  )}
                  {!loadingServices && !servicesError && services.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No services are available yet. Please check back later.
                    </p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => {
                      const isActive = service.id === selectedServiceId;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`flex flex-col rounded-xl border p-4 text-left transition-all hover:border-primary/60 hover:bg-accent/40 ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold sm:text-base">
                                {service.name}
                              </div>
                              {service.description && (
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={isActive ? "default" : "outline"}>
                              {formatPrice(
                                service.priceCents,
                                service.currency
                              )}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{service.durationMinutes} min</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Choose date & time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedService && (
                    <p className="text-sm text-muted-foreground">
                      Select a service first to see available times.
                    </p>
                  )}

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleCreateBooking)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-[1.1fr,2fr]">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  min={format(new Date(), "yyyy-MM-dd")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel>Available time slots</FormLabel>
                          <div className="mt-2">
                            {loadingAvailability && selectedService && (
                              <p className="text-sm text-muted-foreground">
                                Loading availability...
                              </p>
                            )}
                            {availabilityError && (
                              <p className="text-sm text-destructive">
                                {availabilityError}
                              </p>
                            )}
                            {!loadingAvailability &&
                              selectedService &&
                              !availabilityError &&
                              slots.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  No available slots for this date. Try another
                                  day.
                                </p>
                              )}
                            <div className="flex flex-wrap gap-2">
                              {slots.map((slot) => {
                                const isSelected =
                                  form.watch("time") === slot;
                                return (
                                  <Button
                                    key={slot}
                                    type="button"
                                    size="sm"
                                    variant={
                                      isSelected ? "default" : "outline"
                                    }
                                    onClick={() => form.setValue("time", slot)}
                                  >
                                    {slot}
                                  </Button>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </div>
                        </div>
                      </div>

                      {bookingError && (
                        <p className="text-sm text-destructive">
                          {bookingError}
                        </p>
                      )}
                      {bookingSuccess && (
                        <p className="text-sm text-emerald-600">
                          {bookingSuccess}
                        </p>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={
                            !selectedService || bookingLoading || !slots.length
                          }
                        >
                          {bookingLoading ? "Booking..." : "Confirm booking"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {selectedService ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Service
                        </span>
                        <span className="font-medium">
                          {selectedService.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">
                          {selectedDate
                            ? format(selectedDate, "EEE, MMM d yyyy")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">
                          {form.watch("time") || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                          {selectedService.durationMinutes} min
                        </span>
                      </div>
                      <div className="mt-3 border-t pt-3 flex items-center justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-lg font-semibold">
                          {formatPrice(
                            selectedService.priceCents,
                            selectedService.currency
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a service to see your booking summary.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need to manage a booking?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    You can view and cancel your upcoming appointments from your
                    bookings dashboard at any time.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => router.push("/bookings")}
                  >
                    Go to my bookings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


