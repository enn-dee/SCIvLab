const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const getTestWeek = (request) => {
  if (process.env.NODE_ENV === "production") return null;
  const week = Number(request.get("X-SCIVLab-Test-Week"));
  return Number.isInteger(week) && week >= 1 ? week : null;
};

export const getPracticalWeekState = (
  practical,
  enrolledAt,
  now = new Date(),
  testWeek = null,
) => {
  if (!enrolledAt) return null;

  const weekNumber = Math.max(1, Number(practical.order) || 1);
  const elapsedWeeks = Math.floor(
    Math.max(0, now.getTime() - new Date(enrolledAt).getTime()) / WEEK_MS,
  );
  const currentWeek = testWeek || elapsedWeeks + 1;

  return {
    weekNumber,
    currentWeek,
    status:
      weekNumber > currentWeek
        ? "upcoming"
        : weekNumber === currentWeek
          ? "current"
          : "locked",
    unlocksAt: new Date(new Date(enrolledAt).getTime() + (weekNumber - 1) * WEEK_MS),
    locksAt: new Date(new Date(enrolledAt).getTime() + weekNumber * WEEK_MS),
  };
};

export const isPracticalWeekOpen = (
  practical,
  enrolledAt,
  now = new Date(),
  testWeek = null,
) =>
  getPracticalWeekState(practical, enrolledAt, now, testWeek)?.status ===
  "current";
