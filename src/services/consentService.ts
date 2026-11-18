import { supabase } from '../config/supabase';

/** Ligne de member_consents (migration 023), visible seulement par son titulaire. */
export interface MemberConsent {
  user_id: string;
  birth_date: string | null;
  parent_email: string | null;
  parental_consent_at: string | null;
  terms_accepted_at: string | null;
  parent_notified_at: string | null;
}

export interface ConsentInput {
  birthDate: string;
  parentEmail?: string | null;
  parentalConsent?: boolean;
  termsAccepted?: boolean;
}

/** Date de naissance, accord parental et conditions acceptées de l'utilisateur connecté. */
export const consentService = {
  async getMine(userId: string): Promise<MemberConsent | null> {
    const { data, error } = await (supabase as any)
      .from('member_consents')
      .select('user_id, birth_date, parent_email, parental_consent_at, terms_accepted_at, parent_notified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as MemberConsent | null;
  },

  /** Complète les informations d'un compte créé avant la migration 023. */
  // Table absente des types générés (supabase gen types) : accès non typé, comme soloService.
  async saveMine(userId: string, input: ConsentInput): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await (supabase as any).from('member_consents').upsert(
      {
        user_id: userId,
        birth_date: input.birthDate,
        parent_email: input.parentEmail ? input.parentEmail.trim().toLowerCase() : null,
        parental_consent_at: input.parentalConsent ? now : null,
        ...(input.termsAccepted ? { terms_accepted_at: now } : {}),
        updated_at: now,
      } as any,
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  },
};
