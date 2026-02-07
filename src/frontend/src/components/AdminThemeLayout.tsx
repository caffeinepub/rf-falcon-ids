import { type ReactNode } from 'react';

interface AdminThemeLayoutProps {
  children: ReactNode;
}

export default function AdminThemeLayout({ children }: AdminThemeLayoutProps) {
  return (
    <div className="admin-theme min-h-screen">
      <div className="cyber-grid-bg" />
      <div className="cyber-scan-line" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
