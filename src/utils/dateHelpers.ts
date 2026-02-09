/**
 * Utilitaires de manipulation de dates pour le calendrier.
 */

/** Get Monday of the week containing the given date */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get array of 7 dates starting from Monday */
export function getWeekDates(date: Date): Date[] {
  const monday = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** Format date as YYYY-MM-DD (for DB queries) */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format date for display: "Lun 03 Fev" */
export function formatShortDate(date: Date): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = [
    'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]}`;
}

/** Format week range: "03 Fev - 09 Fev 2026" */
export function formatWeekRange(date: Date): string {
  const dates = getWeekDates(date);
  const months = [
    'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const start = dates[0];
  const end = dates[6];
  const s = `${String(start.getDate()).padStart(2, '0')} ${months[start.getMonth()]}`;
  const e = `${String(end.getDate()).padStart(2, '0')} ${months[end.getMonth()]} ${end.getFullYear()}`;
  return `${s} - ${e}`;
}

/** Check if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if a date is today */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Convert JS Date.getDay() (0=Sun) to our day_of_week used in DB.
 * DB uses 0=Sunday, 1=Monday... 6=Saturday (same as JS).
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/** Format time string "18:00:00" -> "18h00" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  return `${h}h${m}`;
}
