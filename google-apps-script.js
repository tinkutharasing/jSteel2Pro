/**
 * Google Apps Script Web App for jSteel Pro
 * This script acts as a middleware between your React Native app and Google Sheets
 * 
 * FEATURES:
 * - Prevents duplicate weld numbers from being added to the sheet
 * - Weld Number is used as the unique identifier
 * - Soft delete functionality (marks entries as deleted instead of removing them)
 * - Comprehensive duplicate checking for both add and update operations
 * 
 * Setup Instructions:
 * 1. Open https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Click "Deploy" > "New Deployment"
 * 5. Choose "Web App", set execute as "Me", access to "Anyone"
 * 6. Copy the Web App URL and use it in your React Native app
 */

// Your Google Sheet ID (replace with your actual sheet ID)
const SHEET_ID = '1LB9UNBJNU1hoTZcSi-jUmnzgrh5j2rzGkhInVHDWJGg';
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

// Define the header row for the sheet
const HEADER_ROW = [
  'ID',
  'Date',
  'Weld Number',
  'NDE Number',
  'Type/Fit',
  'WPS',
  'Pipe Diameter',
  'Grade/Class',
  'Welder',
  'Inspector',
  'First HT',
  'First MFG',
  'First Length',
  'JT Number',
  'Second HT',
  'Second MFG',
  'Second Length',
  'Pre-Heat',
  'VT',
  'Process',
  'Amps',
  'Volts',
  'IPM',
  'Status',
  'Welder Signature',
  'Inspector Signature',
  'Weld Sketch',
  'Defect Sketch',
  'Sheet Status',
  'Created At',
  'Updated At'
];

/**
 * Main function that handles all requests from your React Native app
 */
function doPost(e) {
  try {
    // Parse the request
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    console.log('Received action:', action);
    console.log('Request data:', requestData);
    
    // Handle different actions
    switch (action) {
      case 'addWeld':
        return addWeld(requestData.weld);
      case 'getWelds':
        return getWelds();
      case 'updateWeld':
        return updateWeld(requestData.weld);
      case 'markDeleted':
        return markWeldAsDeleted(requestData.weldId);
      case 'getStats':
        return getSheetStats();
      case 'checkWeldNumber':
        return checkWeldNumberExists(requestData.weldNumber, requestData.excludeWeldId);
      case 'checkWeldById':
        return checkWeldExistsById(requestData.weldId);
      case 'initializeSheet':
        return initializeSheet();
      case 'forceInitializeSheet':
        return forceInitializeSheet();
      case 'clearSheet':
        return clearSheet();
      case 'debugSheet':
        return debugSheet();
      default:
        return createResponse(false, 'Unknown action: ' + action);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Add a new weld to the sheet
 * 
 * DUPLICATE PREVENTION:
 * - Checks if the weld number already exists in the sheet
 * - Only allows one active entry per weld number
 * - Returns detailed error information if duplicate is found
 * - Suggests using updateWeld for existing entries
 */
function addWeld(weld) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if sheet needs initialization (empty or missing headers)
    let existingData = sheet.getDataRange().getValues();
    console.log('Current sheet data:', existingData.length, 'rows');
    
    // More robust check for empty sheet or missing headers
    if (existingData.length === 0 || 
        existingData[0].length === 0 || 
        !existingData[0][0] || 
        existingData[0][0] !== 'ID' ||
        existingData[0][0].toString().trim() === '') {
      console.log('Sheet is empty or missing headers, initializing...');
      const initResult = initializeSheet();
      console.log('Initialization result:', initResult);
      
      // Refresh data after initialization
      existingData = sheet.getDataRange().getValues();
      console.log('After initialization, sheet has:', existingData.length, 'rows');
    }
    
    // Check for duplicate weld number
    let isDuplicate = false;
    let existingWeldId = null;
    
    // Skip header row and check for duplicates
    for (let i = 1; i < existingData.length; i++) {
      const row = existingData[i];
      const existingWeldNumber = row[2]; // Weld Number is in column C (index 2)
      const existingStatus = row[28]; // Status is in column AC (index 28)
      
      // Check if weld number already exists and is active
      if (existingWeldNumber === weld.weldNumber && existingStatus === 'Active') {
        isDuplicate = true;
        existingWeldId = row[0]; // Store the existing weld ID
        break;
      }
    }
    
    if (isDuplicate) {
      console.log('Duplicate weld number found:', weld.weldNumber, 'Existing ID:', existingWeldId);
      return createResponse(false, `Weld number ${weld.weldNumber} already exists in the sheet. Use updateWeld to modify existing entries.`, { 
        isDuplicate: true, 
        existingWeldId: existingWeldId 
      });
    }
    
    // Prepare the row data
    const rowData = [
      weld.id,
      weld.date,
      weld.weldNumber,
      weld.ndeNumber,
      weld.typeFit || '',
      weld.wps || '',
      weld.pipeDia || '',
      weld.gradeClass || '',
      weld.welder || '',
      weld.inspector || '',
      weld.firstHT || '',
      weld.firstMfg || '',
      weld.firstLength || '',
      weld.jtNumber || '',
      weld.secondHT || '',
      weld.secondMfg || '',
      weld.secondLength || '',
      weld.preHeat || '',
      weld.vt || '',
      weld.process || '',
      weld.amps || '',
      weld.volts || '',
      weld.ipm || '',
      weld.status || '',
      weld.welderSignature ? 'Yes' : 'No',
      weld.inspectorSignature ? 'Yes' : 'No',
      '', // Weld Sketch
      '', // Defect Sketch
      weld.status === 'deleted' ? 'Deleted' : 'Active', // Sheet Status - use weld status or default to Active
      new Date().toISOString(), // Created At
      new Date().toISOString(), // Updated At
    ];
    
    // Add the row
    sheet.appendRow(rowData);
    
    console.log('Weld added successfully:', weld.weldNumber);
    return createResponse(true, 'Weld added successfully', { weldId: weld.id });
    
  } catch (error) {
    console.error('Error adding weld:', error);
    return createResponse(false, 'Failed to add weld: ' + error.message);
  }
}

/**
 * Get all welds from the sheet
 */
function getWelds() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse(true, 'No welds found', { welds: [] });
    }
    
    // Skip header row and convert to weld objects
    const welds = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip completely empty rows or rows with no essential data
      if (!row || row.length === 0 || !row[0] || !row[2]) {
        continue; // Skip this row
      }
      
      // Only process welds with valid data (both active and deleted)
      if (row[0] && row[2]) { // ID and Weld Number must exist
        const weld = {
          id: row[0],
          date: row[1] || '',
          weldNumber: row[2],
          ndeNumber: row[3] || '',
          typeFit: row[4] || '',
          wps: row[5] || '',
          pipeDia: row[6] || '',
          gradeClass: row[7] || '',
          welder: row[8] || '',
          inspector: row[9] || '',
          firstHT: row[10] || '',
          firstMfg: row[11] || '',
          firstLength: row[12] || '',
          jtNumber: row[13] || '',
          secondHT: row[14] || '',
          secondMfg: row[15] || '',
          secondLength: row[16] || '',
          preHeat: row[17] || '',
          vt: row[18] || '',
          process: row[19] || '',
          amps: row[20] || '',
          volts: row[21] || '',
          ipm: row[22] || '',
          status: row[23] || 'pending',
          welderSignature: row[24] === 'Yes',
          inspectorSignature: row[25] === 'Yes',
        };
        welds.push(weld);
      }
    }
    
    console.log(`Retrieved ${welds.length} valid welds from sheet`);
    return createResponse(true, 'Welds retrieved successfully', { welds });
    
  } catch (error) {
    console.error('Error getting welds:', error);
    return createResponse(false, 'Failed to get welds: ' + error.message);
  }
}

