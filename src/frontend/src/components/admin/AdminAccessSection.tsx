import { Shield } from 'lucide-react';
import AdminOwnerIndicator from './AdminOwnerIndicator';

export default function AdminAccessSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Admin Access Management</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        View administrator privileges and access control.
      </p>
      <AdminOwnerIndicator />
    </div>
  );
}
