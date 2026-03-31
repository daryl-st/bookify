import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookingService } from "@/services/booking.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm"),
  timezone: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["ADMIN", "CUSTOMER"]);
    const bookings = await prisma.booking.findMany({
      where: auth.role === "ADMIN" ? {} : { userId: auth.userId },
      include: { service: true },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["ADMIN", "CUSTOMER"]);
    const json = await req.json();
    const body = createBookingSchema.parse(json);

    const booking = await bookingService.createBooking({
      userId: auth.userId,
      serviceId: body.serviceId,
      date: body.date,
      startTime: body.startTime,
      timezone: body.timezone,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "START_TIME_IN_PAST") {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "NO_AVAILABILITY") {
      return NextResponse.json({ error: "No availability for selected date" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "OUTSIDE_AVAILABILITY") {
      return NextResponse.json({ error: "Requested time is outside availability" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }
    console.error("Booking POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