/**
 * Get sheet statistics
 */
function getSheetStats() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    let total = Math.max(0, data.length - 1); // Subtract header
    let active = 0;
    let deleted = 0;
    
    // Count active and deleted items
    for (let i = 1; i < data.length; i++) {
      const status = data[i][28]; // Status column
      if (status === 'Active') {
        active++;
      } else if (status === 'Deleted') {
        deleted++;
      }
    }
    
    const stats = { total, active, deleted };
    return createResponse(true, 'Stats retrieved successfully', { stats });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    return createResponse(false, 'Failed to get stats: ' + error.message);
  }
}

/**
 * Update an existing weld
 * 
 * DUPLICATE PREVENTION:
 * - Checks if the new weld number conflicts with other existing welds
 * - Excludes the current weld being updated from duplicate checks
 * - Prevents creating conflicts when updating weld numbers
 */
function updateWeld(weld) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find the row with this weld ID
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === weld.id) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Weld not found');
    }
    
    // Check if the new weld number conflicts with another existing weld (excluding the current one being updated)
    const newWeldNumber = weld.weldNumber;
    const currentWeldId = weld.id;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingWeldNumber = row[2]; // Weld Number is in column C (index 2)
      const existingWeldId = row[0]; // Weld ID is in column A (index 0)
      const existingStatus = row[28]; // Status is in column AC (index 28)
      
      // Check if weld number already exists in another active weld
      if (existingWeldNumber === newWeldNumber && 
          existingWeldId !== currentWeldId && 
          existingStatus === 'Active') {
        console.log('Weld number conflict during update:', newWeldNumber, 'Existing ID:', existingWeldId);
        return createResponse(false, `Weld number ${newWeldNumber} already exists in another entry. Please use a unique weld number.`, { 
          isDuplicate: true, 
          existingWeldId: existingWeldId 
        });
      }
    }
    
    // Update the row
    const rowData = [
      weld.id,
      weld.date,
      weld.weldNumber,
      weld.ndeNumber,
      weld.typeFit || '',
      weld.wps || '',
      weld.pipeDia || '',
      weld.gradeClass || '',
      weld.welder || '',
      weld.inspector || '',
      weld.firstHT || '',
      weld.firstMfg || '',
      weld.firstLength || '',
      weld.jtNumber || '',
      weld.secondHT || '',
      weld.secondMfg || '',
      weld.secondLength || '',
      weld.preHeat || '',
      weld.vt || '',
      weld.process || '',
      weld.amps || '',
      weld.volts || '',
      weld.ipm || '',
      weld.status || '',
      weld.welderSignature ? 'Yes' : 'No',
      weld.inspectorSignature ? 'Yes' : 'No',
      data[rowIndex - 1][26], // Keep existing weld sketch
      data[rowIndex - 1][27], // Keep existing defect sketch
      'Active', // Sheet Status
      data[rowIndex - 1][29], // Keep original created timestamp
      new Date().toISOString(), // Update timestamp
    ];
    
    // Update the entire row
    const range = sheet.getRange(rowIndex, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    return createResponse(true, 'Weld updated successfully');
    
  } catch (error) {
    console.error('Error updating weld:', error);
    return createResponse(false, 'Failed to update weld: ' + error.message);
  }
}

