import { Shield } from 'lucide-react';
import AdminUnavailableSection from './AdminUnavailableSection';

export default function TreyCSecuritySection() {
  return (
    <AdminUnavailableSection
      title="Security Dashboard"
      description="Monitor and manage system security settings."
      icon={<Shield className="w-5 h-5 text-admin-primary" />}
    />
  );
}
