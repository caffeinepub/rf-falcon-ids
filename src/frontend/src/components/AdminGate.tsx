import { type ReactNode } from 'react';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { ShieldAlert } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse text-cyan-400">Verifying permissions...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <ShieldAlert className="w-20 h-20 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have administrator privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
