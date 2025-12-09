// Booking management service

import { prisma } from "@/lib/prisma";
import {
  findAvailabilityForService,
  combineDateAndTime,
  isSlotAvailable,
} from "@/lib/availability";
import { addMinutes, isBefore } from "date-fns";
import { emailService } from "./email.service";
// import { paymentService } from "./payment.service";
// import { calendarService } from "./calendar.service";
import { Booking } from "@prisma/client";

export interface CreateBookingInput {
  userId: string;
  serviceId: string;
  startTime: Date;
  paymentMethodId?: string;
}

export interface CancelBookingInput {
  bookingId: string;
  reason?: string;
  refund?: boolean;
}

export class BookingService {
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // TODO: Implement booking creation logic
    // 1. Validate service availability...DONE
    // 2. Create booking record...DONE
    // 3. Process payment if required
    // 4. Sync with calendar
    // 5. Send confirmation email
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    const requestedStart = new Date(input.startTime);
    const requestedEnd = addMinutes(requestedStart, service.durationMinutes);

    if (isBefore(requestedStart, new Date())) {
      throw new Error("START_TIME_IN_PAST");
    }

    const availability = await findAvailabilityForService(
      input.serviceId,
      requestedStart
    );
    if (!availability.length) {
      throw new Error("NO_AVAILABILITY");
    }

    const dateOnly = new Date(
      Date.UTC(
        requestedStart.getUTCFullYear(),
        requestedStart.getUTCMonth(),
        requestedStart.getUTCDate()
      )
    );

    const windowMatch = availability.find((slot) => {
      const open = combineDateAndTime(dateOnly, slot.openTime);
      const close = combineDateAndTime(dateOnly, slot.closeTime);
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
    this.triggerSideEffects(booking).catch((err) =>
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

  async checkAvailability(
    serviceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    return isSlotAvailable({ serviceId, startTime, endTime });
  }

  private async triggerSideEffects(booking: Booking) {
    try {
      // Optional: await paymentService.processPayment(...);
      // Optional: await calendarService.syncBooking(...);
      await emailService.sendBookingConfirmation(
        "customer@example.com",
        booking.id
      );
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
      if (refund) {
        // await paymentService.refundPayment(...);
      }
      // await calendarService.deleteBooking(...);
      await emailService.sendCancellationNotification(
        "customer@example.com",
        booking.id,
        reason
      );
    } catch (err) {
      console.error("Cancellation side-effect error", err);
    }
  }
}

export const bookingService = new BookingService();