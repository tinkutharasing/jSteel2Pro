// Date utility functions for consistent US date formatting across the app

/**
 * Converts ISO date string (YYYY-MM-DD) to US format (MM/DD/YYYY)
 * Fixed to prevent timezone issues
 */
export const formatDateToUS = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Parse ISO date safely without timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    
    // Format as MM/DD/YYYY
    return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error
  }
};

/**
 * Converts US format date (MM/DD/YYYY) to ISO string (YYYY-MM-DD)
 * Fixed to prevent timezone issues
 */
export const formatDateToISO = (usDateString: string): string => {
  if (!usDateString) return '';
  
  try {
    // Handle MM/DD/YYYY format
    const parts = usDateString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      // Validate the date parts
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
        return usDateString; // Return original if invalid
      }
      
      // Return in YYYY-MM-DD format without timezone conversion
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    return usDateString; // Return original if not in expected format
  } catch (error) {
    console.error('Error converting date to ISO:', error);
    return usDateString; // Return original if error
  }
};

/**
 * Gets current date in ISO format (YYYY-MM-DD)
 * Fixed to prevent timezone issues
 */
export const getCurrentDateISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets current date in US format (MM/DD/YYYY)
 */
export const getCurrentDateUS = (): string => {
  return formatDateToUS(getCurrentDateISO());
};

/**
 * Validates if a date string is in valid format
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
