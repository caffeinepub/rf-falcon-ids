import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInternetIdentity } from '../useInternetIdentity';

export type AdminTheme = 'goth-black' | 'silver-steel' | 'white-luxury' | 'deep-purple' | 'fire-red';

const ADMIN_THEMES: AdminTheme[] = ['goth-black', 'silver-steel', 'white-luxury', 'deep-purple', 'fire-red'];

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  availableThemes: AdminTheme[];
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const [theme, setThemeState] = useState<AdminTheme>('goth-black');

  const storageKey = identity ? `adminTheme_${identity.getPrincipal().toString()}` : null;

  // Load theme from localStorage on mount or identity change
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved && ADMIN_THEMES.includes(saved as AdminTheme)) {
        setThemeState(saved as AdminTheme);
      }
    }
  }, [storageKey]);

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    if (storageKey) {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, availableThemes: ADMIN_THEMES }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminThemeContext() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminThemeContext must be used within AdminThemeProvider');
  }
  return context;
}
