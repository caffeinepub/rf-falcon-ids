import { ReactNode } from 'react';

interface AdminThemeLayoutProps {
  children: ReactNode;
}

export default function AdminThemeLayout({ children }: AdminThemeLayoutProps) {
  return (
    <div className="min-h-screen bg-admin-bg">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
