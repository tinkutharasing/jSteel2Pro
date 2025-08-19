import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, View, Text, StyleSheet, BackHandler, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Weld, WeldFormData, Screen } from './src/types/Weld';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeldFormScreen } from './src/screens/WeldFormScreen';
import { WeldViewScreen } from './src/screens/WeldViewScreen';
import { BottomNavigation } from './src/components/BottomNavigation';
import { GoogleSheetsConfigModal } from './src/components/GoogleSheetsConfigModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  
                    // Google Sheets integration state
                  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);
                  const [googleSheetsConfig, setGoogleSheetsConfig] = useState({
                    spreadsheetId: '1LB9UNBJNU1hoTZcSi-jUmnzgrh5j2rzGkhInVHDWJGg',
                    credentials: {
                      client_email: 'jsteelpro@big-rivers-website-map.iam.gserviceaccount.com',
                      private_key: 'your_private_key_here',
                      private_key_id: 'your_private_key_id_here',
                      api_key: 'your_api_key_here'
                    },
                  });
  const [googleSheetsModalVisible, setGoogleSheetsModalVisible] = useState(false);
  
  // Sample data constant - this will always contain the original sample data
  const SAMPLE_WELDS: Weld[] = [
    {
      id: '1',
      date: '2024-01-15',
      typeFit: 'EL 90 to Pipe',
      wps: 'WPS-6',
      pipeDia: '24 inch',
      gradeClass: 'X65-x65',
      weldNumber: 'A1368',
      welder: 'Mike Johnson',
      welderSignature: '',
      inspector: 'John Doe',
      inspectorSignature: '',
      firstHT: 'CAAD',
      firstMfg: 'SteelCorp',
      firstLength: '35.5 feet',
      jtNumber: 'JT-001',
      secondHT: '1F769H',
      secondMfg: 'MetalWorks',
      secondLength: '21.5 feet',
      preHeat: 'YES',
      vt: 'HFW/DSAW',
      process: 'GMAW-SAW',
      ndeNumber: 'NDE-324',
      amps: '316,325,333',
      volts: '27,30,33',
      ipm: '8-inch',
      status: 'approved',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      date: '2024-01-16',
      typeFit: 'Pipe to Pipe',
      wps: 'WPS-8',
      pipeDia: '18 inch',
      gradeClass: 'X52-x52',
      weldNumber: 'B2479',
      welder: 'Sarah Wilson',
      welderSignature: '',
      inspector: 'Jane Smith',
      inspectorSignature: '',
      firstHT: 'BCCD',
      firstMfg: 'PipeTech',
      firstLength: '28.0 feet',
      jtNumber: 'JT-002',
      secondHT: '2G890K',
      secondMfg: 'SteelFlow',
      secondLength: '15.2 feet',
      preHeat: 'NO',
      vt: 'GTAW',
      process: 'GTAW-SMAW',
      ndeNumber: 'NDE-456',
      amps: '180,195,210',
      volts: '22,25,28',
      ipm: '6-inch',
      status: 'pending',
      createdAt: '2024-01-16T14:15:00Z',
      updatedAt: '2024-01-16T14:15:00Z'
    },
    {
      id: '3',
      date: '2024-01-17',
      typeFit: 'Tee to Pipe',
      wps: 'WPS-12',
      pipeDia: '36 inch',
      gradeClass: 'X70-x70',
      weldNumber: 'C3590',
      welder: 'David Chen',
      welderSignature: '',
      inspector: 'Robert Brown',
      inspectorSignature: '',
      firstHT: 'DCCE',
      firstMfg: 'BigSteel',
      firstLength: '42.8 feet',
      jtNumber: 'JT-003',
      secondHT: '3H901L',
      secondMfg: 'HeavyMetal',
      secondLength: '32.1 feet',
      preHeat: 'YES',
      vt: 'SMAW',
      process: 'SMAW-FCAW',
      ndeNumber: 'NDE-789',
      amps: '450,475,490',
      volts: '32,35,38',
      ipm: '12-inch',
      status: 'rejected',
      createdAt: '2024-01-17T09:45:00Z',
      updatedAt: '2024-01-17T09:45:00Z'
    },
    {
      id: '4',
      date: '2024-01-18',
      typeFit: 'Reducer to Pipe',
      wps: 'WPS-15',
      pipeDia: '20 inch',
      gradeClass: 'X60-x60',
      weldNumber: 'D4701',
      welder: 'Lisa Garcia',
      welderSignature: '',
      inspector: 'Michael White',
      inspectorSignature: '',
      firstHT: 'ECCF',
      firstMfg: 'ReduxCorp',
      firstLength: '25.3 feet',
      jtNumber: 'JT-004',
      secondHT: '4I012M',
      secondMfg: 'FlexSteel',
      secondLength: '18.7 feet',
      preHeat: 'YES',
      vt: 'GMAW',
      process: 'GMAW-GTAW',
      ndeNumber: 'NDE-012',
      amps: '280,295,310',
      volts: '24,27,30',
      ipm: '7-inch',
      status: 'approved',
      createdAt: '2024-01-18T16:20:00Z',
      updatedAt: '2024-01-18T16:20:00Z'
    },
    {
      id: '5',
      date: '2024-01-19',
      typeFit: 'Flange to Pipe',
      wps: 'WPS-18',
      pipeDia: '16 inch',
      gradeClass: 'X55-x55',
      weldNumber: 'E5812',
      welder: 'Alex Thompson',
      welderSignature: '',
      inspector: 'Emily Davis',
      inspectorSignature: '',
      firstHT: 'FCCG',
      firstMfg: 'FlangeTech',
      firstLength: '22.1 feet',
      jtNumber: 'JT-005',
      secondHT: '5J123N',
      secondMfg: 'SecureSteel',
      secondLength: '14.9 feet',
      preHeat: 'NO',
      vt: 'FCAW',
      process: 'FCAW-SMAW',
      ndeNumber: 'NDE-345',
      amps: '220,235,250',
      volts: '21,24,27',
      ipm: '5-inch',
      status: 'pending',
      createdAt: '2024-01-19T11:10:00Z',
      updatedAt: '2024-01-19T11:10:00Z'
    }
  ];

  const [welds, setWelds] = useState<Weld[]>([]);



  const [trashWelds, setTrashWelds] = useState<Weld[]>([]);
  const [selectedWeld, setSelectedWeld] = useState<Weld | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<WeldFormData>({
    date: '',
    typeFit: '',
    wps: '',
    pipeDia: '',
    gradeClass: '',
    weldNumber: '',
    welder: '',
    welderSignature: '',
    inspector: '',
    inspectorSignature: '',
    firstHT: '',
    firstMfg: '',
    firstLength: '',
    jtNumber: '',
    secondHT: '',
    secondMfg: '',
    secondLength: '',
    preHeat: '',
    vt: '',
    process: '',
    ndeNumber: '',
    amps: '',
    volts: '',
    ipm: '',
    status: 'pending'
  });

  // Confirmation popup state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmConfirmText, setConfirmConfirmText] = useState('Confirm');
  const [confirmCancelText, setConfirmCancelText] = useState('Cancel');
  const [confirmLoading, setConfirmLoading] = useState(false); // Loading state
  const confirmActionRef = useRef<(() => Promise<void> | void) | null>(null);
  const confirmVisibleRef = useRef(false); // Ref to track confirmation state

  // Success popup state
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false); // Animation state

  // Error popup state
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorAnimation, setErrorAnimation] = useState(false); // Animation state



  const showConfirm = (
    opts: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => Promise<void> | void;
    }
  ) => {
    setConfirmTitle(opts.title);
    setConfirmMessage(opts.message);
    setConfirmConfirmText(opts.confirmText || 'Confirm');
    setConfirmCancelText(opts.cancelText || 'Cancel');
    setConfirmLoading(false); // Reset loading state
    confirmActionRef.current = opts.onConfirm;
    setConfirmVisible(true);
    confirmVisibleRef.current = true; // Set ref to true
  };

  const hideConfirm = () => {
    console.log('hideConfirm called, current confirmVisible state:', confirmVisible);
    
    // Force the state update to be synchronous
    setConfirmVisible(false);
    setConfirmLoading(false); // Reset loading state
    confirmActionRef.current = null;
    confirmVisibleRef.current = false; // Reset ref
    
    // Double-check the state was updated
    setTimeout(() => {
      if (confirmVisibleRef.current) { // Check ref
        console.log('State update failed, forcing hide...');
        setConfirmVisible(false);
        setConfirmLoading(false);
      }
    }, 100);
    
    console.log('hideConfirm completed, confirmVisible set to false');
  };

  const showSuccess = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessVisible(true);
    setSuccessAnimation(true); // Start animation
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setSuccessAnimation(false); // End animation
      setTimeout(() => setSuccessVisible(false), 300); // Hide after animation
    }, 3000);
  };

  const hideSuccess = () => {
    setSuccessAnimation(false);
    setTimeout(() => setSuccessVisible(false), 300);
  };

  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorVisible(true);
    setErrorAnimation(true); // Start animation
    
    // Auto-hide after 4 seconds for errors
    setTimeout(() => {
      setErrorAnimation(false); // End animation
      setTimeout(() => setErrorVisible(false), 300); // Hide after animation
    }, 4000);
  };

  const hideError = () => {
    setErrorAnimation(false);
    setTimeout(() => setErrorVisible(false), 300);
  };

  // Debug confirmation dialog state changes
  useEffect(() => {
    console.log('Confirmation dialog state changed:', { confirmVisible, confirmTitle, confirmMessage });
  }, [confirmVisible, confirmTitle, confirmMessage]);

  useEffect(() => {
    const initializeApp = async () => {
      await loadWelds();
      await loadTrashWelds();
      await loadGoogleSheetsConfig();
    };
    
    initializeApp();
    
    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 'home') {
        return false; // Let Android handle app exit
      } else {
        handleBack();
        return true; // Prevent default back behavior
      }
    });
    
    return () => backHandler.remove();
  }, [currentScreen]);

  // Refresh data when home screen becomes active
  useEffect(() => {
    if (currentScreen === 'home') {
      refreshDataFromStorage();
    }
  }, [currentScreen]);

  const loadWelds = async () => {
    try {
      const stored = await AsyncStorage.getItem('welds');
      if (stored) {
        setWelds(JSON.parse(stored));
      } else {
        // No stored data – do NOT auto-seed; keep empty
        console.log('No welds found in storage; leaving state empty');
        setWelds([]);
      }
    } catch (error) {
      console.error('Error loading welds:', error);
    }
  };

  const loadTrashWelds = async () => {
    try {
      const stored = await AsyncStorage.getItem('trashWelds');
      if (stored) {
        setTrashWelds(JSON.parse(stored));
      } else {
        // No stored data – do NOT auto-seed; keep empty
        console.log('No trash welds found in storage; leaving state empty');
        setTrashWelds([]);
      }
    } catch (error) {
      console.error('Error loading trash welds:', error);
    }
  };

  // Load Google Sheets configuration from AsyncStorage
  const loadGoogleSheetsConfig = async () => {
    try {
      console.log('Loading Google Sheets config from AsyncStorage...');
      const configData = await AsyncStorage.getItem('googleSheetsConfig');
      console.log('Raw config data from AsyncStorage:', configData);
      
      if (configData) {
        const config = JSON.parse(configData);
        console.log('Parsed config:', config);
        setGoogleSheetsConfig(config);
        setGoogleSheetsConnected(true);
        console.log('Config loaded and state updated');
      } else {
        console.log('No config found in AsyncStorage');
      }
    } catch (error) {
      console.log('Failed to load Google Sheets config:', error);
    }
  };

  const resetToSampleData = async () => {
    try {
      console.log('Resetting to sample data...');
      
      // If connected to Google Sheets, clear existing data and add sample welds
      if (googleSheetsConnected) {
        console.log('Syncing reset to sample data action to Google Sheets...');
        
        // Import and use Google Sheets service
        const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
        const sheetsService = createGoogleSheetsService(
          googleSheetsConfig.spreadsheetId,
          googleSheetsConfig.credentials
        );
        
        // First, mark all existing welds as deleted
        const existingSheetWelds = await sheetsService.syncWeldsFromSheet();
        if (existingSheetWelds.length > 0) {
          console.log(`Deleting ${existingSheetWelds.length} existing welds from Google Sheets...`);
          
          let deletedCount = 0;
          for (const sheetWeld of existingSheetWelds) {
            try {
              const success = await sheetsService.deleteWeld(sheetWeld.weldNumber);
              if (success) {
                deletedCount++;
                console.log(`Deleted weld ${sheetWeld.weldNumber} from Google Sheets`);
              }
            } catch (error) {
              console.error(`Failed to delete weld ${sheetWeld.weldNumber} from Google Sheets:`, error);
            }
          }
          
          console.log(`Successfully deleted ${deletedCount} welds from Google Sheets`);
        }
        
        // Now add all sample welds to Google Sheets
        console.log(`Adding ${SAMPLE_WELDS.length} sample welds to Google Sheets...`);
        
        let addedCount = 0;
        for (const sampleWeld of SAMPLE_WELDS) {
          try {
            const result = await sheetsService.addWeld(sampleWeld);
            if (result.success) {
              addedCount++;
              console.log(`Added sample weld ${sampleWeld.weldNumber} to Google Sheets`);
            } else {
              console.error(`Failed to add sample weld ${sampleWeld.weldNumber}:`, result.message);
            }
          } catch (error) {
            console.error(`Failed to add sample weld ${sampleWeld.weldNumber}:`, error);
          }
        }
        
        console.log(`Successfully added ${addedCount} sample welds to Google Sheets`);
      }
      
      await AsyncStorage.removeItem('welds');
      await AsyncStorage.removeItem('trashWelds');
      await AsyncStorage.setItem('welds', JSON.stringify(SAMPLE_WELDS));
      await AsyncStorage.setItem('trashWelds', JSON.stringify([]));
      setWelds(SAMPLE_WELDS);
      setTrashWelds([]);
      console.log('Sample data restored successfully');
      showSuccess('Success', `Database reset! Restored ${SAMPLE_WELDS.length} welds and synced to Google Sheets.`);
    } catch (error) {
      console.error('Error resetting to sample data:', error);
      showError('Error', 'Failed to reset to sample data');
    }
  };

  const clearAllData = async () => {
    showConfirm({
      title: 'Clear All Data',
      message: 'This will remove all welds and trash data. This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          console.log('Clearing all data...');
          
          // If connected to Google Sheets, completely clear the sheet
          if (googleSheetsConnected) {
            console.log('Clearing all data from Google Sheets...');
            
            // Import and use Google Sheets service
            const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
            const sheetsService = createGoogleSheetsService(
              googleSheetsConfig.spreadsheetId,
              googleSheetsConfig.credentials
            );
            
            // Clear the entire sheet data (this will remove all rows except headers)
            const clearResult = await sheetsService.clearSheet();
            if (clearResult) {
              console.log('Successfully cleared all data from Google Sheets');
            } else {
              console.error('Failed to clear Google Sheets');
            }
          }
          
          await AsyncStorage.removeItem('welds');
          await AsyncStorage.removeItem('trashWelds');
          setWelds([]);
          setTrashWelds([]);
          console.log('All data cleared successfully');
          hideConfirm();
          showSuccess('Success', 'All data cleared from app and Google Sheets!');
        } catch (error) {
          console.error('Error clearing data:', error);
          hideConfirm();
          showError('Error', 'Failed to clear data');
        }
      }
    });
  };

  const confirmResetToSampleData = () => {
    showConfirm({
      title: 'Reset to Sample Data',
      message: 'This will overwrite current data with 5 sample entries.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await resetToSampleData();
        hideConfirm();
      }
    });
  };

  const showDatabaseStatus = async () => {
    try {
      const storedWelds = await AsyncStorage.getItem('welds');
      const storedTrash = await AsyncStorage.getItem('trashWelds');
      const message = `Current State:\n• Active Welds: ${welds.length}\n• Trash Items: ${trashWelds.length}\n\nStorage Status:\n• Welds in AsyncStorage: ${storedWelds ? 'Yes' : 'No'}\n• Trash in AsyncStorage: ${storedTrash ? 'Yes' : 'No'}\n\nSample Data Available:\n• Sample Welds: ${SAMPLE_WELDS.length}`;
      showSuccess('Database Status', message);
    } catch (error) {
      console.error('Error checking database status:', error);
      showError('Error', 'Failed to check database status');
    }
  };

  const refreshDataFromStorage = async () => {
    try {
      console.log('Refreshing data from storage...');
      await loadWelds();
      await loadTrashWelds();
      console.log('Data refreshed from storage');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const saveWelds = async (newWelds: Weld[]) => {
    try {
      await AsyncStorage.setItem('welds', JSON.stringify(newWelds));
      setWelds(newWelds);
      
      // Auto-sync to Google Sheets if connected
      if (googleSheetsConnected) {
        autoSyncToGoogleSheets(newWelds);
      }
    } catch (error) {
      console.error('Error saving welds:', error);
    }
  };

  const saveTrashWelds = async (newTrashWelds: Weld[]) => {
    try {
      await AsyncStorage.setItem('trashWelds', JSON.stringify(newTrashWelds));
      setTrashWelds(newTrashWelds);
    } catch (error) {
      console.error('Error saving trash welds:', error);
    }
  };

  const updateField = useCallback((field: keyof WeldFormData, value: string) => {
    console.log(`Updating field ${field} with value: ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      date: '', typeFit: '', wps: '', pipeDia: '', gradeClass: '', weldNumber: '', welder: '', welderSignature: '',
      inspector: '', inspectorSignature: '', firstHT: '', firstMfg: '', firstLength: '', jtNumber: '', secondHT: '', secondMfg: '',
      secondLength: '', preHeat: '', vt: '', process: '', ndeNumber: '', amps: '', volts: '', ipm: '', status: 'pending'
    });
    setIsEditMode(false);
    setSelectedWeld(null);
  };

  const addWeld = () => {
    if (!formData.weldNumber?.trim()) {
      showError('Error', 'Weld Number is required');
      return;
    }
    if (!formData.ndeNumber?.trim()) {
      showError('Error', 'NDE Number is required');
      return;
    }
    
    if (isEditMode && selectedWeld) {
      // Check for duplicate weld number when editing (excluding current weld)
      const existingWeld = welds.find(weld => 
        weld.weldNumber === formData.weldNumber && weld.id !== selectedWeld.id
      );
      if (existingWeld) {
        showError('Duplicate Weld Number', `Weld number ${formData.weldNumber} already exists in another entry. Please use a unique weld number.`);
        return;
      }
      
      // Update existing weld
      const updatedWelds = welds.map(weld => 
        weld.id === selectedWeld.id 
          ? { 
              ...weld,           // Keep existing fields like id, status, createdAt
              ...formData,       // Update with new form data
              updatedAt: new Date().toISOString() 
            }
          : weld
      );
      setWelds(updatedWelds);
      saveWelds(updatedWelds);
      showSuccess('Success', 'Weld updated successfully!');
    } else {
      // Check for duplicate weld number locally
      const existingWeld = welds.find(weld => weld.weldNumber === formData.weldNumber);
      if (existingWeld) {
        showError('Duplicate Weld Number', `Weld number ${formData.weldNumber} already exists. Please use a unique weld number.`);
        return;
      }
      
      // Add new weld
      const newWeld = { ...formData, id: Date.now().toString(), status: 'pending' as const, createdAt: new Date().toISOString() };
      const updatedWelds = [newWeld, ...welds];
      setWelds(updatedWelds);
      saveWelds(updatedWelds);
      showSuccess('Success', 'Weld added successfully!');
    }
    
    setCurrentScreen('home');
    resetForm();
  };

  const editWeld = (weld: Weld) => {
    setSelectedWeld(weld);
    setFormData({
      date: weld.date || '',
      typeFit: weld.typeFit || '',
      wps: weld.wps || '',
      pipeDia: weld.pipeDia || '',
      gradeClass: weld.gradeClass || '',
      weldNumber: weld.weldNumber || '',
      welder: weld.welder || '',
      welderSignature: weld.welderSignature || '',
      inspector: weld.inspector || '',
      inspectorSignature: weld.inspectorSignature || '',
      firstHT: weld.firstHT || '',
      firstMfg: weld.firstMfg || '',
      firstLength: weld.firstLength || '',
      jtNumber: weld.jtNumber || '',
      secondHT: weld.secondHT || '',
      secondMfg: weld.secondMfg || '',
      secondLength: weld.secondLength || '',
      preHeat: weld.preHeat || '',
      vt: weld.vt || '',
      process: weld.process || '',
      ndeNumber: weld.ndeNumber || '',
      amps: weld.amps || '',
      volts: weld.volts || '',
      ipm: weld.ipm || '',
      status: weld.status || 'pending'
    });
    setIsEditMode(true);
    setCurrentScreen('add');
  };

  const viewWeld = (weld: Weld) => {
    setSelectedWeld(weld);
    setCurrentScreen('view');
  };

  const deleteWeld = (weld: Weld) => {
    showConfirm({
      title: 'Move to Trash',
      message: `Move ${weld.weldNumber} to trash? You can recover it later.`,
      confirmText: 'Move to Trash',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Set loading state for confirmation button (don't hide dialog yet)
          setConfirmLoading(true);
          
          // If connected to Google Sheets, delete the weld from the sheet
          if (googleSheetsConnected) {
            console.log(`Deleting weld ${weld.weldNumber} from Google Sheets...`);
            console.log('Google Sheets config:', {
              spreadsheetId: googleSheetsConfig.spreadsheetId,
              hasCredentials: !!googleSheetsConfig.credentials,
              webappUrl: (googleSheetsConfig.credentials as any)?.webapp_url
            });
            
            try {
              // Import and use Google Sheets service
              const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
              const sheetsService = createGoogleSheetsService(
                googleSheetsConfig.spreadsheetId,
                googleSheetsConfig.credentials
              );
              
              console.log('Google Sheets service created successfully');
              
              // Test connection first
              console.log('Testing connection by getting sheet stats...');
              try {
                const stats = await sheetsService.getSheetStats();
                console.log('Connection test successful, sheet stats:', stats);
              } catch (statsError) {
                console.error('Connection test failed:', statsError);
                throw new Error(`Connection test failed: ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
              }
              
              // Delete the weld from Google Sheets
              console.log('Attempting to delete weld...');
              const success = await sheetsService.deleteWeld(weld.weldNumber);
              if (success) {
                console.log(`Successfully deleted weld ${weld.weldNumber} from Google Sheets`);
              } else {
                console.log(`Failed to delete weld ${weld.weldNumber} from Google Sheets`);
              }
            } catch (error) {
              console.error('Error during Google Sheets delete operation:', error);
              // Show error to user
              showError('Google Sheets Error', `Failed to delete from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else {
            console.log('Google Sheets not connected, skipping delete operation');
          }
          
          const updatedWelds = welds.filter(w => w.id !== weld.id);
          const updatedTrashWelds = [weld, ...trashWelds];
          
          // Update local state first
          setWelds(updatedWelds);
          setTrashWelds(updatedTrashWelds);
          saveWelds(updatedWelds);
          saveTrashWelds(updatedTrashWelds);
          
          showSuccess('Moved to Trash', `${weld.weldNumber} has been moved to trash and deleted from Google Sheets.`);
          
          // Debug: Compare weld IDs to help troubleshoot
          if (googleSheetsConnected) {
            try {
              const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
              const sheetsService = createGoogleSheetsService(
                googleSheetsConfig.spreadsheetId,
                googleSheetsConfig.credentials
              );
              
              const allWeldNumbers = welds.map(w => w.weldNumber);
              console.log('Debug: Comparing weld numbers...');
              const comparison = await sheetsService.compareWeldNumbers(allWeldNumbers);
              if (comparison.success) {
                console.log('Weld number comparison:', comparison.comparison);
              }
            } catch (error) {
              console.error('Debug: Failed to compare weld IDs:', error);
            }
          }
          
          // Now hide the confirmation dialog after operation completes
          hideConfirm();
        } catch (error) {
          console.error('Error moving weld to trash:', error);
          showError('Error', 'Failed to move weld to trash');
          
          // Hide dialog on error too
          hideConfirm();
        } finally {
          // Always reset loading state
          setConfirmLoading(false);
        }
      }
    });
  };

  const recoverWeld = (weld: Weld) => {
    showConfirm({
      title: 'Recover Weld',
      message: `Recover ${weld.weldNumber} from trash? This will restore it to active welds.`,
      confirmText: 'Recover',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Set loading state for confirmation button (don't hide dialog yet)
          setConfirmLoading(true);
          
          // If connected to Google Sheets, add the weld back to the sheet
          if (googleSheetsConnected) {
            console.log(`Adding recovered weld ${weld.weldNumber} back to Google Sheets...`);
            
            // Import and use Google Sheets service
            const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
            const sheetsService = createGoogleSheetsService(
              googleSheetsConfig.spreadsheetId,
              googleSheetsConfig.credentials
            );
            
            // Add the recovered weld back to Google Sheets
            const result = await sheetsService.addWeld(weld);
            if (result.success) {
              console.log(`Successfully added recovered weld ${weld.weldNumber} back to Google Sheets`);
            } else {
              console.error(`Failed to add recovered weld ${weld.weldNumber} to Google Sheets:`, result.message);
            }
          }
          
          const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
          const updatedWelds = [weld, ...welds];
          
          // Update local state first
          await saveTrashWelds(updatedTrashWelds);
          await saveWelds(updatedWelds);
          
          setTrashWelds(updatedTrashWelds);
          setWelds(updatedWelds);
          
          showSuccess('Recovered', `${weld.weldNumber} has been recovered successfully and added back to Google Sheets!`);
          
          // Now hide the confirmation dialog after operation completes
          hideConfirm();
        } catch (error) {
          console.error('Error recovering weld:', error);
          showError('Error', 'Failed to recover weld');
          
          // Hide dialog on error too
          hideConfirm();
        } finally {
          // Always reset loading state
          setConfirmLoading(false);
        }
      }
    });
  };

  const permanentlyDeleteWeld = (weld: Weld) => {
    showConfirm({
      title: 'Permanently Delete',
      message: `Are you sure you want to permanently delete ${weld.weldNumber}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Set loading state for confirmation button (don't hide dialog yet)
          setConfirmLoading(true);
          
          // If connected to Google Sheets, mark the weld as deleted
          if (googleSheetsConnected) {
            console.log(`Marking permanently deleted weld ${weld.weldNumber} as deleted in Google Sheets...`);
            
            // Import and use Google Sheets service
            const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
            const sheetsService = createGoogleSheetsService(
              googleSheetsConfig.spreadsheetId,
              googleSheetsConfig.credentials
            );
            
            // Delete the weld from Google Sheets
            const success = await sheetsService.deleteWeld(weld.weldNumber);
            if (success) {
              console.log(`Successfully deleted permanently deleted weld ${weld.weldNumber} from Google Sheets`);
            } else {
              console.error(`Failed to delete permanently deleted weld ${weld.weldNumber} from Google Sheets`);
            }
          }
          
          const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
          
          // Update local state first
          setTrashWelds(updatedTrashWelds);
          saveTrashWelds(updatedTrashWelds);
          
          showSuccess('Deleted', `${weld.weldNumber} has been permanently deleted and marked as deleted in Google Sheets.`);
          
          // Now hide the confirmation dialog after operation completes
          hideConfirm();
        } catch (error) {
          console.error('Error permanently deleting weld:', error);
          showError('Error', 'Failed to permanently delete weld');
          
          // Hide dialog on error too
          hideConfirm();
        } finally {
          // Always reset loading state
          setConfirmLoading(false);
        }
      }
    });
  };

  const handleAddWeld = () => {
    resetForm();
    setCurrentScreen('add');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    resetForm();
  };

  // Google Sheets integration functions
  const openGoogleSheetsSettings = useCallback(() => {
    setGoogleSheetsModalVisible(true);
  }, []);

  const closeGoogleSheetsModal = useCallback(() => {
    setGoogleSheetsModalVisible(false);
  }, []);

  const saveGoogleSheetsConfig = useCallback(async (config: { spreadsheetId: string; credentials: any }) => {
    try {
      console.log('Saving Google Sheets config:', config);
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('googleSheetsConfig', JSON.stringify(config));
      console.log('Config saved to AsyncStorage');
      
      // Update state
      setGoogleSheetsConfig(config);
      setGoogleSheetsConnected(true);
      console.log('State updated, connected:', true);
      
      showSuccess('Configuration Saved', 'Google Sheets connection has been configured successfully!');
    } catch (error) {
      console.error('Failed to save Google Sheets config:', error);
      showError('Configuration Error', 'Failed to save Google Sheets configuration');
    }
  }, []);

  const syncToGoogleSheets = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    try {
      showSuccess('Sync Started', 'Syncing data to Google Sheets...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      // Ensure sheet is properly initialized before syncing
      console.log('Ensuring sheet is properly initialized...');
      
      // First, get existing welds from Google Sheets to check for duplicates
      console.log('Checking existing welds in Google Sheets...');
      const existingSheetWelds = await sheetsService.syncWeldsFromSheet();
      const existingWeldMap = new Map();
      
      // Create a map of existing weld numbers to their IDs for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, sheetWeld.id);
      });
      
      console.log(`Found ${existingSheetWelds.length} existing welds in Google Sheets`);
      
      // Handle case when there are no active welds to sync
      if (welds.length === 0) {
        console.log('No active welds to sync - all items may be trashed');
        
        // If there are existing welds in the sheet, we should delete them all
        if (existingSheetWelds.length > 0) {
          console.log(`Deleting ${existingSheetWelds.length} existing welds from Google Sheets...`);
          
          let deletedCount = 0;
          for (const sheetWeld of existingSheetWelds) {
            try {
              const success = await sheetsService.deleteWeld(sheetWeld.weldNumber);
              if (success) {
                deletedCount++;
                console.log(`Deleted weld ${sheetWeld.weldNumber} from Google Sheets`);
              }
            } catch (error) {
              console.error(`Failed to delete weld ${sheetWeld.weldNumber} from Google Sheets:`, error);
            }
          }
          
          if (deletedCount > 0) {
            showSuccess('Sync Complete', `All welds have been moved to trash. ${deletedCount} welds deleted from Google Sheets.`);
          } else {
            showSuccess('Sync Complete', 'No active welds to sync. All items are in trash.');
          }
        } else {
          showSuccess('Sync Complete', 'No active welds to sync. All items are in trash.');
        }
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      let addedCount = 0;
      let updatedCount = 0;
      let trashedCount = 0; // Track trashed items synced
      
      // Sync each active weld
      for (const weld of welds) {
        try {
          // Check if this weld already exists in Google Sheets
          const existingWeldId = existingWeldMap.get(weld.weldNumber);
          
          if (existingWeldId) {
            // Weld exists, update it
            console.log(`Weld ${weld.weldNumber} already exists in Google Sheets, updating...`);
            const updateResult = await sheetsService.updateWeld(weld);
            if (updateResult.success) {
              successCount++;
              updatedCount++;
              console.log(`Updated existing weld: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Failed to update existing weld ${weld.weldNumber}:`, updateResult.message);
            }
          } else {
            // Weld doesn't exist, add it
            console.log(`Weld ${weld.weldNumber} is new, adding to Google Sheets...`);
            const result = await sheetsService.addWeld(weld);
            if (result.success) {
              successCount++;
              addedCount++;
              console.log(`Added new weld: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Failed to add new weld ${weld.weldNumber}:`, result.message);
            }
          }
        } catch (error) {
          failCount++;
          console.error(`Failed to sync weld ${weld.weldNumber}:`, error);
        }
      }
      
      // Now sync trashed items to Google Sheets
      if (trashWelds.length > 0) {
        console.log(`Syncing ${trashWelds.length} trashed items to Google Sheets...`);
        
        trashedCount = 0;
        for (const trashedWeld of trashWelds) {
          try {
            // Check if this trashed weld already exists in Google Sheets
            const existingWeldId = existingWeldMap.get(trashedWeld.weldNumber);
            
            if (existingWeldId) {
              // Weld exists in sheet, delete it
              console.log(`Deleting trashed weld ${trashedWeld.weldNumber} from Google Sheets...`);
              const success = await sheetsService.deleteWeld(trashedWeld.weldNumber);
              if (success) {
                trashedCount++;
                console.log(`Deleted trashed weld ${trashedWeld.weldNumber} from Google Sheets`);
              }
            } else {
              // Trashed weld doesn't exist in sheet, no need to add it since we're using hard delete
              console.log(`Trashed weld ${trashedWeld.weldNumber} doesn't exist in Google Sheets, skipping...`);
              trashedCount++;
            }
          } catch (error) {
            console.error(`Failed to sync trashed weld ${trashedWeld.weldNumber}:`, error);
          }
        }
        
        console.log(`Successfully synced ${trashedCount} trashed items to Google Sheets`);
      }
      
      if (failCount === 0) {
        let message = `Successfully synced ${successCount} welds to Google Sheets! (${addedCount} added, ${updatedCount} updated)`;
        if (trashedCount > 0) {
          message += `\nAlso synced ${trashedCount} trashed items as deleted.`;
        }
        showSuccess('Sync Complete', message);
      } else {
        let message = `Synced ${successCount} welds (${addedCount} added, ${updatedCount} updated), ${failCount} failed`;
        if (trashedCount > 0) {
          message += `\nAlso synced ${trashedCount} trashed items as deleted.`;
        }
        showSuccess('Sync Partial', message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      showError('Sync Failed', 'Failed to sync data to Google Sheets');
    }
  }, [googleSheetsConnected, googleSheetsConfig, welds, trashWelds]);

  const autoSyncToGoogleSheets = useCallback(async (weldsToSync: Weld[]) => {
    if (!googleSheetsConnected) {
      return; // Silent return for auto-sync
    }
    
    try {
      console.log('Auto-syncing updated welds to Google Sheets...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      // First, get existing welds from Google Sheets to check for duplicates
      console.log('Auto-sync: Checking existing welds in Google Sheets...');
      const existingSheetWelds = await sheetsService.syncWeldsFromSheet();
      const existingWeldMap = new Map();
      
      // Create a map of existing weld numbers to their IDs for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, sheetWeld.id);
      });
      
      console.log(`Auto-sync: Found ${existingSheetWelds.length} existing welds in Google Sheets`);
      
      // Handle case when there are no welds to sync
      if (weldsToSync.length === 0) {
        console.log('Auto-sync: No welds to sync - all items may be trashed');
        
        // If there are existing welds in the sheet, we should delete them all
        if (existingSheetWelds.length > 0) {
          console.log(`Auto-sync: Deleting ${existingSheetWelds.length} existing welds from Google Sheets...`);
          
          let deletedCount = 0;
          for (const sheetWeld of existingSheetWelds) {
            try {
              const success = await sheetsService.deleteWeld(sheetWeld.weldNumber);
              if (success) {
                deletedCount++;
                console.log(`Auto-sync: Deleted weld ${sheetWeld.weldNumber} from Google Sheets`);
              }
            } catch (error) {
              console.error(`Auto-sync: Failed to delete weld ${sheetWeld.weldNumber} from Google Sheets:`, error);
            }
          }
          
          console.log(`Auto-sync: ${deletedCount} welds deleted from Google Sheets`);
        } else {
          console.log('Auto-sync: No existing welds in Google Sheets to delete');
        }
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      let addedCount = 0;
      let updatedCount = 0;
      let trashedCount = 0; // Track trashed items synced
      
      // Sync each active weld
      for (const weld of weldsToSync) {
        try {
          // Check if this weld already exists in Google Sheets
          const existingWeldId = existingWeldMap.get(weld.weldNumber);
          
          if (existingWeldId) {
            // Weld exists, update it
            console.log(`Auto-sync: Weld ${weld.weldNumber} already exists, updating...`);
            const updateResult = await sheetsService.updateWeld(weld);
            if (updateResult.success) {
              successCount++;
              updatedCount++;
              console.log(`Auto-sync: Updated existing weld: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Auto-sync: Failed to update existing weld ${weld.weldNumber}:`, updateResult.message);
            }
          } else {
            // Weld doesn't exist, add it
            console.log(`Auto-sync: Weld ${weld.weldNumber} is new, adding...`);
            const result = await sheetsService.addWeld(weld);
            if (result.success) {
              successCount++;
              addedCount++;
              console.log(`Auto-sync: Added new weld: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Auto-sync: Failed to add new weld ${weld.weldNumber}:`, result.message);
            }
          }
        } catch (error) {
          failCount++;
          console.error(`Auto-sync: Failed to sync weld ${weld.weldNumber}:`, error);
        }
      }
      
      // Now sync trashed items to Google Sheets
      if (trashWelds.length > 0) {
        console.log(`Auto-sync: Syncing ${trashWelds.length} trashed items to Google Sheets...`);
        
        trashedCount = 0;
        for (const trashedWeld of trashWelds) {
          try {
            // Check if this trashed weld already exists in Google Sheets
            const existingWeldId = existingWeldMap.get(trashedWeld.weldNumber);
            
            if (existingWeldId) {
              // Weld exists in sheet, delete it
              console.log(`Auto-sync: Deleting trashed weld ${trashedWeld.weldNumber} from Google Sheets...`);
              const success = await sheetsService.deleteWeld(trashedWeld.weldNumber);
              if (success) {
                trashedCount++;
                console.log(`Auto-sync: Deleted trashed weld ${trashedWeld.weldNumber} from Google Sheets`);
              }
            } else {
              // Trashed weld doesn't exist in sheet, no need to add it since we're using hard delete
              console.log(`Auto-sync: Trashed weld ${trashedWeld.weldNumber} doesn't exist in Google Sheets, skipping...`);
              trashedCount++;
            }
          } catch (error) {
            console.error(`Auto-sync: Failed to sync trashed weld ${trashedWeld.weldNumber}:`, error);
          }
        }
        
        console.log(`Auto-sync: Successfully synced ${trashedCount} trashed items to Google Sheets`);
      }
      
      if (failCount === 0) {
        console.log(`Auto-sync complete: ${successCount} welds synced successfully (${addedCount} added, ${updatedCount} updated)`);
      } else {
        console.log(`Auto-sync partial: ${successCount} welds synced (${addedCount} added, ${updatedCount} updated), ${failCount} failed`);
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }, [googleSheetsConnected, googleSheetsConfig, trashWelds]);

  const syncChangedWeldsToGoogleSheets = useCallback(async (changedWelds: Weld[]) => {
    if (!googleSheetsConnected || changedWelds.length === 0) {
      return;
    }
    
    try {
      console.log(`Syncing ${changedWelds.length} changed welds to Google Sheets...`);
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      // First, get existing welds from Google Sheets to check for duplicates
      console.log('Changed welds sync: Checking existing welds in Google Sheets...');
      const existingSheetWelds = await sheetsService.syncWeldsFromSheet();
      const existingWeldMap = new Map();
      
      // Create a map of existing weld numbers to their IDs for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, sheetWeld.id);
      });
      
      console.log(`Changed welds sync: Found ${existingSheetWelds.length} existing welds in Google Sheets`);
      
      let successCount = 0;
      let failCount = 0;
      let addedCount = 0;
      let updatedCount = 0;
      
      // Sync only changed welds
      for (const weld of changedWelds) {
        try {
          // Check if this weld already exists in Google Sheets
          const existingWeldId = existingWeldMap.get(weld.weldNumber);
          
          if (existingWeldId) {
            // Weld exists, update it
            console.log(`Changed welds sync: Weld ${weld.weldNumber} already exists, updating...`);
            const updateResult = await sheetsService.updateWeld(weld);
            if (updateResult.success) {
              successCount++;
              updatedCount++;
              console.log(`Changed weld synced: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Failed to sync changed weld ${weld.weldNumber}:`, updateResult.message);
            }
          } else {
            // Weld doesn't exist, add it
            console.log(`Changed welds sync: Weld ${weld.weldNumber} is new, adding...`);
            const result = await sheetsService.addWeld(weld);
            if (result.success) {
              successCount++;
              addedCount++;
              console.log(`Changed weld synced: ${weld.weldNumber}`);
            } else {
              failCount++;
              console.error(`Failed to sync changed weld ${weld.weldNumber}:`, result.message);
            }
          }
        } catch (error) {
          failCount++;
          console.error(`Failed to sync changed weld ${weld.weldNumber}:`, error);
        }
      }
      
      if (failCount === 0) {
        console.log(`Changed welds sync complete: ${successCount} welds synced successfully (${addedCount} added, ${updatedCount} updated)`);
      } else {
        console.log(`Changed welds sync partial: ${successCount} welds synced (${addedCount} added, ${updatedCount} updated), ${failCount} failed`);
      }
    } catch (error) {
      console.error('Changed welds sync error:', error);
    }
  }, [googleSheetsConnected, googleSheetsConfig]);

  const syncFromGoogleSheets = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    try {
      showSuccess('Sync Started', 'Syncing data from Google Sheets...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      // Sync from sheets
      const sheetWelds = await sheetsService.syncWeldsFromSheet();
      
      if (sheetWelds && sheetWelds.length > 0) {
        // Update local welds with data from sheets
        setWelds(sheetWelds);
        await AsyncStorage.setItem('welds', JSON.stringify(sheetWelds));
        showSuccess('Sync Complete', `Synced ${sheetWelds.length} welds from Google Sheets!`);
      } else {
        // Check if sheet is empty or just has no valid data
        const stats = await sheetsService.getSheetStats();
        if (stats.total === 0) {
          showSuccess('Sync Complete', 'Google Sheet is empty. Use "Initialize Sheet Headers" to set up the sheet structure.');
        } else {
          showSuccess('Sync Complete', 'No valid weld data found in Google Sheets. The sheet may contain empty rows or invalid data.');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      showError('Sync Failed', 'Failed to sync data from Google Sheets');
    }
  }, [googleSheetsConnected, googleSheetsConfig]);

  const initializeGoogleSheet = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    try {
      showSuccess('Initializing...', 'Setting up sheet headers...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      const success = await sheetsService.initializeSheet();
      
      if (success) {
        showSuccess('Sheet Initialized', 'Google Sheet has been set up with proper headers!');
      } else {
        showError('Initialization Failed', 'Failed to initialize the Google Sheet');
      }
    } catch (error) {
      console.error('Sheet initialization error:', error);
      showError('Initialization Failed', 'Failed to initialize the Google Sheet');
    }
  }, [googleSheetsConnected, googleSheetsConfig]);

  const forceInitializeGoogleSheet = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    showConfirm({
      title: 'Force Initialize Sheet',
      message: 'This will completely clear the sheet and create new headers. All existing data will be lost. Continue?',
      confirmText: 'Force Initialize',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Set loading state for confirmation button (don't hide dialog yet)
          setConfirmLoading(true);
          
          showSuccess('Force Initializing...', 'Clearing sheet and creating headers...');
          
          // Import and use Google Sheets service
          const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
          const sheetsService = createGoogleSheetsService(
            googleSheetsConfig.spreadsheetId,
            googleSheetsConfig.credentials
          );
          
          const success = await sheetsService.forceInitializeSheet();
          
          if (success) {
            showSuccess('Sheet Force-Initialized', 'Google Sheet has been completely reset with new headers!');
          } else {
            showError('Force Initialization Failed', 'Failed to force-initialize the Google Sheet');
          }
          
          // Now hide the confirmation dialog after operation completes
          hideConfirm();
        } catch (error) {
          console.error('Sheet force-initialization error:', error);
          showError('Force Initialization Failed', 'Failed to force-initialize the Google Sheet');
          
          // Hide dialog on error too
          hideConfirm();
        } finally {
          // Always reset loading state
          setConfirmLoading(false);
        }
      }
    });
  }, [googleSheetsConnected, googleSheetsConfig]);

  const clearGoogleSheet = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    showConfirm({
      title: 'Clear Sheet Data',
      message: 'This will remove all weld data from Google Sheets but keep the headers. This action cannot be undone.',
      confirmText: 'Clear Data',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Set loading state for confirmation button (don't hide dialog yet)
          setConfirmLoading(true);
          
          console.log('Starting to clear Google Sheet...');
          showSuccess('Clearing...', 'Removing sheet data...');
          
          // Import and use Google Sheets service
          const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
          const sheetsService = createGoogleSheetsService(
            googleSheetsConfig.spreadsheetId,
            googleSheetsConfig.credentials
          );
          
          console.log('Google Sheets service created, calling clearSheet...');
          const success = await sheetsService.clearSheet();
          console.log('clearSheet result:', success);
          
          if (success) {
            showSuccess('Sheet Cleared', 'All data has been removed from Google Sheets. Headers are preserved.');
          } else {
            showError('Clear Failed', 'Failed to clear the Google Sheet. Check console for details.');
          }
          
          // Now hide the confirmation dialog after operation completes
          hideConfirm();
        } catch (error) {
          console.error('Sheet clear error:', error);
          showError('Clear Failed', `Failed to clear the Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Hide dialog on error too
          hideConfirm();
        } finally {
          // Always reset loading state
          setConfirmLoading(false);
        }
      }
    });
  }, [googleSheetsConnected, googleSheetsConfig]);

  const debugGoogleSheet = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    try {
      showSuccess('Debugging...', 'Checking sheet state...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      const debugInfo = await sheetsService.debugSheet();
      
      if (debugInfo) {
        const debugMessage = `Sheet Debug Info:
• Total Rows: ${debugInfo.totalRows}
• Total Columns: ${debugInfo.totalColumns}
• First Cell Value: "${debugInfo.firstCellValue}"
• First Cell Type: ${debugInfo.firstCellType}
• Sheet Name: ${debugInfo.sheetName}
• Last Row: ${debugInfo.lastRow}
• Last Column: ${debugInfo.lastColumn}`;
        
        showSuccess('Sheet Debug Info', debugMessage);
      } else {
        showError('Debug Failed', 'Failed to get sheet debug information');
      }
    } catch (error) {
      console.error('Sheet debug error:', error);
      showError('Debug Failed', 'Failed to debug the Google Sheet');
    }
  }, [googleSheetsConnected, googleSheetsConfig]);

  const compareWeldNumbers = useCallback(async () => {
    if (!googleSheetsConnected) {
      showError('Not Connected', 'Please connect to Google Sheets first');
      return;
    }
    
    try {
      showSuccess('Comparison Started', 'Comparing weld numbers between app and Google Sheets...');
      
      // Import and use Google Sheets service
      const { createGoogleSheetsService } = await import('./src/services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(
        googleSheetsConfig.spreadsheetId,
        googleSheetsConfig.credentials
      );
      
      // Get all weld numbers from the app
      const allWeldNumbers = [...welds, ...trashWelds].map(w => w.weldNumber);
      console.log('App weld numbers:', allWeldNumbers);
      
      const result = await sheetsService.compareWeldNumbers(allWeldNumbers);
      if (result.success && result.comparison) {
        const { comparison } = result;
        const message = `Comparison Complete!\n\nSheet: ${comparison.totalInSheet} welds\nApp: ${comparison.totalInApp} welds\n\nMissing in Sheet: ${comparison.missingInSheet.length}\nMissing in App: ${comparison.missingInApp.length}`;
        
        showSuccess('Comparison Complete', message);
        console.log('Weld number comparison:', comparison);
        
        // Show detailed comparison in console
        if (comparison.missingInSheet.length > 0) {
          console.log('Weld numbers missing in sheet:', comparison.missingInSheet);
        }
        if (comparison.missingInApp.length > 0) {
          console.log('Weld numbers in sheet but not in app:', comparison.missingInApp);
        }
      } else {
        showError('Comparison Failed', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error comparing weld numbers:', error);
      showError('Comparison Error', 'Failed to compare weld numbers');
    }
  }, [googleSheetsConnected, googleSheetsConfig, welds, trashWelds]);

  // Debug function to check AsyncStorage
  const checkAsyncStorage = useCallback(async () => {
    try {
      const configData = await AsyncStorage.getItem('googleSheetsConfig');
      console.log('Current AsyncStorage config:', configData);
      
      if (configData) {
        const config = JSON.parse(configData);
        showSuccess('AsyncStorage Check', `Found config:\nID: ${config.spreadsheetId}\nEmail: ${config.credentials?.client_email}\nParsed: ${JSON.stringify(config, null, 2)}`);
      } else {
        showSuccess('AsyncStorage Check', 'No Google Sheets config found in AsyncStorage');
      }
    } catch (error) {
      showError('AsyncStorage Check', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Utility function to convert app status to Google Sheets status
  const convertStatusToSheet = (status: string): string => {
    switch (status) {
      case 'deleted':
        return 'Deleted';
      case 'pending':
      case 'approved':
      case 'rejected':
        return 'Active';
      default:
        return 'Active';
    }
  };

  // Utility function to convert Google Sheets status to app status
  const convertStatusFromSheet = (status: string): string => {
    switch (status) {
      case 'Deleted':
        return 'deleted';
      case 'Active':
        return 'pending'; // Default to pending for active items
      default:
        return 'pending';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            welds={welds}
            trashWelds={trashWelds}
            onAddWeld={handleAddWeld}
            onViewWeld={viewWeld}
            onEditWeld={editWeld}
            onDeleteWeld={deleteWeld}
            onRecoverWeld={recoverWeld}
            onPermanentlyDeleteWeld={permanentlyDeleteWeld}
            onNavigate={setCurrentScreen}
          />
        );
      case 'add':
        return (
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            enabled={true}
          >
            <WeldFormScreen
              formData={formData}
              isEditMode={isEditMode}
              onUpdateField={updateField}
              onSave={addWeld}
              onBack={handleBack}
            />
          </KeyboardAvoidingView>
        );
      case 'view':
        return selectedWeld ? (
          <WeldViewScreen
            weld={selectedWeld}
            onEdit={editWeld}
            onDelete={deleteWeld}
            onBack={handleBack}
          />
        ) : null;
      case 'settings':
        return (
          <View style={styles.settingsContainer}>
            <View style={styles.settingsHeader}>
              <TouchableOpacity style={styles.settingsBackButton} onPress={handleBack}>
                <Icon name="chevron-back" size={20} color="#3b82f6" />
                <Text style={styles.settingsBackButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <Text style={styles.settingsSubtitle}>App configuration and preferences</Text>
              
              {/* Stats Row - 2 columns */}
              <View style={styles.statsRow}>
                <View style={styles.statsColumn}>
                  <Text style={styles.statsLabel}>Total Welds</Text>
                  <Text style={styles.statsValue}>{welds.length}</Text>
                </View>
                <View style={styles.statsColumn}>
                  <Text style={styles.statsLabel}>Trashed Items</Text>
                  <Text style={styles.statsValue}>{trashWelds.length}</Text>
                </View>
              </View>
              
              {/* Database Status - Single column */}
              <View style={styles.settingsItem}>
                <Text style={styles.settingsItemLabel}>Database Status</Text>
                <Text style={styles.settingsItemValue}>
                  {welds.length > 0 ? '✅ Active' : '❌ Empty'}
                </Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={confirmResetToSampleData}>
                <Text style={styles.resetButtonText}>🔄 Reset to Sample Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resetButton, styles.clearButton]} onPress={clearAllData}>
                <Text style={styles.resetButtonText}>🗑️ Clear All Data</Text>
              </TouchableOpacity>

              {/* Google Sheets Integration Section */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>📊 Google Sheets Integration</Text>
                <Text style={styles.settingsSectionSubtitle}>Sync your weld data with Google Sheets</Text>
                
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsItemLabel}>Connection Status</Text>
                  <Text style={styles.settingsItemValue}>
                    {googleSheetsConnected ? '✅ Connected' : '❌ Not Connected'}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.googleSheetsButton} onPress={openGoogleSheetsSettings}>
                  <Text style={styles.googleSheetsButtonText}>
                    {googleSheetsConnected ? '⚙️ Configure Sheets' : '🔗 Connect to Sheets'}
                  </Text>
                </TouchableOpacity>
                
                              {googleSheetsConnected && (
                <>
                  <TouchableOpacity style={styles.syncButton} onPress={syncToGoogleSheets}>
                    <Text style={styles.syncButtonText}>🔄 Sync to Google Sheets</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.syncFromButton} onPress={syncFromGoogleSheets}>
                    <Text style={styles.syncFromButtonText}>⬇️ Sync from Google Sheets</Text>
                  </TouchableOpacity>
                  
                  {/* Sheet Management Buttons */}
                  <View style={styles.sheetManagementSection}>
                    <Text style={styles.sheetManagementTitle}>📋 Sheet Management</Text>
                    <TouchableOpacity 
                      style={styles.initializeButton} 
                      onPress={initializeGoogleSheet}
                    >
                      <Text style={styles.initializeButtonText}>📝 Initialize Sheet Headers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.forceInitializeButton} 
                      onPress={forceInitializeGoogleSheet}
                    >
                      <Text style={styles.forceInitializeButtonText}>⚡ Force Initialize Headers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.clearButton} 
                      onPress={clearGoogleSheet}
                    >
                      <Text style={styles.clearButtonText}>🗑️ Clear Sheet Data</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Auto-Sync Settings */}
                  <View style={styles.autoSyncSection}>
                    <Text style={styles.autoSyncTitle}>🔄 Auto-Sync Settings</Text>
                    <Text style={styles.autoSyncSubtitle}>Automatically sync changes to Google Sheets</Text>
                    
                    <View style={styles.settingsItem}>
                      <Text style={styles.settingsItemLabel}>Auto-Sync Status</Text>
                      <Text style={styles.settingsItemValue}>
                        {googleSheetsConnected ? '✅ Enabled' : '❌ Disabled'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.syncChangedButton} onPress={() => syncChangedWeldsToGoogleSheets(welds)}>
                      <Text style={styles.syncChangedButtonText}>🔄 Sync Changed Welds</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              
              {/* Debug Info */}
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Debug: ID = {googleSheetsConfig.spreadsheetId || 'None'}</Text>
                <Text style={styles.debugText}>Debug: Connected = {googleSheetsConnected ? 'Yes' : 'No'}</Text>
                                  <TouchableOpacity style={styles.debugButton} onPress={checkAsyncStorage}>
                    <Text style={styles.debugButtonText}>🔍 Check AsyncStorage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.debugButton} onPress={debugGoogleSheet}>
                    <Text style={styles.debugButtonText}>🐛 Debug Sheet State</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.debugButton} onPress={compareWeldNumbers}>
                    <Text style={styles.debugButtonText}>🔍 Compare Weld Numbers</Text>
                  </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
        hidden={Platform.OS === 'android'}
      />
      {renderScreen()}
      {/* Bottom Navigation - Only show on home screen */}
      {currentScreen === 'home' && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            if (screen === 'add') {
              setCurrentScreen('add');
            } else {
              setCurrentScreen(screen);
            }
          }}
        />
      )}

      {confirmVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirmTitle}</Text>
            <Text style={styles.modalMessage}>{confirmMessage}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={hideConfirm}
                disabled={confirmLoading}
              >
                <Text style={styles.modalButtonText}>{confirmCancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.modalButtonConfirm,
                  confirmLoading && styles.modalButtonDisabled
                ]}
                onPress={async () => {
                  if (confirmLoading) return; // Prevent multiple clicks
                  
                  console.log('Confirm button pressed, calling onConfirm...');
                  setConfirmLoading(true); // Set loading state
                  
                  if (confirmActionRef.current) {
                    try {
                      await confirmActionRef.current();
                    } catch (error) {
                      console.error('Error in confirm action:', error);
                      setConfirmLoading(false); // Reset loading on error
                    }
                  } else {
                    console.log('No confirm action found, hiding dialog...');
                    hideConfirm();
                  }
                }}
                disabled={confirmLoading}
              >
                <Text style={styles.modalButtonText}>
                  {confirmLoading ? '⏳ Processing...' : confirmConfirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {successVisible && (
        <View style={[
          styles.pushNotification,
          {
            transform: [{ translateY: successAnimation ? 0 : -100 }],
            opacity: successAnimation ? 1 : 0,
          }
        ]}>
          <View style={styles.pushNotificationContent}>
            <Text style={styles.pushNotificationTitle}>{successTitle}</Text>
            <Text style={styles.pushNotificationMessage}>{successMessage}</Text>
          </View>
        </View>
      )}

      {errorVisible && (
        <View style={[
          styles.pushNotificationError,
          {
            transform: [{ translateY: errorAnimation ? 0 : -100 }],
            opacity: errorAnimation ? 1 : 0,
          }
        ]}>
          <View style={styles.pushNotificationContent}>
            <Text style={styles.pushNotificationTitle}>{errorTitle}</Text>
            <Text style={styles.pushNotificationMessage}>{errorMessage}</Text>
          </View>
        </View>
      )}

      {/* Google Sheets Configuration Modal */}
      <GoogleSheetsConfigModal
        visible={googleSheetsModalVisible}
        onClose={closeGoogleSheetsModal}
        onSave={saveGoogleSheetsConfig}
        currentConfig={googleSheetsConfig}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  settingsBackButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  settingsTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  settingsSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 40,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItemLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  settingsItemValue: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#dc2626', // A darker red for the clear all button
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  settingsSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  settingsSectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  googleSheetsButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleSheetsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  syncButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  syncFromButton: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  syncFromButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  debugButton: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  sheetManagementSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetManagementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  initializeButton: {
    backgroundColor: '#8b5cf6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  initializeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  forceInitializeButton: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  forceInitializeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  autoSyncSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  autoSyncTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  autoSyncSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  syncChangedButton: {
    backgroundColor: '#06b6d4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  syncChangedButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#9ca3af',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  modalButtonTextConfirm: {
    color: '#ffffff',
  },
  // Success popup specific styles - neutral card with green top border
  successCard: {
    borderTopWidth: 4,
    borderTopColor: '#10b981',
  },
  successTitle: {
    color: '#10b981',
  },
  successMessage: {
    color: '#059669',
  },
  successButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successActions: {
    marginTop: 16,
    alignItems: 'center',
  },
  // Error popup specific styles - neutral card with red top border
  errorCard: {
    borderTopWidth: 4,
    borderTopColor: '#ef4444',
  },
  errorTitle: {
    color: '#ef4444',
  },
  errorMessage: {
    color: '#dc2626',
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorActions: {
    marginTop: 16,
    alignItems: 'center',
  },
  pushNotification: {
    position: 'absolute',
    top: 20,
    left: 15,
    right: 15,
    backgroundColor: '#10b981', // Green background
    padding: 15,
    zIndex: 9998, // Below modal, but above other content
    elevation: 9998,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pushNotificationContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pushNotificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  pushNotificationMessage: {
    fontSize: 14,
    color: '#475569',
    flexShrink: 1, // Allow message to shrink if title is long
  },
  pushNotificationError: {
    position: 'absolute',
    top: 20,
    left: 15,
    right: 15,
    backgroundColor: '#ef4444', // Red background for error
    padding: 15,
    zIndex: 9998, // Below modal, but above other content
    elevation: 9998,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statsColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '700',
    textAlign: 'center',
  },

});
