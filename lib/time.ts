import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export const DEFAULT_BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "UTC";

export function toUtcFromBusinessDateTime(
  date: string,
  time: string,
  timezone: string
) {
  return fromZonedTime(`${date} ${time}:00`, timezone);
}

export function getBusinessDateParts(dateUtc: Date, timezone: string) {
  const zoned = toZonedTime(dateUtc, timezone);
  return {
    year: zoned.getFullYear(),
    month: zoned.getMonth() + 1,
    day: zoned.getDate(),
    dayOfWeek: zoned.getDay(),
    isoDate: format(zoned, "yyyy-MM-dd"),
  };
}

