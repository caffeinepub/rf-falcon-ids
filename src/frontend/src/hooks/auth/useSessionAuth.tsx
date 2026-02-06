import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { normalizeUsername, isFixedAdminUsername } from '@/utils/username';

interface SessionAuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const SessionAuthContext = createContext<SessionAuthContextType | null>(null);

const SESSION_STORAGE_KEY = 'rf_falcon_session';
const USERS_STORAGE_KEY = 'rf_falcon_users';

interface SessionData {
  username: string;
  token: string;
  isAdmin: boolean;
}

interface UserRecord {
  password: string;
  isAdmin?: boolean; // Stored but ignored; admin is derived from username
}

export function SessionAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as SessionData;
        // Recompute isAdmin from username, ignoring stored value
        const correctedSession: SessionData = {
          ...data,
          isAdmin: isFixedAdminUsername(data.username),
        };
        setSession(correctedSession);
        // Optionally rewrite to localStorage to fix any stale data
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(correctedSession));
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const normalizedUsername = normalizeUsername(username);

    // Store in localStorage as a simple user database
    const users: Record<string, UserRecord> = JSON.parse(
      localStorage.getItem(USERS_STORAGE_KEY) || '{}'
    );
    
    if (users[normalizedUsername]) {
      throw new Error('Username already exists');
    }

    // Simple hash simulation (in production, backend would handle this securely)
    users[normalizedUsername] = {
      password: btoa(password), // Base64 encoding (NOT secure, just for demo)
    };
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const signIn = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const normalizedUsername = normalizeUsername(username);

    // Retrieve users from localStorage
    const users: Record<string, UserRecord> = JSON.parse(
      localStorage.getItem(USERS_STORAGE_KEY) || '{}'
    );
    const user = users[normalizedUsername];

    if (!user || user.password !== btoa(password)) {
      throw new Error('Invalid username or password');
    }

    // Create session with admin derived solely from username
    const sessionData: SessionData = {
      username: normalizedUsername,
      token: `token_${normalizedUsername}_${Date.now()}`,
      isAdmin: isFixedAdminUsername(normalizedUsername),
    };

    setSession(sessionData);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  };

  const signOut = async () => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <SessionAuthContext.Provider
      value={{
        isAuthenticated: !!session,
        username: session?.username || null,
        isAdmin: session?.isAdmin || false,
        signIn,
        signUp,
        signOut,
        isLoading,
      }}
    >
      {children}
    </SessionAuthContext.Provider>
  );
}

export function useSessionAuth() {
  const context = useContext(SessionAuthContext);
  if (!context) {
    throw new Error('useSessionAuth must be used within SessionAuthProvider');
  }
  return context;
}
