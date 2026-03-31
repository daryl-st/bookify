// Booking management service

import { prisma } from "@/lib/prisma";
import {
  findAvailabilityForService,
  combineDateAndTime,
  isSlotAvailable,
} from "@/lib/availability";
import { addMinutes, isBefore } from "date-fns";
import { DEFAULT_BUSINESS_TIMEZONE, toUtcFromBusinessDateTime } from "@/lib/time";
import { emailService } from "./email.service";
// import { paymentService } from "./payment.service";
// import { calendarService } from "./calendar.service";
import { Booking } from "@prisma/client";

export interface CreateBookingInput {
  userId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD in business timezone
  startTime: string; // HH:mm in business timezone
  timezone?: string;
  paymentMethodId?: string;
}

export interface CancelBookingInput {
  bookingId: string;
  reason?: string;
  refund?: boolean;
}

export class BookingService {
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    const bookingTimezone =
      service.timezone || input.timezone || DEFAULT_BUSINESS_TIMEZONE;
    const requestedStart = toUtcFromBusinessDateTime(
      input.date,
      input.startTime,
      bookingTimezone
    );
    const requestedEnd = addMinutes(requestedStart, service.durationMinutes);

    if (isBefore(requestedStart, new Date())) {
      throw new Error("START_TIME_IN_PAST");
    }

    const availability = await findAvailabilityForService(
      input.serviceId,
      requestedStart,
      bookingTimezone
    );
    if (!availability.length) {
      throw new Error("NO_AVAILABILITY");
    }

    const windowMatch = availability.find((slot: { openTime: string; closeTime: string; durationMinutes: number }) => {
      const open = combineDateAndTime(requestedStart, slot.openTime, bookingTimezone);
      const close = combineDateAndTime(requestedStart, slot.closeTime, bookingTimezone);
      const duration = slot.durationMinutes || service.durationMinutes;
      const minutesFromOpen = (requestedStart.getTime() - open.getTime()) / 60000;
      const aligns = minutesFromOpen >= 0 && minutesFromOpen % duration === 0;
      const withinWindow = requestedStart >= open && requestedEnd <= close;
      return aligns && withinWindow;
    });

    if (!windowMatch) {
      throw new Error("OUTSIDE_AVAILABILITY");
    }

    const slotFree = await isSlotAvailable({
      serviceId: input.serviceId,
      startTime: requestedStart,
      endTime: requestedEnd,
      capacity: service.capacity,
    });

    if (!slotFree) {
      throw new Error("SLOT_UNAVAILABLE");
    }

    const booking = await prisma.booking.create({
      data: {
        userId: input.userId,
        serviceId: input.serviceId,
        startTime: requestedStart,
        endTime: requestedEnd,
        status: "CONFIRMED",
      },
    });

    // Fire-and-forget side effects
    this.triggerSideEffects(booking, input.userId).catch((err) =>
      console.error("Booking side-effects failed", err)
    );

    return booking;
  }


  async cancelBooking(input: CancelBookingInput): Promise<Booking> {
    // TODO: Implement cancellation logic
    // 1. Update booking status...DONE
    // 2. Process refund if applicable
    // 3. Remove from calendar
    // 4. Send cancellation notification
    // 5. Handle waitlist if applicable
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
    });
    if (!booking) {
      throw new Error("BOOKING_NOT_FOUND");
    }

    const updated = await prisma.booking.update({
      where: { id: input.bookingId },
      data: { status: "CANCELLED" },
    });

    this.triggerCancellationSideEffects(updated, input.reason, input.refund).catch(
      (err) => console.error("Cancellation side-effects failed", err)
    );

    return updated;
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { id: bookingId } });
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    });
  }

  private async triggerSideEffects(booking: Booking, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      // Optional: await paymentService.processPayment(...);
      // Optional: await calendarService.syncBooking(...);
      if (user?.email) {
        await emailService.sendBookingConfirmation(user.email, booking.id);
      }
    } catch (err) {
      console.error("Side-effect error", err);
    }
  }

  private async triggerCancellationSideEffects(
    booking: Booking,
    reason?: string,
    refund?: boolean
  ) {
    try {
      const existing = await prisma.booking.findUnique({
        where: { id: booking.id },
        select: { user: { select: { email: true } } },
      });
      if (refund) {
        // await paymentService.refundPayment(...);
      }
      // await calendarService.deleteBooking(...);
      if (existing?.user.email) {
        await emailService.sendCancellationNotification(
          existing.user.email,
          booking.id,
          reason
        );
      }
    } catch (err) {
      console.error("Cancellation side-effect error", err);
    }
  }
}

export const bookingService = new BookingService();