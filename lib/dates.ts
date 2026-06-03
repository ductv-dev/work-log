import { endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function startOfCurrentWeekISO() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function endOfCurrentWeekISO() {
  return format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function startOfCurrentMonthISO() {
  return format(startOfMonth(new Date()), "yyyy-MM-dd");
}

export function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
