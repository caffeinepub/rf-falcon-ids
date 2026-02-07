/**
 * DOB parsing and formatting utilities for consistent MM/DD/YYYY display
 */

/**
 * Validates a MM/DD/YYYY date string
 */
export function isValidDOB(dob: string): boolean {
  if (!dob) return false;
  
  // Check MM/DD/YYYY format
  const mmddyyyyRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (mmddyyyyRegex.test(dob)) {
    const [month, day, year] = dob.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  
  return false;
}

/**
 * Formats a date string to MM/DD/YYYY
 * Supports legacy YYYY-MM-DD format and MM/DD/YYYY format
 */
export function formatDOB(dob: string): string {
  if (!dob) return '';
  
  // Already in MM/DD/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    return dob;
  }
  
  // Legacy YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const [year, month, day] = dob.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // Try to parse as Date object
  try {
    const date = new Date(dob);
    if (!isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  } catch (e) {
    // Fall through
  }
  
  return dob;
}

/**
 * Converts MM/DD/YYYY to YYYY-MM-DD for date input compatibility
 */
export function dobToDateInput(dob: string): string {
  if (!dob) return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return dob;
  }
  
  // Convert MM/DD/YYYY to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    const [month, day, year] = dob.split('/');
    return `${year}-${month}-${day}`;
  }
  
  return dob;
}

/**
 * Converts YYYY-MM-DD (from date input) to MM/DD/YYYY
 */
export function dateInputToDOB(dateInput: string): string {
  if (!dateInput) return '';
  
  // Convert YYYY-MM-DD to MM/DD/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-');
    return `${month}/${day}/${year}`;
  }
  
  return dateInput;
}
