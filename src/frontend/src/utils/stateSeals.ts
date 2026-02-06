import { US_STATES } from '../constants/usStates';

export function getStateSealPath(stateName: string): string | null {
  if (!stateName) return null;

  const state = US_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!state) return null;

  return `/assets/generated/state-seals-pack/${state.code}.png`;
}
