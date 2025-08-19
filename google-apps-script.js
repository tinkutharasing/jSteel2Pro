/**
 * Google Apps Script Web App for jSteel Pro
 * This script acts as a middleware between your React Native app and Google Sheets
 * 
 * FEATURES:
 * - Prevents duplicate weld numbers from being added to the sheet
 * - Weld Number is used as the unique identifier
 * - Hard delete functionality (completely removes entries when trashed)
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
  'Weld Number',
  'Date',
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
      case 'deleteWeld':
        return deleteWeld(requestData.weldNumber);
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
      case 'compareWeldNumbers':
        return compareWeldNumbers(requestData.appWeldNumbers);
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
 * - Handles restored items (items that were previously deleted and are being added back)
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
        existingData[0][0] !== 'Weld Number' ||
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
    
    // Skip header row and check for duplicates
    for (let i = 1; i < existingData.length; i++) {
      const row = existingData[i];
      const existingWeldNumber = row[0]; // Weld Number is in column A (index 0)
      
      // Handle type mismatches by converting to strings and trimming
      const existingWeldNumberStr = String(existingWeldNumber).trim();
      const weldNumberStr = String(weld.weldNumber).trim();
      
      // Check if weld number already exists (since we no longer have soft delete status)
      if (existingWeldNumberStr === weldNumberStr) {
        isDuplicate = true;
        break;
      }
    }
    
    if (isDuplicate) {
      console.log('Duplicate weld number found:', weld.weldNumber);
      return createResponse(false, `Weld number ${weld.weldNumber} already exists in the sheet. Use updateWeld to modify existing entries.`, { 
        isDuplicate: true, 
        existingWeldNumber: weld.weldNumber 
      });
    }
    
    // Prepare the row data
    const rowData = [
      weld.weldNumber, // Weld Number in column A (index 0)
      weld.date,
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
      'Active', // Sheet Status - always Active for new/restored items
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
      if (!row || row.length === 0 || !row[0]) {
        continue; // Skip this row
      }
      
      // Only process welds with valid data (all items are now active since we use hard delete)
      if (row[0]) { // Weld Number must exist
        const weld = {
          id: row[0], // Use Weld Number as the ID
          weldNumber: row[0], // Weld Number is now in column A
          date: row[1] || '',
          ndeNumber: row[2] || '',
          typeFit: row[3] || '',
          wps: row[4] || '',
          pipeDia: row[5] || '',
          gradeClass: row[6] || '',
          welder: row[7] || '',
          inspector: row[8] || '',
          firstHT: row[9] || '',
          firstMfg: row[10] || '',
          firstLength: row[11] || '',
          jtNumber: row[12] || '',
          secondHT: row[13] || '',
          secondMfg: row[14] || '',
          secondLength: row[15] || '',
          preHeat: row[16] || '',
          vt: row[17] || '',
          process: row[18] || '',
          amps: row[19] || '',
          volts: row[20] || '',
          ipm: row[21] || '',
          status: row[22] || 'pending',
          welderSignature: row[23] === 'Yes',
          inspectorSignature: row[24] === 'Yes',
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
    let active = total; // All items are now active since we use hard delete
    
    const stats = { total, active, deleted: 0 }; // No more deleted items
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
    
    console.log('UpdateWeld called with weld ID:', weld.id);
    console.log('Sheet has', data.length, 'rows');
            console.log('First few rows:', data.slice(0, 3).map(row => ({ id: row[0], weldNumber: row[0] })));
    
    // Find the row with this weld number
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const sheetWeldNumber = data[i][0]; // Weld Number is in column A (index 0)
      const requestedWeldNumber = weld.weldNumber;
      
      console.log(`Checking row ${i}: Weld Number="${sheetWeldNumber}" vs requested="${requestedWeldNumber}" (type: ${typeof sheetWeldNumber} vs ${typeof requestedWeldNumber})`);
      
      // Handle type mismatches by converting both to strings and trimming
      const sheetWeldNumberStr = String(sheetWeldNumber).trim();
      const requestedWeldNumberStr = String(requestedWeldNumber).trim();
      
      console.log(`Normalized: sheet="${sheetWeldNumberStr}" vs requested="${requestedWeldNumberStr}"`);
      
      if (sheetWeldNumberStr === requestedWeldNumberStr) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        console.log('Found weld at row:', rowIndex);
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.log('Weld not found. Available Weld Numbers:', data.slice(1).map(row => row[0]));
      return createResponse(false, `Weld not found. Requested Weld Number: ${weld.weldNumber}. Available Weld Numbers: ${data.slice(1).map(row => row[0]).join(', ')}`);
    }
    
    // Check if the new weld number conflicts with another existing weld (excluding the current one being updated)
    const newWeldNumber = weld.weldNumber;
    const currentWeldNumber = weld.weldNumber;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingWeldNumber = row[0]; // Weld Number is in column A (index 0)
      
      // Handle type mismatches by converting to strings and trimming
      const existingWeldNumberStr = String(existingWeldNumber).trim();
      const newWeldNumberStr = String(newWeldNumber).trim();
      const currentWeldNumberStr = String(currentWeldNumber).trim();
      
      // Check if weld number already exists in another weld (excluding current one)
      if (existingWeldNumberStr === newWeldNumberStr && existingWeldNumberStr !== currentWeldNumberStr) {
        console.log('Weld number conflict during update:', newWeldNumber, 'Existing Weld Number:', existingWeldNumber);
        return createResponse(false, `Weld number ${newWeldNumber} already exists in another entry. Please use a unique weld number.`, { 
          isDuplicate: true, 
          existingWeldNumber: existingWeldNumber 
        });
      }
    }
    
    // Update the row
    const rowData = [
      weld.weldNumber, // Weld Number in column A
      weld.date,
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
      data[rowIndex - 1][24], // Keep existing weld sketch
      data[rowIndex - 1][25], // Keep existing defect sketch
      'Active', // Sheet Status - always Active
      data[rowIndex - 1][27], // Keep original created timestamp
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
 * Delete a weld completely from the sheet (hard delete)
 */
