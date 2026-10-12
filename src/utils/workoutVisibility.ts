/**
 * Le programme d'une séance de club reste secret pour les nageurs jusqu'à la
 * fin de la séance. Même règle que get_swimmer_workout_ids (migration 020),
 * appliquée ici créneau par créneau : une séance déjà faite par le passé ne
 * doit pas dévoiler sa prochaine date.
 */
export interface SessionVisibilityInput {
  scheduledDate: string; // YYYY-MM-DD
  startTime: string | null | undefined; // HH:MM[:SS]
  durationMinutes: number | null | undefined;
  attendanceMarked: boolean;
  showBeforeSession?: boolean | null;
}

/** Fin prévue de la séance, en heure locale de l'appareil. */
export function sessionEndDate(input: Pick<SessionVisibilityInput, 'scheduledDate' | 'startTime' | 'durationMinutes'>): Date {
  const [h = '0', m = '0'] = (input.startTime || '00:00').split(':');
  const end = new Date(`${input.scheduledDate}T00:00:00`);
  end.setHours(Number(h), Number(m) + (input.durationMinutes || 0), 0, 0);
  return end;
}

export function isSessionRevealed(input: SessionVisibilityInput, now: Date = new Date()): boolean {
  if (input.showBeforeSession || input.attendanceMarked) return true;
  return sessionEndDate(input).getTime() <= now.getTime();
}

/** « 20h30 » : heure de fin, affichée comme heure de dévoilement. */
export function formatRevealTime(input: Pick<SessionVisibilityInput, 'scheduledDate' | 'startTime' | 'durationMinutes'>): string {
  const end = sessionEndDate(input);
  return `${end.getHours()}h${String(end.getMinutes()).padStart(2, '0')}`;
}
