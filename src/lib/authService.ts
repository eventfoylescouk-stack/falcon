import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  password?: string; // For simulation match
}

// Simulated mock database of users for local preview / testing
const LOCAL_USERS_KEY = 'falcon_auth_users';
const CURRENT_SESSION_KEY = 'falcon_auth_session';

function getLocalUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Generate a random 6-digit confirmation code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Temporary confirmation codes storage
const activeVerificationCodes: Record<string, string> = {};

export const authService = {
  /**
   * Register a new user profile.
   */
  async signUp(fullName: string, phone: string, email: string, password?: string) {
    if (!email || !email.includes('@')) {
      throw new Error('Email is compulsory and must be valid.');
    }
    if (!password || password.trim().length < 6) {
      throw new Error('Password is required and must be at least 6 characters.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Production Supabase flow (if enabled, process it in background or try it)
    let supabaseUserId = undefined;
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (!error && data.user) {
          supabaseUserId = data.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase Sign Up attempted but warning generated:', err.message);
      }
    }

    // 2. Offline / Local Fallback flow
    const users = getLocalUsers();
    const exists = users.some(u => u.email === normalizedEmail);
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserProfile = {
      id: supabaseUserId || 'usr_' + Math.random().toString(36).substr(2, 9),
      fullName,
      phone,
      email: normalizedEmail,
      isVerified: true, // Instantly verified to remove confirmation requirements
      createdAt: new Date().toISOString(),
      password: password
    };

    users.push(newUser);
    saveLocalUsers(users);

    // Auto-login the active local user
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));

    console.log(`[Falcon Dev Mode] User signed up & auto-logged in instantly: ${normalizedEmail}`);

    return {
      email: normalizedEmail,
      requiresVerification: false,
      user: newUser
    };
  },

  /**
   * Confirm the email address using the supplied verification code.
   */
  async confirmEmail(email: string, code: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const expected = activeVerificationCodes[normalizedEmail];

    // For local convenience, we also allow '123456' as a universal testing bypass code
    if (code === expected || code === '123456' || code.trim() === '123456') {
      
      // Update local storage DB status to verified
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.email === normalizedEmail);
      if (idx !== -1) {
        users[idx].isVerified = true;
        saveLocalUsers(users);
      }

      delete activeVerificationCodes[normalizedEmail];
      return true;
    }

    throw new Error('Invalid verification code. Please check and try again.');
  },

  /**
   * Resend the email confirmation code
   */
  resendCode(email: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    const code = generateVerificationCode();
    activeVerificationCodes[normalizedEmail] = code;
    console.log(`[Falcon Dev Mode] Resent verification code to ${normalizedEmail}: ${code}`);
    return code;
  },

  /**
   * Sign In an existing user.
   * If they are not verified, throws a custom verification-required error.
   */
  async signIn(email: string, password?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Supabase validation if active
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password || '',
        });
        if (error) {
          console.warn("Supabase auth check failed, using local profile state", error.message);
        }
      } catch (err: any) {
        console.warn("Supabase connection failed, checking local fallback status", err);
      }
    }

    // 2. Fetch profile from local directory
    const users = getLocalUsers();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      throw new Error('No registered account found with this email in Wuye, Abuja records. Please sign up first.');
    }

    // Checking password
    if (password && user.password && user.password !== password) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    if (!user.isVerified) {
      // Throw a specific block indicator so the UI redirects them to verification page
      const error = new Error('Verification required') as any;
      error.code = 'EMAIL_NOT_CONFIRMED';
      error.email = normalizedEmail;
      throw error;
    }

    // Login successful
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Sync active Supabase session to local user profile and log them in.
   */
  async syncSupabaseSession(session: any): Promise<UserProfile | null> {
    if (!session || !session.user) {
      return null;
    }
    const sbUser = session.user;
    const email = (sbUser.email || '').toLowerCase().trim();
    const fullName = sbUser.user_metadata?.full_name || 'Verified Student';
    const phone = sbUser.user_metadata?.phone || '';

    const users = getLocalUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: sbUser.id || 'usr_' + Math.random().toString(36).substr(2, 9),
        fullName,
        phone,
        email,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      users.push(user);
    } else {
      user.isVerified = true;
      if (fullName && fullName !== 'Verified Student') {
        user.fullName = fullName;
      }
      if (phone) {
        user.phone = phone;
      }
    }
    saveLocalUsers(users);
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Log out current user
   */
  signOut() {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  },

  /**
   * Retrieves current authenticated user profile
   */
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(CURRENT_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
};
