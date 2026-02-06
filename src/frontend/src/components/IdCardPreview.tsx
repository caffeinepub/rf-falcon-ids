import { useMemo } from 'react';
import IdWatermark from './IdWatermark';
import StateSeal from './StateSeal';

interface IdCardPreviewProps {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  height: string;
  eyeColor: string;
  idNumber: string;
  state: string;
  photoUrl?: string;
}

export default function IdCardPreview({
  firstName,
  lastName,
  dob,
  gender,
  height,
  eyeColor,
  idNumber,
  state,
  photoUrl,
}: IdCardPreviewProps) {
  const displayName = useMemo(() => {
    const parts: string[] = [];
    if (firstName) parts.push(firstName);
    if (lastName) parts.push(lastName);
    return parts.join(' ') || 'NAME';
  }, [firstName, lastName]);

  return (
    <div
      id="id-card-preview"
      className="relative w-full max-w-[420px] aspect-[1.586/1] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-lg overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
    >
      <IdWatermark />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none z-20" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <StateSeal state={state} className="w-12 h-12" />
            <div>
              <div className="text-xs text-cyan-400 font-semibold tracking-wider">
                {state || 'STATE'}
              </div>
              <div className="text-[10px] text-muted-foreground">IDENTIFICATION CARD</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-400 font-mono">ID #{idNumber || '000000'}</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-4 flex-1">
          {/* Photo */}
          <div className="w-24 h-28 bg-slate-700/50 rounded border border-cyan-500/30 flex items-center justify-center overflow-hidden shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="ID Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-muted-foreground text-center px-2">PHOTO</div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-sm">
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wide">Name</div>
              <div className="font-semibold text-foreground truncate">{displayName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-wide">DOB</div>
                <div className="text-xs font-mono">{dob || 'MM/DD/YYYY'}</div>
              </div>
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-wide">Gender</div>
                <div className="text-xs">{gender || 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-wide">Height</div>
                <div className="text-xs">{height || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-wide">Eyes</div>
                <div className="text-xs">{eyeColor || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-cyan-500/20">
          <div className="text-[9px] text-muted-foreground text-center">
            ROLEPLAY IDENTIFICATION • NOT VALID FOR OFFICIAL USE
          </div>
        </div>
      </div>
    </div>
  );
}
