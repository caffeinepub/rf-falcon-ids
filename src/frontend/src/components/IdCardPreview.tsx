import { useMemo } from 'react';
import StateSeal from './StateSeal';
import { formatDOB } from '../utils/dob';

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
  const displayDOB = formatDOB(dob) || 'MM/DD/YYYY';

  return (
    <div
      id="id-card-preview"
      className="relative w-full max-w-[420px] aspect-[1.586/1] bg-gradient-to-br from-black via-zinc-950 to-black rounded overflow-hidden border-2 border-chrome-300/30 shadow-2xl shadow-chrome-300/10"
      role="img"
      aria-label={`ID card preview for ${displayName}`}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none z-20" aria-hidden="true" />
      
      {/* Subtle metallic sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-chrome-300/5 via-transparent to-chrome-300/5 pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <StateSeal state={state} className="w-10 h-10 sm:w-12 sm:h-12" />
            <div>
              <div className="text-chrome-300 text-[10px] sm:text-xs font-semibold tracking-widest">
                {state || 'STATE'}
              </div>
              <div className="text-chrome-400 text-[8px] sm:text-[10px] tracking-wider">
                IDENTIFICATION
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-3 sm:gap-4 flex-1">
          {/* Photo */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 bg-zinc-900 border border-chrome-300/20 rounded flex items-center justify-center overflow-hidden shrink-0">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={`ID photo of ${displayName}`}
                className="w-full h-full object-cover"
                decoding="async"
              />
            ) : (
              <div className="text-chrome-400/30 text-[10px] sm:text-xs text-center px-2" aria-label="No photo uploaded">
                PHOTO
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs min-w-0">
            <div>
              <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">NAME</div>
              <div className="text-chrome-300 font-semibold tracking-wide truncate">
                {displayName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div>
                <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">DOB</div>
                <div className="text-chrome-300 text-[10px] sm:text-[11px]">{displayDOB}</div>
              </div>
              <div>
                <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">SEX</div>
                <div className="text-chrome-300 text-[10px] sm:text-[11px]">{gender || 'X'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div>
                <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">HGT</div>
                <div className="text-chrome-300 text-[10px] sm:text-[11px]">{height || "0'0\""}</div>
              </div>
              <div>
                <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">EYES</div>
                <div className="text-chrome-300 text-[10px] sm:text-[11px]">{eyeColor || 'XXX'}</div>
              </div>
            </div>

            <div>
              <div className="text-chrome-400 text-[8px] sm:text-[9px] tracking-wider">ID NUMBER</div>
              <div className="text-chrome-300 text-[10px] sm:text-[11px] font-mono tracking-wider">
                {displayIdNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-chrome-300/10">
          <div className="text-chrome-300 text-[7px] sm:text-[8px] tracking-widest text-center font-semibold">
            ORDER NOW
          </div>
        </div>
      </div>
    </div>
  );
}
