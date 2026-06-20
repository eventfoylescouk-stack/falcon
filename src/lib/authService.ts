import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  passwordHash?: string; // Hashed password for local storage
}

// Simulated mock database of users for local preview / testing
const LOCAL_USERS_KEY = 'falcon_auth_users';
const CURRENT_SESSION_KEY = 'falcon_auth_session';

function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      // No default users - users must sign up
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
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

const EMAIL_VALIDATION_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_VALIDATION_PATTERN.test(email.trim().toLowerCase());
}

export const authService = {
  /**
   * Register a new user profile.
   */
  async signUp(fullName: string, phone: string, email: string, password?: string) {
    if (!email || !isValidEmail(email)) {
      throw new Error('Email is compulsory and must be valid. Use a format like name@example.com.');
    }
    
    // Strengthened password requirements: at least 8 characters, with uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check for duplicate emails first before any account generation flows
    const users = getLocalUsers();
    const exists = users.some(u => u.email === normalizedEmail);
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    // 2. Production Supabase flow (if enabled, process it in background or try it)
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

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserProfile = {
      id: supabaseUserId || 'usr_' + Math.random().toString(36).substr(2, 9),
      fullName,
      phone,
      email: normalizedEmail,
      isVerified: true, // Instantly verified to remove confirmation requirements
      createdAt: new Date().toISOString(),
      passwordHash
    };

    users.push(newUser);
    saveLocalUsers(users);

    // Auto-login the active local user (without password)
    const sessionUser: UserProfile = {
      ...newUser,
      passwordHash: undefined // Don't store hash in session
    };
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionUser));

    console.log(`[Falcon Dev Mode] User signed up & auto-logged in instantly: ${normalizedEmail}`);

    return sessionUser;
  },

  /**
   * Confirm the email address using the supplied verification code.
   */
  async confirmEmail(email: string, code: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const expected = activeVerificationCodes[normalizedEmail];

    if (code === expected) {
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
   * Explicitly validate credentials against Supabase Auth (when configured) and the local users table.
   */
  async validateCredentialsAcrossStores(email: string, password?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const users = getLocalUsers();
    const localUser = users.find(u => u.email === normalizedEmail);
    
    // Verify password using bcrypt
    let localPasswordMatches = false;
    if (localUser && password && localUser.passwordHash) {
      localPasswordMatches = await bcrypt.compare(password, localUser.passwordHash);
    }

    let supabasePasswordMatches = false;
    let supabaseMessage = 'Supabase is not configured.';

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password || '',
        });
        supabasePasswordMatches = !error && !!data?.user;
        supabaseMessage = error?.message || 'Supabase Auth credentials accepted.';
      } catch (err: any) {
        supabaseMessage = err?.message || 'Supabase Auth check failed.';
      }
    }

    return {
      normalizedEmail,
      localUser,
      localPasswordMatches,
      supabasePasswordMatches,
      supabaseMessage,
      isValid: localPasswordMatches || supabasePasswordMatches,
    };
  },

  /**
   * Sign In an existing user.
   * If they are not verified, throws a custom verification-required error.
   */
  async signIn(email: string, password?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const validation = await this.validateCredentialsAcrossStores(normalizedEmail, password);
    let user = validation.localUser;

    if (!validation.isValid) {
      console.warn('Credential validation failed across Supabase Auth and local users table:', validation.supabaseMessage);
      throw new Error('Incorrect password. Please verify your Supabase Auth and local profile credentials.');
    }

    if (!user && validation.supabasePasswordMatches && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || '',
      });
      if (!error && data?.user) {
        const sbUser = data.user;
        // Hash password for local storage
        const passwordHash = await bcrypt.hash(password || '', 10);
        user = {
          id: sbUser.id || 'usr_' + Math.random().toString(36).substr(2, 9),
          fullName: sbUser.user_metadata?.full_name || 'Verified Student',
          phone: sbUser.user_metadata?.phone || '',
          email: normalizedEmail,
          isVerified: true,
          createdAt: new Date().toISOString(),
          passwordHash
        };
        const users = getLocalUsers();
        users.push(user);
        saveLocalUsers(users);
      }
    }

    if (!user) {
      throw new Error('No registered local profile found for this email. Please sign up first so your student record can be linked.');
    }

    if (!user.isVerified) {
      // Throw a specific block indicator so the UI redirects them to verification page
      const error = new Error('Verification required') as any;
      error.code = 'EMAIL_NOT_CONFIRMED';
      error.email = normalizedEmail;
      throw error;
    }

    // Login successful - don't store password hash in session
    const sessionUser: UserProfile = {
      ...user,
      passwordHash: undefined
    };
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
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
