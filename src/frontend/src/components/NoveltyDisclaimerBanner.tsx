import { Info } from 'lucide-react';

export default function NoveltyDisclaimerBanner() {
  return (
    <div className="bg-card/60 border-b border-chrome-300/10 py-2">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs sm:text-sm text-chrome-400 flex items-center justify-center gap-2 tracking-wide">
          <Info className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          <span>Not valid for official identification</span>
        </p>
      </div>
    </div>
  );
}
