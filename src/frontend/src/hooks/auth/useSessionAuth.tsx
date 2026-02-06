import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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

interface SessionData {
  username: string;
  token: string;
  isAdmin: boolean;
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
        setSession(data);
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (username: string, password: string) => {
    // For now, simulate signup - in production this would call backend
    // Backend should hash password and store user
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Store in localStorage as a simple user database
    const users = JSON.parse(localStorage.getItem('rf_falcon_users') || '{}');
    
    if (users[username]) {
      throw new Error('Username already exists');
    }

    // Simple hash simulation (in production, backend would handle this securely)
    users[username] = {
      password: btoa(password), // Base64 encoding (NOT secure, just for demo)
      isAdmin: username === 'admin', // First user or 'admin' username gets admin
    };
    
    localStorage.setItem('rf_falcon_users', JSON.stringify(users));
  };

  const signIn = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem('rf_falcon_users') || '{}');
    const user = users[username];

    if (!user || user.password !== btoa(password)) {
      throw new Error('Invalid username or password');
    }

    // Create session
    const sessionData: SessionData = {
      username,
      token: `token_${username}_${Date.now()}`,
      isAdmin: user.isAdmin || false,
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
