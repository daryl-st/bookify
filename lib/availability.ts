import { prisma } from "@/lib/prisma";
import { addDays, addMinutes, isBefore, isEqual } from "date-fns";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  getBusinessDateParts,
  toUtcFromBusinessDateTime,
} from "./time";

export function combineDateAndTime(
  date: Date,
  time: string,
  timezone = DEFAULT_BUSINESS_TIMEZONE
) {
  const parts = getBusinessDateParts(date, timezone);
  const dateString = `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
  return toUtcFromBusinessDateTime(dateString, time, timezone);
}

export function slotsFromAvailability(params: {
  date: Date;
  openTime: string;
  closeTime: string;
  durationMinutes: number;
}) {
  const { date, openTime, closeTime, durationMinutes } = params;
  const start = combineDateAndTime(date, openTime);
  const end = combineDateAndTime(date, closeTime);

  const slots: Array<{ start: Date; end: Date }> = [];
  let cursor = start;

  while (isBefore(addMinutes(cursor, durationMinutes), end) || isEqual(addMinutes(cursor, durationMinutes), end)) {
    const slotEnd = addMinutes(cursor, durationMinutes);
    slots.push({ start: cursor, end: slotEnd });
    cursor = slotEnd;
  }

  return slots;
}

export async function findAvailabilityForService(
  serviceId: string,
  date: Date,
  timezone = DEFAULT_BUSINESS_TIMEZONE
) {
  const businessDate = getBusinessDateParts(date, timezone);
  const dayStart = toUtcFromBusinessDateTime(
    businessDate.isoDate,
    "00:00",
    timezone
  );
  const nextDayParts = getBusinessDateParts(addDays(dayStart, 1), timezone);
  const nextDay = toUtcFromBusinessDateTime(
    nextDayParts.isoDate,
    "00:00",
    timezone
  );
  const dayOfWeek = businessDate.dayOfWeek; // 0-6, Sunday=0

  const availabilities = await prisma.availability.findMany({
    where: {
      serviceId,
      OR: [
        {
          date: {
            gte: dayStart,
            lt: nextDay,
          },
        },
        { dayOfWeek },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return availabilities;
}

export async function isSlotAvailable(params: {
  serviceId: string;
  startTime: Date;
  endTime: Date;
  capacity?: number;
}) {
  const { serviceId, startTime, endTime, capacity = 1 } = params;

  const overlappingCount = await prisma.booking.count({
    where: {
      serviceId,
      status: { not: "CANCELLED" },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  return overlappingCount < capacity;
}

