// Google Sheets Default Configuration
// These values will be used as defaults when setting up the connection

// IMPORTANT: The Web App URL below needs to be updated after redeploying your Google Apps Script
// To get the correct URL:
// 1. Go to https://script.google.com
// 2. Open your project
// 3. Click "Deploy" > "New Deployment"
// 4. Choose "Web App", set execute as "Me", access to "Anyone"
// 5. Copy the new Web App URL and replace the one below

export const GOOGLE_SHEETS_DEFAULTS = {
  spreadsheetId: '1LB9UNBJNU1hoTZcSi-jUmnzgrh5j2rzGkhInVHDWJGg',
  serviceAccountEmail: 'jsteelpro@big-rivers-website-map.iam.gserviceaccount.com',
  privateKeyId: 'd05d417d51c952dffe2e7d3f6ca351aecc0ccf8e', // Replace with actual value
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDTgBEx0VjFhIS+\n3BqANrm8icR72RffMqFpp2gBkHpQiKEfk/ddCLJ+CEB6/4sLb+BJoMYsD7xsvFdj\nhwhmdkMwgPLnhekrn2tHPDw2C+aebnkeu3cbS+Rk/0ba3z8IMowOJ3ytrkjC6NM/\nGPYC+Jkl5ybflqh5ZQJEMx+9VBAE7HxBaq+x2MtySoqFa3nkgupxE5mATbkEbJuJ\nO+hEXZlE+bqDiGVoFr/4dZStFnI1po5xUDahFC2AKi4R/DCSMYIiJ/VF8igszLUI\nb7BuCU4bL6UtIl3YVuunO3hcHuKsxBwjpLH1Lo9Ml/Bk7CWx/EQOGrHOOd8aba3v\nxWOvTucXAgMBAAECggEAHfAmvvCyylbH/ET8wqxnHenkdGGBEGOYLJ6j9CC8PP0c\nzZ2s1LBVT84hjnzwyjV+aqha6kQZ+HcFPxM6BwLziitJTFOMyNN/+dfsGqcURdXp\nHYa3b+zjZMEr3vHd+BjrnASj5ek3PHvSN0AfHBbjhYAoZQWW+IQUo4xsZZOU0ZVZ\ng8Rwu087XyG6lpjvmZf3DfZZwxJ9G3kzf0mmQHx6Rgjj3JZX9l0a88KWDUK7CGdD\ngJ/wi45S+fZryYEJOqggaSgXcGmhZmlbp078RycO8Vy87C5I4kxyEzK1PcdFNbLQ\n8Q+QJjDJRYXspflDOeSgggYGEoInd/iWu7mg7oVBkQKBgQDvsu3/p42dmLXGdbV5\nJYKNf+FIXdYp75OzGDFQYPMXVwa1CYfC3vAmtu0nBaV+3E5pjaM0nhr3xdnX2Txs\n7ainSKRHV0R3NLZRXN18XHWo+4bOB8EuExIQwpoGq//1HZgskwAugpZh4IxCV0o9\nac+zk7zcp33YSAx9viPfQkKo0QKBgQDh4jV1cqNpPntTaWCuVebVQHxqCFmc2kpB\n/7YYLAvGFyBsdHIMBNZLvlxUxFzik4yRtg/VEVJ8RKFpE37J2wkLPEGMaHvQEXWI\nW8wqZa3Nk5Ho5/IwzGvCWPA6BylkQhLGH9c+ApJg+Km0wwVcbqV8jL+65Ke1LA38\nhYewJHwLZwKBgQCVZ1DDRhuV/IZoshuv7DpominAYoTH1MWaHt01/Yfnp13N36fY\nRf8oEmLVLMbPwN+7GQZ+GII0qAS1bnkkaCn0QunqcbGCH7/4DMsc5cCM2GJY7ypw\n3oAnJDS/Ldw3Wv/r4KB/XPQBA+ZIv4HNr7M/ejmAy4E8GwR2J9rSIMnN0QKBgQCA\n9Akc4bNUk+0H83LUVAoR2Fyuk9HE8AHQp9Em/45BKlbCU8AACIrmduhzJB764s0v\nKkbjlp4Gf4++Uvjg+ACzv1SUedmlMTJuBCoMUjvkzshPtIrZPPqP2wJZvljs+aOK\nJAdXSVSTs6H+pg9bc3daIWgbpAnyLhJWBU0vS8TdJQKBgDTSRJaP7daQ7xhrGhat\nLbEG2ZjJDPLe7UlJOJV7syUQJ9CAB2ApjRdL/Gui0zV04DB5YqgzkFCUhPI8S4rj\ntbKIdnRPgRtpdB96Hg0vlB4FCoj3e6iBrHmzTbwqD1gr1LdSbI9h3Uyz7ulkuasI\n75MQ+kWFKBF07D+COtqARypB\n-----END PRIVATE KEY-----\n', // Replace with actual value
  apiKey: 'AIzaSyClO2ehgXDu1b-LjFTQLt4UBLoWAiLs1ow', // Alternative authentication method
  webappUrl: 'https://script.google.com/macros/s/AKfycbxfdcfHTiVMaTfW0W5MMBDFCzsYeZLqpyjdJ86H14NUelqLGqUS-Rb8LF7UUFQnNRri4w/exec', // Google Apps Script Web App URL
};

// Helper function to get email from service account credentials
export const getEmailFromCredentials = (credentials: any): string => {
  if (credentials?.client_email) {
    return credentials.client_email;
  }
  if (credentials?.email) {
    return credentials.email;
  }
  return GOOGLE_SHEETS_DEFAULTS.serviceAccountEmail;
};

// Helper function to get spreadsheet ID with fallback
export const getSpreadsheetId = (customId?: string): string => {
  return customId || GOOGLE_SHEETS_DEFAULTS.spreadsheetId;
};
