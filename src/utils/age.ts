/** Âge en dessous duquel un parent doit donner son accord (France : 15 ans). */
export const PARENTAL_CONSENT_AGE = 15;

/**
 * Lit une date saisie au format JJ/MM/AAAA (séparateurs / . - ou espace) et la
 * renvoie au format AAAA-MM-JJ, ou null si elle est invalide, dans le futur ou
 * avant 1900.
 */
export function parseBirthDate(input: string, today: Date = new Date()): string | null {
  const m = input.trim().match(/^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null; // 31/02, 00/05…
  }
  if (year < 1900) return null;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (iso > toIsoDay(today)) return null;
  return iso;
}

/** Âge révolu (en années) le jour donné, pour une date AAAA-MM-JJ. */
export function ageOn(birthIso: string, today: Date = new Date()): number {
  const [y, m, d] = birthIso.split('-').map(Number);
  const t = { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  let age = t.y - y;
  if (t.m < m || (t.m === m && t.d < d)) age -= 1;
  return age;
}

/** Vrai si la personne a moins de 15 ans : l'accord d'un parent est obligatoire. */
export function needsParentalConsent(birthIso: string, today: Date = new Date()): boolean {
  return ageOn(birthIso, today) < PARENTAL_CONSENT_AGE;
}

/** AAAA-MM-JJ -> JJ/MM/AAAA, pour l'affichage. */
export function formatBirthDate(birthIso: string): string {
  const [y, m, d] = birthIso.split('-');
  return `${d}/${m}/${y}`;
}

function toIsoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
