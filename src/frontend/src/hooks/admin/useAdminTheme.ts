import { useAdminThemeContext } from './AdminThemeProvider';

export type AdminTheme = 'goth-black' | 'silver-steel' | 'white-luxury' | 'deep-purple' | 'fire-red';

export function useAdminTheme() {
  return useAdminThemeContext();
}
