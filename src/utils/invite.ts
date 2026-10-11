import { Platform, Share } from 'react-native';

/** Paramètre d'URL porté par les liens d'invitation : …/SwimLab/?club=<code> */
const INVITE_PARAM = 'club';

/** Adresse publique de la version web, utilisée pour construire les liens depuis le mobile. */
const PUBLIC_WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://rdddevapp.github.io/SwimLab/';

export function normalizeInviteCode(code: string): string {
  return code.trim().toLowerCase();
}

/** Code d'invitation présent dans l'URL (web uniquement), ou null. */
export function getInviteCodeFromUrl(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const code = new URLSearchParams(window.location.search).get(INVITE_PARAM);
    return code ? normalizeInviteCode(code) : null;
  } catch {
    return null;
  }
}

/** Retire le code de l'URL une fois utilisé, pour qu'un rechargement ne le rejoue pas. */
export function clearInviteCodeFromUrl(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(INVITE_PARAM)) return;
    url.searchParams.delete(INVITE_PARAM);
    window.history.replaceState(null, '', url.toString());
  } catch {
    // Sans effet : le code sera simplement ignoré une fois le club rejoint
  }
}

export function buildInviteLink(code: string): string {
  let base = PUBLIC_WEB_URL;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    base = `${window.location.origin}${window.location.pathname}`;
  }
  const url = new URL(base);
  url.searchParams.set(INVITE_PARAM, normalizeInviteCode(code));
  return url.toString();
}

/**
 * Partage un lien d'invitation : copie dans le presse-papier sur le web,
 * feuille de partage native sur mobile. Renvoie ce qui s'est passé pour
 * que l'écran affiche le bon message.
 */
export async function shareInviteLink(
  code: string,
  clubName: string,
  audience: 'nageur' | 'coach',
): Promise<'copied' | 'shared' | 'failed'> {
  const link = buildInviteLink(code);
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(link);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  try {
    const intro =
      audience === 'coach'
        ? `Rejoins l'équipe des coachs de ${clubName} sur SwimLab`
        : `Rejoins ${clubName} sur SwimLab`;
    await Share.share({ message: `${intro} : ${link}` });
    return 'shared';
  } catch {
    return 'failed';
  }
}
