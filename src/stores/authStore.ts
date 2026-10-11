import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { queryClient } from '../config/queryClient';
import { Profile } from '../types/database.types';
import { getAuthRedirectUrl, readAuthLinkFromUrl } from '../utils/authLink';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  clubId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  /** Ouvert depuis le lien « mot de passe oublié » : l'app demande un nouveau mot de passe */
  isPasswordRecovery: boolean;
  /** Lien d'authentification expiré ou invalide, affiché sur l'écran de connexion */
  authLinkError: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setClubId: (clubId: string | null) => void;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  clearAuthLinkError: () => void;
  fetchProfile: () => Promise<void>;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  role: 'coach' | 'swimmer';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  clubId: null,
  isLoading: true,
  isInitialized: false,
  isPasswordRecovery: false,
  authLinkError: null,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setClubId: (clubId) => {
    set({ clubId });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Lien reçu par email (mot de passe oublié) : ouvre une session de récupération
      const authLink = readAuthLinkFromUrl();
      if (authLink?.type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: authLink.accessToken,
          refresh_token: authLink.refreshToken,
        });
        if (error) {
          set({ authLinkError: 'Ce lien a expiré. Redemande un email de réinitialisation.' });
        } else {
          set({ isPasswordRecovery: true });
        }
      } else if (authLink?.type === 'error') {
        set({ authLinkError: authLink.message });
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null
      });

      // If we have a session, fetch the profile
      if (session?.user) {
        await get().fetchProfile();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({
          session,
          user: session?.user ?? null
        });

        if (event === 'SIGNED_IN' && session?.user) {
          await get().fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          set({ profile: null });
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        },
      });

      if (error) throw error;

      // Create profile manually (in case trigger doesn't work)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      // Sans ca, le compte suivant verrait un instant les donnees en cache du precedent
      queryClient.clear();
      set({ session: null, user: null, profile: null, clubId: null });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  requestPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    return { error: error ? (error as Error) : null };
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) set({ isPasswordRecovery: false });
    return { error: error ? (error as Error) : null };
  },

  deleteAccount: async () => {
    const { error } = await supabase.rpc('delete_my_account' as never);
    if (error) return { error: new Error(error.message) };
    // Le compte n'existe plus côté serveur : on vide seulement la session locale
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    queryClient.clear();
    set({ session: null, user: null, profile: null, clubId: null });
    return { error: null };
  },

  clearAuthLinkError: () => set({ authLinkError: null }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  },
}));
