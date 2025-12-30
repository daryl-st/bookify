"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";

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

      if (cursor > now) {
        const label = format(cursor, "HH:mm");
        slots.push(label);
      }

      cursor = slotEnd;
    }
  }

  const unique = Array.from(new Set(slots));
  unique.sort();
  return unique;
}

export default function BookPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedServiceId) return;

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        const res = await fetch(
          `/api/availability?serviceId=${encodeURIComponent(selectedServiceId)}`
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

      setBookingSuccess("Your booking is confirmed!");
      form.reset({
        date: values.date,
        time: "",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Book a Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a service and choose your preferred time
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
            {/* Main Content */}
            <div className="space-y-4">
              {/* Service Selection */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingServices && (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  )}
                  {servicesError && (
                    <p className="text-xs text-destructive">{servicesError}</p>
                  )}
                  {!loadingServices && !servicesError && services.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No services available
                    </p>
                  )}

                  <div className="grid gap-2.5">
                    {services.map((service) => {
                      const isActive = service.id === selectedServiceId;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            form.setValue("time", "");
                          }}
                          className={`group relative flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground">
                                  {service.name}
                                </div>
                                {service.description && (
                                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={isActive ? "default" : "outline"}
                                className="shrink-0 text-xs"
                              >
                                {formatPrice(service.priceCents, service.currency)}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.durationMinutes} min
                              </span>
                            </div>
                          </div>
                          {isActive && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              {selectedService && (
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Choose Date & Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleCreateBooking)}
                        className="space-y-4"
                      >
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Date</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      type="date"
                                      min={format(new Date(), "yyyy-MM-dd")}
                                      className="pl-10"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormLabel className="text-sm">Time Slot</FormLabel>
                            <div className="mt-2">
                              {loadingAvailability && (
                                <p className="text-xs text-muted-foreground">
                                  Loading availability...
                                </p>
                              )}
                              {availabilityError && (
                                <p className="text-xs text-destructive">
                                  {availabilityError}
                                </p>
                              )}
                              {!loadingAvailability &&
                                !availabilityError &&
                                slots.length === 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    No slots available for this date
                                  </p>
                                )}
                              <div className="flex flex-wrap gap-2">
                                {slots.map((slot) => {
                                  const isSelected = form.watch("time") === slot;
                                  return (
                                    <Button
                                      key={slot}
                                      type="button"
                                      size="sm"
                                      variant={isSelected ? "default" : "outline"}
                                      className="h-8 text-xs"
                                      onClick={() => form.setValue("time", slot)}
                                    >
                                      {slot}
                                    </Button>
                                  );
                                })}
                              </div>
                              <FormMessage className="text-xs" />
                            </div>
                          </div>
                        </div>

                        {bookingError && (
                          <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                            {bookingError}
                          </div>
                        )}
                        {bookingSuccess && (
                          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {bookingSuccess}
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={
                            !selectedService || bookingLoading || !slots.length || !form.watch("time")
                          }
                        >
                          {bookingLoading ? "Confirming..." : "Confirm Booking"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {selectedService ? (
                    <>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Service</span>
                          <span className="text-sm font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Date</span>
                          <span className="text-sm font-medium">
                            {selectedDate
                              ? format(selectedDate, "MMM d, yyyy")
                              : "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Time</span>
                          <span className="text-sm font-medium">
                            {form.watch("time") || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <span className="text-sm font-medium">
                            {selectedService.durationMinutes} min
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total</span>
                          <span className="text-lg font-bold">
                            {formatPrice(selectedService.priceCents, selectedService.currency)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Select a service to see details
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
