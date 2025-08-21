// Date utility functions for consistent US date formatting across the app

/**
 * Converts ISO date string (YYYY-MM-DD) to US format (MM/DD/YYYY)
 */
export const formatDateToUS = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error
  }
};

/**
 * Converts US format date (MM/DD/YYYY) to ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (usDateString: string): string => {
  if (!usDateString) return '';
  
  try {
    // Handle MM/DD/YYYY format
    const parts = usDateString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1; // Month is 0-indexed
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return usDateString; // Return original if invalid
      
      return date.toISOString().split('T')[0];
    }
    
    return usDateString; // Return original if not in expected format
  } catch (error) {
    console.error('Error converting date to ISO:', error);
    return usDateString; // Return original if error
  }
};

/**
 * Gets current date in ISO format (YYYY-MM-DD)
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
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
