import { formatDOB } from '../utils/dob';
import { normalizeStateName } from '../utils/stateFormat';
import { getStateSealPath } from '../utils/stateSeals';
import StateSeal from './StateSeal';
import type { Details } from '../backend';

interface IdCardPreviewProps {
  details: Details;
  photoUrl: string;
  signatureUrl?: string;
}

export default function IdCardPreview({ details, photoUrl, signatureUrl }: IdCardPreviewProps) {
  const stateName = normalizeStateName(details.state_name);
  const sealPath = getStateSealPath(stateName);

  return (
    <div
      id="id-card-preview"
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg shadow-2xl overflow-hidden"
      style={{ aspectRatio: '1.586' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-blue-600 dark:bg-blue-800 text-white py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StateSeal state={stateName} className="w-12 h-12" />
            <div>
              <h2 className="text-xl font-bold tracking-wide">{stateName}</h2>
              <p className="text-xs opacity-90">IDENTIFICATION CARD</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">ID NUMBER</p>
            <p className="text-sm font-mono font-semibold">{details.id_number}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-20 left-0 right-0 bottom-0 p-6 flex gap-6">
        {/* Photo */}
        <div className="flex-shrink-0">
          <img
            src={photoUrl}
            alt={`${details.first_name} ${details.last_name}`}
            className="w-32 h-40 object-cover rounded border-2 border-blue-300 dark:border-blue-700 shadow-lg"
          />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3 text-gray-900 dark:text-gray-100">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</p>
            <p className="text-lg font-semibold break-words">
              {details.first_name} {details.last_name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">DOB</p>
              <p className="text-sm font-medium">{formatDOB(details.dob)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Gender</p>
              <p className="text-sm font-medium">{details.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Height</p>
              <p className="text-sm font-medium">{details.height}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Eyes</p>
              <p className="text-sm font-medium">{details.eye_color}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address</p>
            <p className="text-sm font-medium break-words">
              {details.address}, {details.city}, {details.state_name} {details.zip}
            </p>
          </div>

          {/* Signature */}
          {signatureUrl && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Signature</p>
              <div className="h-12 flex items-center">
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
