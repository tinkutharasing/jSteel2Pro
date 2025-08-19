#!/usr/bin/env node

/**
 * Simple test script to verify Google Apps Script connection
 * Run this after updating your Web App URL in the configuration
 */

const testConnection = async (webappUrl) => {
  try {
    console.log('Testing connection to Google Apps Script...');
    console.log('URL:', webappUrl);
    
    const response = await fetch(webappUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'forceInitializeSheet'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ SUCCESS! Response:', data);
    
    if (data.success) {
      console.log('🎉 Force initialize headers is working!');
    } else {
      console.log('⚠️  Request completed but returned error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure you have Node.js 18+ or install node-fetch');
    } else if (error.message.includes('HTTP')) {
      console.log('\n💡 Check your Web App URL and make sure the script is deployed');
    }
  }
};

// Get URL from command line argument or use placeholder
const webappUrl = process.argv[2] || 'YOUR_NEW_WEB_APP_URL_HERE';

if (webappUrl === 'YOUR_NEW_WEB_APP_URL_HERE') {
  console.log('❌ Please provide your Web App URL as an argument:');
  console.log('   node test-connection.js "YOUR_ACTUAL_WEB_APP_URL"');
  console.log('\n💡 To get your Web App URL:');
  console.log('   1. Go to https://script.google.com');
  console.log('   2. Open your project');
  console.log('   3. Click "Deploy" > "New Deployment"');
  console.log('   4. Choose "Web App", set execute as "Me", access to "Anyone"');
  console.log('   5. Copy the new Web App URL');
  process.exit(1);
}

testConnection(webappUrl);