/**
 * Mark a weld as deleted (soft delete)
 */
function markWeldAsDeleted(weldId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find the row with this weld ID
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === weldId) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Weld not found');
    }
    
    // Update only the status column (column 29, index 28)
    sheet.getRange(rowIndex, 29).setValue('Deleted');
    
    return createResponse(true, 'Weld marked as deleted successfully');
    
  } catch (error) {
    console.error('Error marking weld as deleted:', error);
    return createResponse(false, 'Failed to mark weld as deleted: ' + error.message);
  }
}

/**
 * Create a standardized response
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    Object.assign(response, data);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize the sheet with headers if it's empty
 */
function initializeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    console.log('Checking sheet for initialization. Current data:', {
      rowCount: data.length,
      firstRowLength: data.length > 0 ? data[0].length : 0,
      firstCellValue: data.length > 0 && data[0].length > 0 ? data[0][0] : 'N/A'
    });
    
    // Check if sheet is empty or missing headers
    if (data.length === 0 || 
        data[0].length === 0 || 
        !data[0][0] || 
        data[0][0] !== 'ID' ||
        data[0][0].toString().trim() === '') {
      
      console.log('Initializing sheet with headers...');
      
      // Clear the sheet completely
      sheet.clear();
      console.log('Sheet cleared');
      
      // Add the header row
      const headerRange = sheet.getRange(1, 1, 1, HEADER_ROW.length);
      headerRange.setValues([HEADER_ROW]);
      console.log('Headers added:', HEADER_ROW.length, 'columns');
      
      // Format the header row
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f4f6');
      headerRange.setHorizontalAlignment('center');
      console.log('Headers formatted');
      
      // Force the sheet to update
      SpreadsheetApp.flush();
      
      // Verify the initialization worked
      const newData = sheet.getDataRange().getValues();
      console.log('Verification - Sheet now has:', newData.length, 'rows');
      
      if (newData.length === 1 && newData[0][0] === 'ID') {
        console.log('Sheet initialized with headers successfully');
        return createResponse(true, 'Sheet initialized with headers successfully');
      } else {
        console.log('Warning: Initialization may not have worked as expected');
        return createResponse(false, 'Sheet initialization completed but verification failed');
      }
    } else {
      console.log('Sheet already has headers, no initialization needed');
      return createResponse(true, 'Sheet already has headers, no initialization needed');
    }
    
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return createResponse(false, 'Failed to initialize sheet: ' + error.message);
  }
}

/**
 * Force initialize the sheet with headers (always creates headers)
 */
function forceInitializeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    console.log('Force initializing sheet with headers...');
    
    // Clear the sheet completely
    sheet.clear();
    console.log('Sheet cleared');
    
    // Add the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADER_ROW.length);
    headerRange.setValues([HEADER_ROW]);
    console.log('Headers added:', HEADER_ROW.length, 'columns');
    
    // Format the header row
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f4f6');
    headerRange.setHorizontalAlignment('center');
    console.log('Headers formatted');
    
    // Force the sheet to update
    SpreadsheetApp.flush();
    
    // Verify the initialization worked
    const newData = sheet.getDataRange().getValues();
    console.log('Verification - Sheet now has:', newData.length, 'rows');
    
    if (newData.length === 1 && newData[0][0] === 'ID') {
      console.log('Sheet force-initialized with headers successfully');
      return createResponse(true, 'Sheet force-initialized with headers successfully');
    } else {
      console.log('Warning: Force initialization may not have worked as expected');
      return createResponse(false, 'Sheet force-initialization completed but verification failed');
    }
    
  } catch (error) {
    console.error('Error force-initializing sheet:', error);
    return createResponse(false, 'Failed to force-initialize sheet: ' + error.message);
  }
}

