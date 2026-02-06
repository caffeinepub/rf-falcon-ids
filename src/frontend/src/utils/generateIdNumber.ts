/**
 * Generates a unique ID number for novelty identification cards.
 * Format: 8-digit numeric string (e.g., "12345678")
 */
export function generateIdNumber(): string {
  // Generate 8 random digits
  const digits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  return digits.join('');
}