function deleteWeld(weldNumber) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    console.log('DeleteWeld called with weld number:', weldNumber);
    console.log('Sheet has', data.length, 'rows');
    console.log('First few rows:', data.slice(0, 3).map(row => ({ id: row[0], weldNumber: row[0] })));
    
    // Find the row with this weld number
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const sheetWeldNumber = data[i][0]; // Weld Number is in column A (index 0)
      const requestedWeldNumber = weldNumber;
      
      console.log(`Checking row ${i}: Weld Number="${sheetWeldNumber}" vs requested="${requestedWeldNumber}" (type: ${typeof sheetWeldNumber} vs ${typeof requestedWeldNumber})`);
      
      // Handle type mismatches by converting both to strings and trimming
      const sheetWeldNumberStr = String(sheetWeldNumber).trim();
      const requestedWeldNumberStr = String(requestedWeldNumber).trim();
      
      console.log(`Normalized: sheet="${sheetWeldNumberStr}" vs requested="${requestedWeldNumberStr}"`);
      
      if (sheetWeldNumberStr === requestedWeldNumberStr) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        console.log('Found weld at row:', rowIndex);
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.log('Weld not found. Available Weld Numbers:', data.slice(1).map(row => row[0]));
      return createResponse(false, `Weld not found. Requested Weld Number: ${weldNumber}. Available Weld Numbers: ${data.slice(1).map(row => row[0]).join(', ')}`);
    }
    
    // Delete the entire row
    sheet.deleteRow(rowIndex);
    
    console.log('Weld deleted successfully:', weldNumber);
    return createResponse(true, 'Weld deleted successfully');
    
  } catch (error) {
    console.error('Error deleting weld:', error);
    return createResponse(false, 'Failed to delete weld: ' + error.message);
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
        data[0][0] !== 'Weld Number' ||
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
      
      if (newData.length === 1 && newData[0][0] === 'Weld Number') {
        console.log('Sheet initialized with headers successfully');
        return createResponse(true, 'Sheet initialized with headers successfully');
      } else {
        console.log('Warning: Initialization may not have worked as expected');
        console.log('First column value:', newData[0][0]);
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
    
    if (newData.length === 1 && newData[0][0] === 'Weld Number') {
      console.log('Sheet force-initialized with headers successfully');
      return createResponse(true, 'Sheet force-initialized with headers successfully');
    } else {
      console.log('Warning: Force initialization may not have worked as expected');
      console.log('First column value:', newData[0][0]);
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
      lastColumn: sheet.getLastColumn(),
      // Add detailed data for debugging
      allData: data.length > 1 ? data.slice(1).map(row => ({
        weldNumber: row[0], // Weld Number is now in column A
        date: row[1]
      })) : []
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
 * @param {string} excludeWeldNumber - Optional weld number to exclude from the check (for updates)
 * @returns {Object} - Object with isDuplicate flag and existingWeldNumber if found
 */
function checkWeldNumberExists(weldNumber, excludeWeldNumber = null) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and check for duplicates
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingWeldNumber = row[0]; // Weld Number is now in column A (index 0)
      
      // Handle type mismatches by converting to strings and trimming
      const existingWeldNumberStr = String(existingWeldNumber).trim();
      const weldNumberStr = String(weldNumber).trim();
      const excludeWeldNumberStr = excludeWeldNumber ? String(excludeWeldNumber).trim() : null;
      
      // Check if weld number already exists (since we no longer have soft delete status)
      if (existingWeldNumberStr === weldNumberStr && existingWeldNumberStr !== excludeWeldNumberStr) {
        return {
          isDuplicate: true,
          existingWeldNumber: existingWeldNumber
        };
      }
    }
    
    return {
      isDuplicate: false,
      existingWeldNumber: null
    };
    
  } catch (error) {
    console.error('Error checking weld number existence:', error);
    return {
      isDuplicate: false,
      existingWeldNumber: null
    };
    }
  }

