import { getStateSealPath } from '../utils/stateSeals';
import { Shield } from 'lucide-react';

interface StateSealProps {
  state: string;
  className?: string;
}

export default function StateSeal({ state, className = 'w-12 h-12' }: StateSealProps) {
  const sealPath = getStateSealPath(state);

  if (!sealPath) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-700/50 rounded-full border border-cyan-500/30`} aria-label={`${state || 'State'} seal placeholder`}>
        <Shield className="w-1/2 h-1/2 text-cyan-400/50" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={sealPath}
      alt={`${state} state seal`}
      className={`${className} object-contain`}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}
