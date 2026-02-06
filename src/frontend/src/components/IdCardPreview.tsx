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

  const displayIdNumber = idNumber || '00000000';

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
              <div className="text-chrome-300 text-xs font-semibold tracking-widest">
                {state || 'STATE'}
              </div>
              <div className="text-chrome-400 text-[10px] tracking-wider">
                IDENTIFICATION
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 flex-1">
          {/* Photo */}
          <div className="w-24 h-28 bg-zinc-900 border border-chrome-300/20 rounded flex items-center justify-center overflow-hidden shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="ID Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-chrome-400/30 text-xs text-center px-2">
                PHOTO
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-xs">
            <div>
              <div className="text-chrome-400 text-[9px] tracking-wider">NAME</div>
              <div className="text-chrome-300 font-semibold tracking-wide truncate">
                {displayName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-chrome-400 text-[9px] tracking-wider">DOB</div>
                <div className="text-chrome-300 text-[11px]">{dob || 'MM/DD/YYYY'}</div>
              </div>
              <div>
                <div className="text-chrome-400 text-[9px] tracking-wider">SEX</div>
                <div className="text-chrome-300 text-[11px]">{gender || 'X'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-chrome-400 text-[9px] tracking-wider">HGT</div>
                <div className="text-chrome-300 text-[11px]">{height || "0'0\""}</div>
              </div>
              <div>
                <div className="text-chrome-400 text-[9px] tracking-wider">EYES</div>
                <div className="text-chrome-300 text-[11px]">{eyeColor || 'XXX'}</div>
              </div>
            </div>

            <div>
              <div className="text-chrome-400 text-[9px] tracking-wider">ID NUMBER</div>
              <div className="text-chrome-300 text-[11px] font-mono tracking-wider">
                {displayIdNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-chrome-300/10">
          <div className="text-chrome-400/60 text-[8px] tracking-widest text-center">
            NOVELTY IDENTIFICATION • NOT VALID FOR OFFICIAL USE
          </div>
        </div>
      </div>
    </div>
  );
}
