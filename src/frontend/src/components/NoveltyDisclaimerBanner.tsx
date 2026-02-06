import { AlertTriangle } from 'lucide-react';

export default function NoveltyDisclaimerBanner() {
  return (
    <div className="bg-card border-b border-chrome-300/20 py-2 shadow-sm">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-chrome-300 flex items-center justify-center gap-2 font-medium tracking-wide">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-bold">NOVELTY USE ONLY</span>
          <span className="hidden sm:inline">—</span>
          <span className="hidden sm:inline">NOT REAL IDENTIFICATION</span>
        </p>
      </div>
    </div>
  );
}
