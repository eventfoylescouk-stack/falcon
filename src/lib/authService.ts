import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SignUpResult {
  email: string;
  user: UserProfile | null;
  needsEmailConfirmation: boolean;
}

const LOCAL_PROFILES_KEY = 'falcon_auth_profiles';
const CURRENT_SESSION_KEY = 'falcon_auth_session';
const LEGACY_USERS_KEY = 'falcon_auth_users';

const EMAIL_VALIDATION_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_VALIDATION_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function getEmailRedirectTo(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.origin;
}

function isValidEmail(email: string): boolean {
  return EMAIL_VALIDATION_PATTERN.test(normalizeEmail(email));
}

function getLocalProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY) || localStorage.getItem(LEGACY_USERS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as UserProfile[]).map(({ id, fullName, phone, email, isVerified, createdAt }) => ({
      id,
      fullName,
      phone,
      email: normalizeEmail(email),
      isVerified: !!isVerified,
      createdAt
    }));
  } catch {
    return [];
  }
}

function saveLocalProfiles(profiles: UserProfile[]) {
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
  localStorage.removeItem(LEGACY_USERS_KEY);
}

function upsertLocalProfile(profile: UserProfile): UserProfile {
  const profiles = getLocalProfiles();
  const index = profiles.findIndex(existing => existing.email === profile.email);

  if (index === -1) {
    profiles.push(profile);
  } else {
    profiles[index] = { ...profiles[index], ...profile };
  }

  saveLocalProfiles(profiles);
  return profile;
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase Auth is required for sign up and sign in. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

export const authService = {
  async signUp(fullName: string, phone: string, email: string, password?: string): Promise<SignUpResult> {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      throw new Error('Email is compulsory and must be valid. Use a format like name@example.com.');
    }

    if (!password || !PASSWORD_VALIDATION_PATTERN.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }

    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Could not create your Supabase account.');
    }

    if (data.session?.user) {
      const user = await this.syncSupabaseSession(data.session);
      return { email: normalizedEmail, user, needsEmailConfirmation: false };
    }

    return { email: normalizedEmail, user: null, needsEmailConfirmation: true };
  },

  async confirmEmail(_email: string): Promise<boolean> {
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();

    if (error) {
      throw new Error(error.message || 'Could not confirm your Supabase session.');
    }

    if (data.session?.user) {
      await this.syncSupabaseSession(data.session);
      return true;
    }

    throw new Error('Email confirmation is completed from the secure link in your inbox. After clicking it, please sign in with your email and password.');
  },

  async resendCode(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      throw new Error('Enter a valid email address before requesting another confirmation email.');
    }

    const client = requireSupabase();
    const { error } = await client.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: { emailRedirectTo: getEmailRedirectTo() },
    });

    if (error) {
      throw new Error(error.message || 'Could not resend the confirmation email.');
    }
  },

  async validateCredentialsAcrossStores(email: string, password?: string) {
    const normalizedEmail = normalizeEmail(email);
    const localUser = getLocalProfiles().find(user => user.email === normalizedEmail) || null;
    let supabasePasswordMatches = false;
    let supabaseMessage = 'Supabase is not configured.';

    if (supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      supabasePasswordMatches = !error && !!data?.user;
      supabaseMessage = error?.message || 'Supabase Auth credentials accepted.';
    }

    return {
      normalizedEmail,
      localUser,
      localPasswordMatches: false,
      supabasePasswordMatches,
      supabaseMessage,
      isValid: supabasePasswordMatches,
    };
  },

  async signIn(email: string, password?: string): Promise<UserProfile> {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      const authError = new Error(
        /confirm|verified|verification/i.test(error.message)
          ? 'Please confirm your email address before signing in. Check your inbox for the Supabase confirmation link.'
          : error.message || 'Account authentication failed. Please check your credentials.'
      ) as Error & { code?: string; email?: string };
      if (/confirm|verified|verification/i.test(error.message)) {
        authError.code = 'EMAIL_NOT_CONFIRMED';
        authError.email = normalizedEmail;
      }
      throw authError;
    }

    if (!data.session?.user) {
      throw new Error('No Supabase session was returned. Please confirm your email and sign in again.');
    }

    const user = await this.syncSupabaseSession(data.session);
    if (!user) {
      throw new Error('Could not create a local student session from Supabase Auth.');
    }

    return user;
  },

  async syncSupabaseSession(session: any): Promise<UserProfile | null> {
    if (!session?.user) {
      return null;
    }

    const sbUser = session.user;
    const email = normalizeEmail(sbUser.email || '');
    if (!email) return null;

    const profile: UserProfile = {
      id: sbUser.id,
      fullName: sbUser.user_metadata?.full_name || 'Verified Student',
      phone: sbUser.user_metadata?.phone || '',
      email,
      isVerified: !!sbUser.email_confirmed_at,
      createdAt: sbUser.created_at || new Date().toISOString()
    };

    upsertLocalProfile(profile);
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  signOut() {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  },

  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(CURRENT_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
};
