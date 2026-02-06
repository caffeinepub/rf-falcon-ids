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
      className="relative w-full max-w-[420px] aspect-[1.586/1] bg-gradient-to-br from-black via-zinc-950 to-black rounded overflow-hidden border-2 border-chrome-300/30 shadow-2xl shadow-chrome-300/10"
    >
      <IdWatermark />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none z-20" />
      
      {/* Subtle metallic sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-chrome-300/5 via-transparent to-chrome-300/5 pointer-events-none" />
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <StateSeal state={state} className="w-12 h-12" />
            <div>
              <div className="text-xs text-chrome-300 font-semibold tracking-widest">
                {state || 'STATE'}
              </div>
              <div className="text-[10px] text-muted-foreground tracking-wide">IDENTIFICATION CARD</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-chrome-400 font-mono">ID #{idNumber || '000000'}</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-4 flex-1">
          {/* Photo */}
          <div className="w-24 h-28 bg-zinc-900/50 rounded border border-chrome-300/30 flex items-center justify-center overflow-hidden shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="ID Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-muted-foreground text-center px-2">PHOTO</div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-sm">
            <div>
              <div className="text-[10px] text-chrome-300 uppercase tracking-widest">Name</div>
              <div className="font-semibold text-foreground truncate">{displayName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-chrome-300 uppercase tracking-widest">DOB</div>
                <div className="text-xs font-mono">{dob || 'MM/DD/YYYY'}</div>
              </div>
              <div>
                <div className="text-[10px] text-chrome-300 uppercase tracking-widest">Gender</div>
                <div className="text-xs">{gender || 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-chrome-300 uppercase tracking-widest">Height</div>
                <div className="text-xs">{height || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] text-chrome-300 uppercase tracking-widest">Eyes</div>
                <div className="text-xs">{eyeColor || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-chrome-300/20">
          <div className="text-[9px] text-muted-foreground text-center tracking-wider">
            NOVELTY IDENTIFICATION • NOT VALID FOR OFFICIAL USE
          </div>
        </div>
      </div>
    </div>
  );
}
