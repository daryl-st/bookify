"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Edit2, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  durationMinutes: number;
  capacity: number;
};

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user: User;
  service: Service;
};

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priceCents: z.number().int().positive("Price must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  capacity: z.number().int().positive("Capacity must be positive").default(1),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

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

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "bookings">("services");

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      priceCents: 0,
      currency: "USD",
      durationMinutes: 60,
      capacity: 1,
    },
  });

  // Check auth and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to verify auth");
        }
        const data = await res.json();
        if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
      } catch (err) {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch services
  useEffect(() => {
    if (activeTab === "services" && user) {
      fetchServices();
    }
  }, [activeTab, user]);

  // Fetch bookings
  useEffect(() => {
    if (activeTab === "bookings" && user) {
      fetchBookings();
    }
  }, [activeTab, user]);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data.services ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await fetch("/api/admin/bookings");
      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCreateService = async (values: ServiceFormValues) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to create service");
      }

      const data = await res.json();
      setServices((prev) => [...prev, data.service]);
      serviceForm.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create service");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      setDeletingServiceId(id);
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to delete service");

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete service");
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      setCancellingBookingId(id);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to cancel booking");

      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: data.booking.status } : b))
      );
    } catch (err) {
      alert("Failed to cancel booking");
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
    totalRevenue: bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.service.priceCents, 0),
    totalServices: services.length,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage services and bookings
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                    <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(stats.totalRevenue, "USD")}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "services"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "bookings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bookings
            </button>
          </div>

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...serviceForm}>
                    <form
                      onSubmit={serviceForm.handleSubmit(handleCreateService)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={serviceForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Consultation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="priceCents"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (cents)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="15000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="durationMinutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="60"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={serviceForm.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={serviceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Service description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Service
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {servicesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading services...</p>
                  ) : services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{service.name}</span>
                              <Badge variant="outline">
                                {formatPrice(service.priceCents, service.currency)}
                              </Badge>
                            </div>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {service.durationMinutes} min &middot; Capacity: {service.capacity}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingServiceId === service.id}
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => {
                      const start = new Date(booking.startTime);
                      const end = new Date(booking.endTime);
                      const isCancelled = booking.status === "CANCELLED";

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{booking.service.name}</span>
                              <Badge
                                variant={
                                  isCancelled
                                    ? "destructive"
                                    : booking.status === "CONFIRMED"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {booking.status.toLowerCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.user.name || booking.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(start, "EEE, MMM d yyyy")} &middot; {format(start, "HH:mm")}{" "}
                              - {format(end, "HH:mm")} &middot;{" "}
                              {formatPrice(booking.service.priceCents, booking.service.currency)}
                            </p>
                          </div>
                          {!isCancelled && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingBookingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              {cancellingBookingId === booking.id ? "Cancelling..." : "Cancel"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

