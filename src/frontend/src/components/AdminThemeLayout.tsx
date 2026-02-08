import { ReactNode } from 'react';
import { useAdminTheme } from '../hooks/admin/useAdminTheme';

interface AdminThemeLayoutProps {
  children: ReactNode;
}

export default function AdminThemeLayout({ children }: AdminThemeLayoutProps) {
  const { theme } = useAdminTheme();

  return (
    <div className={`admin-theme admin-theme-${theme} relative min-h-screen bg-admin-bg text-admin-foreground`}>
      <div className="cyber-grid-bg" />
      <div className="cyber-scan-line" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
