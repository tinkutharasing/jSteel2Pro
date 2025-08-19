// Google Sheets API Configuration
// You'll need to replace these with your actual credentials

export const GOOGLE_SHEETS_CONFIG = {
  // Your Google Sheet ID (from the URL)
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  
  // Sheet name and range
  SHEET_NAME: 'Sheet1',
  RANGE: 'A:AD', // Columns A through AD (30 columns)
  
  // Column headers for your sheet
  COLUMNS: {
    ID: 'A',
    DATE: 'B',
    WELD_NUMBER: 'C',
    NDE_NUMBER: 'D',
    TYPE_FIT: 'E',
    WPS: 'F',
    PIPE_DIA: 'G',
    GRADE_CLASS: 'H',
    WELDER: 'I',
    INSPECTOR: 'J',
    FIRST_HT: 'K',
    FIRST_MFG: 'L',
    FIRST_LENGTH: 'M',
    JT_NUMBER: 'N',
    SECOND_HT: 'O',
    SECOND_MFG: 'P',
    SECOND_LENGTH: 'Q',
    PRE_HEAT: 'R',
    VT: 'S',
    PROCESS: 'T',
    AMPS: 'U',
    VOLTS: 'V',
    IPM: 'W',
    STATUS: 'X',
    WELDER_SIGNATURE: 'Y',
    INSPECTOR_SIGNATURE: 'Z',
    WELD_SKETCH: 'AA',
    DEFECT_SKETCH: 'AB',
    SHEET_STATUS: 'AC', // Active/Deleted status in sheet
    CREATED_AT: 'AD',
    UPDATED_AT: 'AE',
  },
  
  // Status values
  STATUS: {
    ACTIVE: 'Active',
    DELETED: 'Deleted',
  },
};

// Service account credentials (you'll get this from Google Cloud Console)
export const SERVICE_ACCOUNT_CREDENTIALS = {
  type: 'service_account',
  project_id: 'YOUR_PROJECT_ID',
  private_key_id: 'YOUR_PRIVATE_KEY_ID',
  private_key: 'YOUR_PRIVATE_KEY',
  client_email: 'YOUR_CLIENT_EMAIL',
  client_id: 'YOUR_CLIENT_ID',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'YOUR_CERT_URL',
};

// Instructions for setup:
/*
1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON credentials file
6. Replace the SERVICE_ACCOUNT_CREDENTIALS above with your actual credentials
7. Share your Google Sheet with the service account email
8. Copy your spreadsheet ID from the URL
9. Update SPREADSHEET_ID above

Your Google Sheet should have these columns:
A: ID | B: Date | C: Weld Number | D: NDE Number | E: Type Fit | F: WPS | G: Pipe Dia | H: Grade/Class | I: Welder | J: Inspector | K: First HT | L: First MFG | M: First Length | N: JT Number | O: Second HT | P: Second MFG | Q: Second Length | R: Pre Heat | S: VT | T: Process | U: Amps | V: Volts | W: IPM | X: Status | Y: Welder Signature | Z: Inspector Signature | AA: Weld Sketch | AB: Defect Sketch | AC: Sheet Status | AD: Created At | AE: Updated At
*/
