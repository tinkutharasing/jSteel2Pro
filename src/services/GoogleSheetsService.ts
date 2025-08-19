import { Weld } from '../types/Weld';
import { GOOGLE_SHEETS_DEFAULTS, getEmailFromCredentials, getSpreadsheetId } from '../config/googleSheetsDefaults';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  range?: string;
  credentials: {
    client_email?: string;
    private_key?: string;
    private_key_id?: string;
    api_key?: string;
    email?: string; // Alternative field name
    webapp_url?: string; // Google Apps Script Web App URL
  };
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private accessToken: string | null = null;

  constructor(config: GoogleSheetsConfig) {
    // Use defaults for missing values
    this.config = {
      spreadsheetId: getSpreadsheetId(config.spreadsheetId),
      range: config.range || 'Sheet1',
      credentials: {
        client_email: getEmailFromCredentials(config.credentials),
        private_key: config.credentials.private_key || GOOGLE_SHEETS_DEFAULTS.privateKey,
        private_key_id: config.credentials.private_key_id || GOOGLE_SHEETS_DEFAULTS.privateKeyId,
        api_key: config.credentials.api_key || GOOGLE_SHEETS_DEFAULTS.apiKey,
        email: getEmailFromCredentials(config.credentials),
        webapp_url: config.credentials.webapp_url || GOOGLE_SHEETS_DEFAULTS.webappUrl,
      }
    };
    
    console.log('GoogleSheetsService initialized with config:', {
      spreadsheetId: this.config.spreadsheetId,
      hasCredentials: !!this.config.credentials,
      email: this.config.credentials.client_email,
      hasPrivateKey: !!this.config.credentials.private_key,
      hasApiKey: !!this.config.credentials.api_key,
      webappUrl: this.config.credentials.webapp_url
    });
  }

  /**
   * Get access token using service account credentials
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken !== null) {
      console.log('Using cached access token');
      return this.accessToken;
    }

    try {
      console.log('Creating JWT token for Google OAuth...');
      
      // Create proper JWT token for Google OAuth
      const jwt = this.createJWT();
      console.log('JWT token created, length:', jwt.length);
      
      const requestBody = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`;
      console.log('Token request body length:', requestBody.length);
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      });

      console.log('Token response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token error response:', errorText);
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Token response data keys:', Object.keys(data));
      
      if (data.access_token) {
        this.accessToken = data.accessToken;
        console.log('Access token obtained successfully');
        return data.access_token;
      } else {
        console.error('No access token in response:', data);
        throw new Error('Failed to get access token: ' + JSON.stringify(data));
      }
      
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Create JWT token for service account authentication
   */
  private createJWT(): string {
    try {
      console.log('Creating JWT token with credentials:', {
        client_email: this.config.credentials.client_email,
        private_key_id: this.config.credentials.private_key_id,
        has_private_key: !!this.config.credentials.private_key
      });
      
      // Check if we have the required credentials
      if (!this.config.credentials.private_key || !this.config.credentials.client_email) {
        throw new Error('Service account private key and email are required');
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      // Create header
      const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: this.config.credentials.private_key_id || 'default',
      };
      
      // Create payload
      const payload = {
        iss: this.config.credentials.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600, // 1 hour
        iat: now,
      };
      
      // Encode header and payload
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
      
      // For now, create a simplified token (this will need proper RSA signing)
      // In production, you'd use a proper JWT library with RSA signing
      const signature = this.base64UrlEncode('signature_placeholder');
      
      const token = `${encodedHeader}.${encodedPayload}.${signature}`;
      console.log('Created simplified JWT token for testing');
      return token;
      
    } catch (error) {
      console.error('Error creating JWT:', error);
      throw new Error('Failed to create JWT token');
    }
  }

  /**
   * Create HMAC signature for JWT
   */
  private createHMACSignature(data: string): string {
    try {
      // Simple hash-based signature for testing
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Error creating HMAC signature:', error);
      return 'signature_fallback';
    }
  }

  /**
   * Simple base64 URL encoding for React Native
   */
  private base64UrlEncode(str: string): string {
    try {
      // Use btoa if available, otherwise create a simple encoding
      if (typeof btoa !== 'undefined') {
        return btoa(str)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      } else {
        // Fallback for React Native
        return Buffer.from(str).toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      }
    } catch (error) {
      // Ultimate fallback - simple encoding
      return str
        .split('')
        .map(char => char.charCodeAt(0).toString(16))
        .join('')
        .substring(0, 20); // Limit length
    }
  }

  /**
   * Make request to Google Apps Script Web App (no authentication needed)
   */
  private async makeRequest(action: string, data?: any) {
    try {
      console.log('Making request to Google Apps Script...');
      console.log('Action:', action);
      console.log('Data:', data);
      
      // Get the Google Apps Script Web App URL from credentials
      const webAppUrl = this.config.credentials.webapp_url;
      if (!webAppUrl) {
        throw new Error('Google Apps Script Web App URL is required. Please set up the script first.');
      }
      
      console.log('Web App URL:', webAppUrl);
      
      const requestBody = {
        action: action,
        ...data
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Apps Script error:', errorText);
        throw new Error(`Google Apps Script error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ SUCCESS! Google Apps Script response:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('❌ Error making Google Apps Script request:', error);
      throw error;
    }
  }

  /**
   * Add a new weld to Google Sheets
   */
  async addWeld(weld: Weld): Promise<{ success: boolean; isDuplicate?: boolean; existingWeldId?: string; message?: string }> {
    try {
      console.log('Starting to add weld to Google Sheets:', weld.weldNumber);
      
      const result = await this.makeRequest('addWeld', { weld });
      
      console.log('Google Apps Script response:', result);
      
      if (result.success) {
        console.log('Weld added to Google Sheets successfully');
        return { success: true };
      } else {
        console.error('Failed to add weld:', result.message || 'Unknown error');
        return { 
          success: false, 
          isDuplicate: result.isDuplicate || false,
          existingWeldId: result.existingWeldId,
          message: result.message || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('Error adding weld to Google Sheets:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update an existing weld in Google Sheets
   */
  async updateWeld(weld: Weld): Promise<{ success: boolean; isDuplicate?: boolean; existingWeldId?: string; message?: string }> {
    try {
      const result = await this.makeRequest('updateWeld', { weld });
      
      if (result.success) {
        console.log('Weld updated in Google Sheets successfully');
        return { success: true };
      } else {
        console.error('Failed to update weld:', result.message || 'Unknown error');
        return { 
          success: false, 
          isDuplicate: result.isDuplicate || false,
          existingWeldId: result.existingWeldId,
          message: result.message || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('Error updating weld in Google Sheets:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Mark a weld as deleted in Google Sheets (soft delete)
   */
  async markWeldAsDeleted(weldId: string): Promise<boolean> {
    try {
      const result = await this.makeRequest('markDeleted', { weldId });
      
      if (result.success) {
        console.log('Weld marked as deleted in Google Sheets successfully');
        return true;
      } else {
        console.error('Failed to mark weld as deleted:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error marking weld as deleted in Google Sheets:', error);
      return false;
    }
  }

  /**
   * Sync all welds from Google Sheets to the app
   */
  async syncWeldsFromSheet(): Promise<Weld[]> {
    try {
      const result = await this.makeRequest('getWelds');
      
      if (result.success && result.welds) {
        console.log(`Synced ${result.welds.length} welds from Google Sheets`);
        return result.welds;
      } else {
        console.log('No welds found in Google Sheets');
        return [];
      }
    } catch (error) {
      console.error('Error syncing welds from Google Sheets:', error);
      return [];
    }
  }

  /**
   * Check if a weld number already exists in the sheet
   */
  async checkWeldNumberExists(weldNumber: string, excludeWeldId?: string): Promise<{ exists: boolean; existingWeldId?: string }> {
    try {
      const result = await this.makeRequest('checkWeldNumber', { 
        weldNumber, 
        excludeWeldId 
      });
      
      if (result.success) {
        return {
          exists: result.isDuplicate || false,
          existingWeldId: result.existingWeldId
        };
      } else {
        console.error('Failed to check weld number:', result.message);
        return { exists: false };
      }
    } catch (error) {
      console.error('Error checking weld number existence:', error);
      return { exists: false };
    }
  }

  /**
   * Check if a weld exists by ID in the sheet
   */
  async checkWeldExistsById(weldId: string): Promise<{ exists: boolean; weld?: any }> {
    try {
      const result = await this.makeRequest('checkWeldById', { weldId });
      
      if (result.success) {
        return {
          exists: result.exists || false,
          weld: result.weld
        };
      } else {
        console.error('Failed to check weld by ID:', result.message);
        return { exists: false };
      }
    } catch (error) {
      console.error('Error checking weld by ID:', error);
      return { exists: false };
    }
  }

  /**
   * Smart sync method that automatically determines whether to add or update a weld
   */
  async smartSyncWeld(weld: Weld): Promise<{ success: boolean; action: 'added' | 'updated' | 'failed'; message?: string; isDuplicate?: boolean; existingWeldId?: string }> {
    try {
      // First check if the weld already exists by ID
      const existingWeld = await this.checkWeldExistsById(weld.id);
      
      if (existingWeld.exists) {
        // Weld exists, update it
        console.log(`Weld ${weld.weldNumber} exists in sheet, updating...`);
        const updateResult = await this.updateWeld(weld);
        
        if (updateResult.success) {
          return { success: true, action: 'updated' };
        } else {
          return { 
            success: false, 
            action: 'failed', 
            message: updateResult.message,
            isDuplicate: updateResult.isDuplicate,
            existingWeldId: updateResult.existingWeldId
          };
        }
      } else {
        // Weld doesn't exist, add it
        console.log(`Weld ${weld.weldNumber} is new, adding...`);
        const addResult = await this.addWeld(weld);
        
        if (addResult.success) {
          return { success: true, action: 'added' };
        } else {
          return { 
            success: false, 
            action: 'failed', 
            message: addResult.message,
            isDuplicate: addResult.isDuplicate,
            existingWeldId: addResult.existingWeldId
          };
        }
      }
    } catch (error) {
      console.error('Error in smart sync:', error);
      return { 
        success: false, 
        action: 'failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Initialize the sheet with headers if it's empty
   */
  async initializeSheet(): Promise<boolean> {
    try {
      const result = await this.makeRequest('initializeSheet');
      
      if (result.success) {
        console.log('Sheet initialized successfully');
        return true;
      } else {
        console.error('Failed to initialize sheet:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
      return false;
    }
  }

  /**
   * Force initialize the sheet with headers (always creates headers)
   */
  async forceInitializeSheet(): Promise<boolean> {
    try {
      const result = await this.makeRequest('forceInitializeSheet');
      
      if (result.success) {
        console.log('Sheet force-initialized successfully');
        return true;
      } else {
        console.error('Failed to force-initialize sheet:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error force-initializing sheet:', error);
      return false;
    }
  }

  /**
   * Clear all data from the sheet (keeps headers)
   */
  async clearSheet(): Promise<boolean> {
    try {
      console.log('GoogleSheetsService: Calling clearSheet...');
      const result = await this.makeRequest('clearSheet');
      console.log('GoogleSheetsService: clearSheet response:', result);
      
      if (result.success) {
        console.log('Sheet cleared successfully');
        return true;
      } else {
        console.error('Failed to clear sheet:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error clearing sheet:', error);
      return false;
    }
  }

  /**
   * Debug function to check current sheet state
   */
  async debugSheet(): Promise<any> {
    try {
      const result = await this.makeRequest('debugSheet');
      
      if (result.success) {
        console.log('Sheet debug info:', result.debugInfo);
        return result.debugInfo;
      } else {
        console.error('Failed to debug sheet:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Error debugging sheet:', error);
      return null;
    }
  }

  /**
   * Get sheet statistics
   */
  async getSheetStats(): Promise<{ total: number; active: number; deleted: number }> {
    try {
      const result = await this.makeRequest('getStats');
      
      if (result.success && result.stats) {
        return result.stats;
      } else {
        return { total: 0, active: 0, deleted: 0 };
      }
    } catch (error) {
      console.error('Error getting sheet stats:', error);
      return { total: 0, active: 0, deleted: 0 };
    }
  }
}

// Configuration helper
export const createGoogleSheetsService = (spreadsheetId: string, credentials: any) => {
  return new GoogleSheetsService({
    spreadsheetId,
    range: 'Sheet1!A:AD', // Adjust based on your sheet structure
    credentials,
  });
};