/**
 * Check if a weld exists by Weld Number
 * @param {string} weldNumber - The Weld Number to check
 * @returns {Object} - Object with exists flag and weld data if found
 */
function checkWeldExistsById(weldNumber) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and find the weld
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const sheetWeldNumber = row[0]; // Weld Number is in column A (index 0)
      
      // Handle type mismatches by converting both to strings and trimming
      const sheetWeldNumberStr = String(sheetWeldNumber).trim();
      const requestedWeldNumberStr = String(weldNumber).trim();
      
      if (sheetWeldNumberStr === requestedWeldNumberStr) { // Weld Number is in column A (index 0)
        return createResponse(true, 'Weld found', {
          exists: true,
          weld: {
            id: row[0], // ID is in column A (index 0)
            weldNumber: row[0], // Weld Number is in column A (index 0)
            date: row[1] || '',
            ndeNumber: row[2] || '',
            typeFit: row[3] || '',
            wps: row[4] || '',
            pipeDia: row[5] || '',
            gradeClass: row[6] || '',
            welder: row[7] || '',
            inspector: row[8] || '',
            firstHT: row[9] || '',
            firstMfg: row[10] || '',
            firstLength: row[11] || '',
            jtNumber: row[12] || '',
            secondHT: row[13] || '',
            secondMfg: row[14] || '',
            secondLength: row[15] || '',
            preHeat: row[16] || '',
            vt: row[17] || '',
            process: row[18] || '',
            amps: row[19] || '',
            volts: row[20] || '',
            ipm: row[21] || '',
            status: row[22] || 'pending',
            welderSignature: row[23] === 'Yes',
            inspectorSignature: row[24] === 'Yes',
          }
        });
      }
    }
    
    return createResponse(true, 'Weld not found', { exists: false, weld: null });
    
  } catch (error) {
    console.error('Error checking weld existence by Weld Number:', error);
    return createResponse(false, 'Failed to check weld existence: ' + error.message);
  }
}

/**
 * Compare weld numbers from the app with what's in the sheet
 */
function compareWeldNumbers(appWeldNumbers) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse(true, 'Sheet is empty (only headers)', { 
        sheetWeldNumbers: [],
        appWeldNumbers: appWeldNumbers || [],
        missingInSheet: appWeldNumbers || [],
        missingInApp: []
      });
    }
    
    // Get all weld numbers from the sheet (skip header row)
    const sheetWeldNumbers = data.slice(1).map(row => row[0]).filter(weldNumber => weldNumber);
    
    console.log('Comparing weld numbers:');
    console.log('Sheet has:', sheetWeldNumbers);
    console.log('App has:', appWeldNumbers);
    
    // Find weld numbers that are missing in the sheet
    const missingInSheet = appWeldNumbers.filter(appWeldNumber => !sheetWeldNumbers.includes(appWeldNumber));
    
    // Find weld numbers that are in the sheet but not in the app
    const missingInApp = sheetWeldNumbers.filter(sheetWeldNumber => !appWeldNumbers.includes(sheetWeldNumber));
    
    const comparison = {
      sheetWeldNumbers,
      appWeldNumbers: appWeldNumbers || [],
      missingInSheet,
      missingInApp,
      totalInSheet: sheetWeldNumbers.length,
      totalInApp: appWeldNumbers ? appWeldNumbers.length : 0
    };
    
    console.log('Comparison result:', comparison);
    return createResponse(true, 'Weld number comparison completed', { comparison });
    
  } catch (error) {
    console.error('Error comparing weld numbers:', error);
    return createResponse(false, 'Failed to compare weld numbers: ' + error.message);
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
