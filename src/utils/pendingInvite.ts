import type { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { clubService } from '../services';
import { clearInviteCodeFromUrl, getInviteCodeFromUrl, normalizeInviteCode } from './invite';

export type PendingInviteResult =
  | { status: 'joined'; clubId: string; clubName: string }
  | { status: 'failed'; message: string }
  | null;

/**
 * Rejoint le club d'un code en attente, pour un utilisateur qui n'a pas encore
 * de club. Le code vient du lien d'invitation ouvert (URL) ou de l'inscription
 * (métadonnée pending_club_code), qui survit à la confirmation par email.
 * Le code est consommé dans tous les cas, pour ne pas le rejouer.
 */
export async function consumePendingInvite(
  user: User,
  role: 'coach' | 'swimmer',
): Promise<PendingInviteResult> {
  const signupCode =
    typeof user.user_metadata?.pending_club_code === 'string' ? user.user_metadata.pending_club_code : null;
  const code = getInviteCodeFromUrl() ?? (signupCode ? normalizeInviteCode(signupCode) : null);
  if (!code) return null;

  try {
    const { club } = await clubService.joinByCode(code, user.id, role);
    return { status: 'joined', clubId: club.id, clubName: club.name };
  } catch (err: any) {
    return {
      status: 'failed',
      message: err?.message || "Le code d'invitation n'a pas pu être utilisé.",
    };
  } finally {
    clearInviteCodeFromUrl();
    if (signupCode) {
      await supabase.auth.updateUser({ data: { pending_club_code: null } }).catch(() => {});
    }
  }
}
