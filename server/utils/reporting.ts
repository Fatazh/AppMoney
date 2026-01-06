const clampDay = (year: number, monthIndex: number, day: number) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, day), daysInMonth);
};

export const normalizeStartDay = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 1;
  return Math.min(31, Math.max(1, Math.floor(num)));
};

export const getReportingRangeForMonth = (
  year: number,
  monthIndex: number,
  startDay: number
) => {
  const safeStartDay = normalizeStartDay(startDay);
  const start = new Date(year, monthIndex, clampDay(year, monthIndex, safeStartDay));
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const end = new Date(nextYear, nextMonthIndex, clampDay(nextYear, nextMonthIndex, safeStartDay));
  return { start, end };
};

export const getReportingRangeForDate = (date: Date, startDay: number) => {
  const safeStartDay = normalizeStartDay(startDay);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const startDayThisMonth = clampDay(year, monthIndex, safeStartDay);

  let startYear = year;
  let startMonth = monthIndex;

  if (day < startDayThisMonth) {
    if (monthIndex === 0) {
      startYear = year - 1;
      startMonth = 11;
    } else {
      startMonth = monthIndex - 1;
    }
  }

  return getReportingRangeForMonth(startYear, startMonth, safeStartDay);
};
