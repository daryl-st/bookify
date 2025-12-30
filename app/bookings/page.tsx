"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/shared/app-header";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
};

type Booking = {
  id: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  service: Service;
};

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

function statusVariant(status: BookingStatus): "default" | "outline" | "destructive" {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "PENDING":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/bookings");
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }
        const data = await res.json();
        setBookings(data.bookings ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bookings"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [router]);

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? "Unable to cancel booking. Please try again."
        );
      }

      const data = await res.json();
      const updated = data.booking;

      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, status: updated.status } : b))
      );
    } catch (err) {
      // For now just log; could surface toast/UI later
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              My Bookings
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              View your upcoming appointments and cancel if you can no longer
              attend.
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming & past bookings</CardTitle>
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Loading your bookings...
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {!loading && !error && bookings.length === 0 && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>You don&apos;t have any bookings yet.</p>
                  <Button size="sm" onClick={() => router.push("/book")}>
                    Book your first service
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {bookings.map((booking) => {
                  const start = new Date(booking.startTime);
                  const end = new Date(booking.endTime);
                  const isCancelled = booking.status === "CANCELLED";
                  const isPast = start.getTime() < Date.now();

                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold sm:text-base">
                            {booking.service?.name ?? "Service"}
                          </span>
                          <Badge variant={statusVariant(booking.status)}>
                            {booking.status.toLowerCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground sm:text-sm">
                          <span>
                            {format(start, "EEE, MMM d yyyy")} &middot;{" "}
                            {format(start, "HH:mm")} - {format(end, "HH:mm")}
                          </span>
                          {booking.service && (
                            <span>
                              &middot;{" "}
                              {formatPrice(
                                booking.service.priceCents,
                                booking.service.currency
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCancelled && !isPast && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancel(booking.id)}
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel booking"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


