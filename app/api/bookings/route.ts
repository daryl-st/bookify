import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { findAvailabilityForService, combineDateAndTime, isSlotAvailable } from "@/lib/availability";
import { NextRequest, NextResponse } from "next/server";
import { addMinutes, isBefore } from "date-fns";
import { z } from "zod";

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm"),
});

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["ADMIN", "CUSTOMER"]);
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
    const auth = requireAuth(req, ["ADMIN", "CUSTOMER"]);
    const json = await req.json();
    const body = createBookingSchema.parse(json);

    const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const date = new Date(body.date + "T00:00:00Z");
    const requestedStart = combineDateAndTime(date, body.startTime);
    const requestedEnd = addMinutes(requestedStart, service.durationMinutes);

    // Basic check: start must be in the future
    if (isBefore(requestedStart, new Date())) {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 });
    }

    const availability = await findAvailabilityForService(body.serviceId, requestedStart);
    if (!availability.length) {
      return NextResponse.json({ error: "No availability for selected date" }, { status: 400 });
    }

    const matchingAvailability = availability.find((slot) => {
      const open = combineDateAndTime(date, slot.openTime);
      const close = combineDateAndTime(date, slot.closeTime);
      const duration = slot.durationMinutes || service.durationMinutes;

      // must align with slot grid
      const minutesFromOpen = (requestedStart.getTime() - open.getTime()) / (1000 * 60);
      const aligns = minutesFromOpen >= 0 && minutesFromOpen % duration === 0;

      const withinWindow = requestedStart >= open && requestedEnd <= close;
      return aligns && withinWindow;
    });

    if (!matchingAvailability) {
      return NextResponse.json({ error: "Requested time is outside availability" }, { status: 400 });
    }

    const slotFree = await isSlotAvailable({
      serviceId: body.serviceId,
      startTime: requestedStart,
      endTime: requestedEnd,
    });

    if (!slotFree) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: auth.userId,
        serviceId: body.serviceId,
        startTime: requestedStart,
        endTime: requestedEnd,
        status: "CONFIRMED",
      },
      include: { service: true },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Booking POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

