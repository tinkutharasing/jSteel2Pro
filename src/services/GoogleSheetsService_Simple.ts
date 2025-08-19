import { Weld } from '../types/Weld';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  range?: string;
  credentials: {
    webapp_url?: string; // Google Apps Script Web App URL
    client_email?: string;
    private_key?: string;
    private_key_id?: string;
    api_key?: string;
  };
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = {
      spreadsheetId: config.spreadsheetId,
      range: config.range || 'Sheet1',
      credentials: config.credentials
    };
    
    console.log('GoogleSheetsService initialized with config:', {
      spreadsheetId: this.config.spreadsheetId,
      hasWebAppUrl: !!this.config.credentials.webapp_url,
      webAppUrl: this.config.credentials.webapp_url
    });
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
  async addWeld(weld: Weld): Promise<boolean> {
    try {
      console.log('Starting to add weld to Google Sheets:', weld.weldNumber);
      
      const result = await this.makeRequest('addWeld', { weld });
      
      console.log('Google Apps Script response:', result);
      
      if (result.success) {
        console.log('Weld added to Google Sheets successfully');
        return true;
      } else {
        console.error('Failed to add weld:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error adding weld to Google Sheets:', error);
      return false;
    }
  }

  /**
   * Update an existing weld in Google Sheets
   */
  async updateWeld(weld: Weld): Promise<boolean> {
    try {
      const result = await this.makeRequest('updateWeld', { weld });
      
      if (result.success) {
        console.log('Weld updated in Google Sheets successfully');
        return true;
      } else {
        console.error('Failed to update weld:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error updating weld in Google Sheets:', error);
      return false;
    }
  }

  /**
   * Delete a weld from Google Sheets (hard delete)
   */
  async deleteWeld(weldId: string): Promise<boolean> {
    try {
      const result = await this.makeRequest('deleteWeld', { weldId });
      
      if (result.success) {
        console.log('Weld deleted from Google Sheets successfully');
        return true;
      } else {
        console.error('Failed to delete weld:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting weld from Google Sheets:', error);
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
