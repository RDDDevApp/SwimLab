import { Platform } from 'react-native';

/** Adresse publique de la version web, vers laquelle pointent les liens envoyés par email. */
const PUBLIC_WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://rdddevapp.github.io/SwimLab/';

/** URL de retour des emails d'authentification (réinitialisation du mot de passe). */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return PUBLIC_WEB_URL;
}

export type AuthLink =
  | { type: 'recovery'; accessToken: string; refreshToken: string }
  | { type: 'error'; message: string }
  | null;

/**
 * Lit le lien d'authentification présent dans l'URL (web), sous la forme que
 * Supabase ajoute après « # » : access_token, refresh_token, type=recovery,
 * ou error_description en cas de lien expiré. Retire ces informations de
 * l'adresse pour qu'elles ne restent ni visibles ni rejouables.
 */
export function readAuthLinkFromUrl(): AuthLink {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const clearHash = () => {
    try {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    } catch {
      // Sans effet sur la suite : les jetons sont déjà lus
    }
  };

  if (params.get('error') || params.get('error_description')) {
    clearHash();
    const expired = (params.get('error_code') || '').includes('expired');
    return {
      type: 'error',
      message: expired
        ? 'Ce lien a expiré. Redemande un email de réinitialisation.'
        : 'Ce lien n\'est pas valide. Redemande un email de réinitialisation.',
    };
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (params.get('type') === 'recovery' && accessToken && refreshToken) {
    clearHash();
    return { type: 'recovery', accessToken, refreshToken };
  }
  return null;
}
