import { AlertTriangle } from 'lucide-react';

export default function RoleplayDisclaimerBanner() {
  return (
    <div className="bg-purple-900/30 border-b border-purple-500/30 py-2">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-purple-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">ROLEPLAY USE ONLY</span>
          <span className="hidden sm:inline">—</span>
          <span className="hidden sm:inline">NOT REAL IDENTIFICATION</span>
        </p>
      </div>
    </div>
  );
}
