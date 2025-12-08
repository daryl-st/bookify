import { prisma } from "@/lib/prisma";
import { addMinutes, isBefore, isEqual, set } from "date-fns";

export function combineDateAndTime(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
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

export async function findAvailabilityForService(serviceId: string, date: Date) {
  const dayStart = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const nextDay = addMinutes(dayStart, 60 * 24);
  const dayOfWeek = dayStart.getDay(); // 0-6, Sunday=0

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
}) {
  const { serviceId, startTime, endTime } = params;

  const overlapping = await prisma.booking.findFirst({
    where: {
      serviceId,
      status: { not: "CANCELLED" },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  return !overlapping;
}