/**
 * Debug function to check current sheet state
 */
function debugSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const debugInfo = {
      totalRows: data.length,
      totalColumns: data.length > 0 ? data[0].length : 0,
      firstRow: data.length > 0 ? data[0] : [],
      firstCellValue: data.length > 0 && data[0].length > 0 ? data[0][0] : 'N/A',
      firstCellType: data.length > 0 && data[0].length > 0 ? typeof data[0][0] : 'N/A',
      sheetName: sheet.getName(),
      sheetId: sheet.getSheetId(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    };
    
    console.log('Sheet debug info:', debugInfo);
    return createResponse(true, 'Sheet debug info retrieved', { debugInfo });
    
  } catch (error) {
    console.error('Error debugging sheet:', error);
    return createResponse(false, 'Failed to debug sheet: ' + error.message);
  }
}

/**
 * Clear all data from the sheet (keeps headers)
 */
function clearSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse(true, 'Sheet is already empty (only headers remain)');
    }
    
    // Clear all data rows but keep headers
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    console.log('Sheet cleared successfully, headers preserved');
    return createResponse(true, 'Sheet cleared successfully, headers preserved');
    
  } catch (error) {
    console.error('Error clearing sheet:', error);
    return createResponse(false, 'Failed to clear sheet: ' + error.message);
  }
}

/**
 * Check if a weld number already exists in the sheet
 * @param {string} weldNumber - The weld number to check
 * @param {string} excludeWeldId - Optional weld ID to exclude from the check (for updates)
 * @returns {Object} - Object with isDuplicate flag and existingWeldId if found
 */
function checkWeldNumberExists(weldNumber, excludeWeldId = null) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and check for duplicates
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingWeldNumber = row[2]; // Weld Number is in column C (index 2)
      const existingWeldId = row[0]; // Weld ID is in column A (index 0)
      const existingStatus = row[28]; // Status is in column AC (index 28)
      
      // Check if weld number already exists and is active
      if (existingWeldNumber === weldNumber && 
          existingStatus === 'Active' && 
          existingWeldId !== excludeWeldId) {
        return {
          isDuplicate: true,
          existingWeldId: existingWeldId
        };
      }
    }
    
    return {
      isDuplicate: false,
      existingWeldId: null
    };
    
  } catch (error) {
    console.error('Error checking weld number existence:', error);
    return {
      isDuplicate: false,
      existingWeldId: null
    };
    }
  }

/**
 * Check if a weld exists by ID
 * @param {string} weldId - The ID of the weld to check
 * @returns {Object} - Object with exists flag and weld data if found
 */
function checkWeldExistsById(weldId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and find the weld
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === weldId) { // ID is in column A (index 0)
        return createResponse(true, 'Weld found', {
          exists: true,
          weld: {
            id: row[0],
            date: row[1] || '',
            weldNumber: row[2],
            ndeNumber: row[3] || '',
            typeFit: row[4] || '',
            wps: row[5] || '',
            pipeDia: row[6] || '',
            gradeClass: row[7] || '',
            welder: row[8] || '',
            inspector: row[9] || '',
            firstHT: row[10] || '',
            firstMfg: row[11] || '',
            firstLength: row[12] || '',
            jtNumber: row[13] || '',
            secondHT: row[14] || '',
            secondMfg: row[15] || '',
            secondLength: row[16] || '',
            preHeat: row[17] || '',
            vt: row[18] || '',
            process: row[19] || '',
            amps: row[20] || '',
            volts: row[21] || '',
            ipm: row[22] || '',
            status: row[23] || 'pending',
            welderSignature: row[24] === 'Yes',
            inspectorSignature: row[25] === 'Yes',
          }
        });
      }
    }
    
    return createResponse(true, 'Weld not found', { exists: false, weld: null });
    
  } catch (error) {
    console.error('Error checking weld existence by ID:', error);
    return createResponse(false, 'Failed to check weld existence: ' + error.message);
  }
}

/**
 * Test function (optional)
 */
function testScript() {
  console.log('Testing Google Apps Script...');
  
  // Test sheet initialization
  console.log('Testing sheet initialization...');
  const initResult = initializeSheet();
  console.log('Init result:', initResult.getContent());
  
  // Test sheet stats
  console.log('Testing sheet stats...');
  const stats = getSheetStats();
  console.log('Stats result:', stats.getContent());
  
  // Test force initialization
  console.log('Testing force initialization...');
  const forceResult = forceInitializeSheet();
  console.log('Force init result:', forceResult.getContent());
}
