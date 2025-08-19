This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Google Sheets Integration

jSteel Pro includes automatic Google Sheets synchronization for all weld data. This feature allows you to:

- **Automatically sync** new welds to Google Sheets
- **Track deleted welds** (marked as "Deleted" instead of removed)
- **Maintain audit trails** with timestamps
- **Access data** from any device with internet connection

## Prerequisites

- Google account with access to Google Sheets
- Google Cloud Project (free tier available)

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "jsteel-pro-sheets")
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click "Enable"

### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in service account details:
   - **Name**: `jsteel-pro-sheets-service`
   - **Description**: `Service account for jSteel Pro app`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### Step 4: Generate JSON Key

1. Click on your newly created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. **Download the JSON file** (keep it secure!)

### Step 5: Prepare Google Sheet

1. Create a new Google Sheet or use existing one
2. Set up headers in row 1 (see CSV template below)
3. **Share the sheet** with your service account email:
   - Click "Share" (top right)
   - Add service account email (from JSON file)
   - Give "Editor" access
   - Uncheck "Notify people" (optional)

### Step 6: Configure in App

1. Open jSteel Pro app
2. Go to **Settings** (gear icon next to title)
3. Click **"🔗 Connect to Sheets"**
4. Enter configuration:
   - **Spreadsheet ID**: From your sheet URL
   - **Service Account Email**: From JSON file
   - **Private Key**: Copy entire private key from JSON file

## CSV Template

Use this template to set up your Google Sheet headers:

```csv
ID,Date,Weld Number,NDE Number,Type Fit,WPS,Pipe Dia,Grade/Class,Welder,Inspector,First HT,First MFG,First Length,JT Number,Second HT,Second MFG,Second Length,Pre Heat,VT,Process,Amps,Volts,IPM,Status,Welder Signature,Inspector Signature,Weld Sketch,Defect Sketch,Sheet Status,Created At,Updated At
```

## Column Mapping

| Column | Field | Description |
|--------|-------|-------------|
| A | ID | Unique weld identifier |
| B | Date | Weld date (YYYY-MM-DD) |
| C | Weld Number | Weld reference number |
| D | NDE Number | NDE inspection reference |
| E | Type Fit | Fitting type description |
| F | WPS | Welding procedure specification |
| G | Pipe Dia | Pipe diameter |
| H | Grade/Class | Material grade/class |
| I | Welder | Welder name |
| J | Inspector | Inspector name |
| K | First HT | First heat treatment code |
| L | First MFG | First manufacturer |
| M | First Length | First length measurement |
| N | JT Number | Joint number |
| O | Second HT | Second heat treatment code |
| P | Second MFG | Second manufacturer |
| Q | Second Length | Second length measurement |
| R | Pre Heat | Pre-heating required (YES/NO) |
| S | VT | Visual testing method |
| T | Process | Welding process |
| U | Amps | Amperage values (semicolon-separated) |
| V | Volts | Voltage values (semicolon-separated) |
| W | IPM | Inches per minute |
| X | Status | Weld status (pending/approved/rejected) |
| Y | Welder Signature | Signature indicator (Yes/No) |
| Z | Inspector Signature | Signature indicator (Yes/No) |
| AA | Weld Sketch | Drawing indicator |
| AB | Defect Sketch | Drawing indicator |
| AC | Sheet Status | Active/Deleted status |
| AD | Created At | Creation timestamp |
| AE | Updated At | Last update timestamp |

## Troubleshooting

### Common Issues

1. **"Not Connected" Error**
   - Verify service account email is correct
   - Check private key is copied completely
   - Ensure sheet is shared with service account

2. **"Permission Denied" Error**
   - Verify sheet sharing permissions
   - Check service account has "Editor" access
   - Ensure Google Sheets API is enabled

3. **"Invalid Spreadsheet ID" Error**
   - Copy ID from sheet URL: `docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Remove any extra characters or spaces

### Security Notes

- **Never commit** JSON credentials to version control
- **Keep private key** secure and confidential
- **Use service account** instead of personal account
- **Limit permissions** to only necessary access

## Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
