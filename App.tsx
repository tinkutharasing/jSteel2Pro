import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, View, Text, StyleSheet, BackHandler, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Weld, WeldFormData, Screen } from './src/types/Weld';
import { WeldCardData } from './src/types/WeldCard';
import { HomeScreen } from './src/screens/HomeScreen';
import { BulkWeldEditorScreen } from './src/screens/BulkWeldEditorScreen';
import WeldPrintView from './src/screens/WeldPrintView';

import { BottomNavigation } from './src/components/BottomNavigation';
import { GoogleSheetsConfigModal } from './src/components/GoogleSheetsConfigModal';
import { getCurrentDateISO } from './src/utils/dateUtils';
import { GoogleSheetsService } from './src/services/GoogleSheetsService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  
  // Detect if we're on a tablet or large screen
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const { width, height } = Dimensions.get('window');
      // In landscape mode, width is typically larger than height
      // Consider it a tablet if width > 768 or if it's a landscape device
      setIsTablet(width > 768 || (width > height && width > 600));
    };
    
    checkScreenSize();
    const subscription = Dimensions.addEventListener('change', checkScreenSize);
    return () => subscription?.remove();
  }, []);
  
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
  const [syncEnabled, setSyncEnabled] = useState(true); // New state for sync toggle
  const [securityPin, setSecurityPin] = useState('1234'); // Default PIN for destructive operations
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingDestructiveAction, setPendingDestructiveAction] = useState<(() => void) | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const [welds, setWelds] = useState<Weld[]>([]);
  const [weldCards, setWeldCards] = useState<WeldCardData[]>([]);

  const [trashWelds, setTrashWelds] = useState<Weld[]>([]);
  const [trashCards, setTrashCards] = useState<WeldCardData[]>([]);
  const [selectedWeld, setSelectedWeld] = useState<Weld | null>(null);
  const [selectedCard, setSelectedCard] = useState<WeldCardData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<WeldFormData>({
    // Header Information
    cardId: '',
    date: getCurrentDateISO(),
    
    // Weld Table Columns - Simplified
    weldNumber: '',
    widNumber: '',
    pipeSizeInches: '',
    typeOfWeld: '',
    capSize: '',
    passes: '',
    wpsNumberAndTitle: '',
    electrodeTypeBrand: '',
    rt: '',
    
    // Legacy fields (kept for compatibility)
    welderCompany: false,
    welderContractor: false,
    loaTccMod: '',
    weldingContractorName: '',
    woJoNumber: '',
    weldingInspectorName: '',
    weldingInspectionCompany: '',
    numberOfWeldsMadeToday: '',
    stencilNumber: '',
    processUsed: '',
    butt: '',
    fillet: '',
    
    // Image Fields
    weldSketch: '',
    weldSketchDescription: '',
    welderSignature: '',
    inspectorSignature: '',
    
    // Metadata
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
      await loadWeldCards();
      await loadTrashWelds();
      await loadTrashCards();
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

  const loadWeldCards = async () => {
    try {
      const stored = await AsyncStorage.getItem('weldCards');
      if (stored) {
        setWeldCards(JSON.parse(stored));
      } else {
        console.log('No weld cards found in storage; leaving state empty');
        setWeldCards([]);
      }
    } catch (error) {
      console.error('Error loading weld cards:', error);
    }
  };

  const saveWeldCards = async (cards: WeldCardData[]) => {
    try {
      await AsyncStorage.setItem('weldCards', JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving weld cards:', error);
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

  const loadTrashCards = async () => {
    try {
      const stored = await AsyncStorage.getItem('trashCards');
      if (stored) {
        setTrashCards(JSON.parse(stored));
      } else {
        // No stored data – do NOT auto-seed; keep empty
        console.log('No trash cards found in storage; leaving state empty');
        setTrashCards([]);
      }
    } catch (error) {
      console.error('Error loading trash cards:', error);
    }
  };

  // Load Google Sheets configuration from AsyncStorage
  const loadGoogleSheetsConfig = async () => {
    try {
      console.log('Loading Google Sheets config from AsyncStorage...');
      const configData = await AsyncStorage.getItem('googleSheetsConfig');
      const syncData = await AsyncStorage.getItem('syncEnabled');
      console.log('Raw config data from AsyncStorage:', configData);
      console.log('Raw sync data from AsyncStorage:', syncData);
      
      if (configData) {
        const config = JSON.parse(configData);
        console.log('Parsed config:', config);
        setGoogleSheetsConfig(config);
        setGoogleSheetsConnected(true);
        console.log('Config loaded and state updated');
      } else {
        console.log('No config found in AsyncStorage');
      }
      
      if (syncData !== null) {
        setSyncEnabled(JSON.parse(syncData));
        console.log('Sync setting loaded:', JSON.parse(syncData));
      }
    } catch (error) {
      console.log('Failed to load Google Sheets config:', error);
    }
  };

  // Save sync enabled setting to AsyncStorage
  const saveSyncSetting = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('syncEnabled', JSON.stringify(enabled));
      setSyncEnabled(enabled);
      console.log('Sync setting saved:', enabled);
    } catch (error) {
      console.error('Failed to save sync setting:', error);
    }
  };

  // PIN Authentication Functions
  const authenticateUser = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setPendingDestructiveAction(() => () => resolve(true));
      setPinInput('');
      setShowPinModal(true);
    });
  };

  const verifyPin = (inputPin: string): boolean => {
    return inputPin === securityPin;
  };

  const showPinPrompt = (action: () => void) => {
    setPendingDestructiveAction(() => action);
    setPinInput('');
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    if (verifyPin(pinInput)) {
      setShowPinModal(false);
      setPinInput('');
      if (pendingDestructiveAction) {
        pendingDestructiveAction();
        setPendingDestructiveAction(null);
      }
    } else {
      setPinInput('');
      showError('Invalid PIN', 'Please enter the correct 4-digit PIN');
    }
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    setPinInput('');
    setPendingDestructiveAction(null);
  };

  // Import data function
  const importData = useCallback((importedCards: WeldCardData[]) => {
    try {
      // Merge imported cards with existing ones
      const updatedWeldCards = [...weldCards, ...importedCards];
      setWeldCards(updatedWeldCards);
      
      // Save to AsyncStorage
      AsyncStorage.setItem('weldCards', JSON.stringify(updatedWeldCards));
      
      showSuccess('Import Successful', `Successfully imported ${importedCards.length} cards!`);
    } catch (error) {
      console.error('Error importing data:', error);
      showError('Import Failed', 'Failed to import data');
    }
  }, [weldCards]);

  // Recover all trashed cards function
  const recoverAllTrashCards = async () => {
    try {
      console.log('Attempting to recover all trashed cards...');
      
      if (trashCards.length === 0) {
        showError('No Trash Data', 'No trashed cards to recover');
        return;
      }
      
      // Move all trash cards back to active weld cards
      const updatedWeldCards = [...weldCards, ...trashCards];
      const updatedTrashCards: WeldCardData[] = [];
      
      // Update local state
      setWeldCards(updatedWeldCards);
      setTrashCards(updatedTrashCards);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem('weldCards', JSON.stringify(updatedWeldCards));
        await AsyncStorage.setItem('trashCards', JSON.stringify(updatedTrashCards));
        showSuccess('Recovery Successful', `Successfully recovered ${trashCards.length} trashed cards!`);
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
        showError('Save Error', 'Failed to save recovered cards');
      }
      
    } catch (error) {
      console.error('Error during recovery:', error);
      showError('Recovery Failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePinChange = () => {
    setShowPinChangeModal(true);
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handlePinChangeSubmit = () => {
    if (newPinInput.length !== 4 || confirmPinInput.length !== 4) {
      showError('Invalid PIN', 'Please enter 4-digit PINs');
      return;
    }
    
    if (newPinInput !== confirmPinInput) {
      showError('PIN Mismatch', 'The two PINs do not match');
      setConfirmPinInput('');
      return;
    }
    
    if (!/^\d{4}$/.test(newPinInput)) {
      showError('Invalid PIN', 'PIN must contain only numbers');
      return;
    }
    
    setSecurityPin(newPinInput);
    setShowPinChangeModal(false);
    setNewPinInput('');
    setConfirmPinInput('');
    showSuccess('PIN Updated', 'Security PIN has been updated successfully!');
  };

  const handlePinChangeCancel = () => {
    setShowPinChangeModal(false);
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const resetDatabase = async () => {
          try {
        console.log('Resetting database...');
      
              // If connected to Google Sheets and sync enabled, clear existing data
      if (googleSheetsConnected && syncEnabled) {
                  console.log('Syncing database reset to Google Sheets...');
        
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
        
        // Sample data functionality removed - app now starts empty
        console.log('Sample data functionality has been removed');
      }
      
      await AsyncStorage.removeItem('welds');
      await AsyncStorage.removeItem('trashWelds');
      await AsyncStorage.setItem('welds', JSON.stringify([]));
      await AsyncStorage.setItem('trashWelds', JSON.stringify([]));
      setWelds([]);
      setTrashWelds([]);
      console.log('All data cleared successfully');
      showSuccess('Success', 'Database reset! All data has been cleared.');
    } catch (error) {
      console.error('Error resetting database:', error);
      showError('Error', 'Failed to reset database');
    }
  };

  const clearAllData = async () => {
    // First authenticate the user
    const isAuthenticated = await authenticateUser();
    if (!isAuthenticated) {
      return; // User cancelled or authentication failed
    }

    // Then show confirmation dialog
    showConfirm({
      title: 'Clear All Data',
      message: 'This will remove all welds and trash data. This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          console.log('Clearing all data...');
          
          // If connected to Google Sheets and sync enabled, completely clear the sheet
          if (googleSheetsConnected && syncEnabled) {
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
          if (googleSheetsConnected && syncEnabled) {
            showSuccess('Success', 'All data cleared from app and Google Sheets!');
          } else {
            showSuccess('Success', 'All data cleared from app!');
          }
        } catch (error) {
          console.error('Error clearing data:', error);
          hideConfirm();
          showError('Error', 'Failed to clear data');
        }
      }
    });
  };

  const confirmResetDatabase = () => {
    // First authenticate the user
    authenticateUser().then((isAuthenticated) => {
      if (isAuthenticated) {
        // Then show confirmation dialog
        showConfirm({
          title: 'Reset Database',
          message: 'This will clear all current data and start fresh.',
          confirmText: 'Reset',
          cancelText: 'Cancel',
          onConfirm: async () => {
            await resetDatabase();
            hideConfirm();
          }
        });
      }
    });
  };

  const showDatabaseStatus = async () => {
    try {
      const storedWelds = await AsyncStorage.getItem('welds');
      const storedTrash = await AsyncStorage.getItem('trashWelds');
      const message = `Current State:\n• Active Welds: ${welds.length}\n• Trash Items: ${trashWelds.length}\n\nStorage Status:\n• Welds in AsyncStorage: ${storedWelds ? 'Yes' : 'No'}\n• Trash in AsyncStorage: ${storedTrash ? 'Yes' : 'No'}`;
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
      
      // Auto-sync to Google Sheets if connected and sync enabled
      // Note: This function triggers auto-sync - use direct AsyncStorage.save for trash/restore operations
      if (googleSheetsConnected && syncEnabled) {
        // Use setTimeout to make the sync non-blocking
        setTimeout(() => {
          autoSyncToGoogleSheets(newWelds, trashWelds);
        }, 0);
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

  const updateField = useCallback((field: keyof WeldFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetForm = () => {
    setFormData({
      // Header Information
      welderName: '',
      date: getCurrentDateISO(),
      jobLocation: '',
      
      // Weld Table Columns - Simplified
      weldNumber: '',
      widNumber: '',
      pipeSizeInches: '',
      typeOfWeld: '',
      capSize: '',
      passes: '',
      wpsNumberAndTitle: '',
      electrodeTypeBrand: '',
      rt: '',
      
      // Legacy fields (kept for compatibility)
      welderCompany: false,
      welderContractor: false,
      loaTccMod: '',
      weldingContractorName: '',
      woJoNumber: '',
      weldingInspectorName: '',
      weldingInspectionCompany: '',
      numberOfWeldsMadeToday: '',
      stencilNumber: '',
      processUsed: '',
      butt: '',
      fillet: '',
      
      // Image Fields
      weldSketch: '',
      weldSketchDescription: '',
      welderSignature: '',
      
      // Metadata
    });
    setIsEditMode(false);
  };

  const addWeld = async () => {
    // Validate required fields
    if (!formData.weldNumber?.trim()) {
      showError('Validation Error', 'Weld Number is required');
      return;
    }

    try {
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
        await saveWelds(updatedWelds);
        showSuccess('Success', 'Weld updated successfully!');
      } else {
        // Check for duplicate weld number locally
        const existingWeld = welds.find(weld => weld.weldNumber === formData.weldNumber);
        if (existingWeld) {
          showError('Duplicate Weld Number', `Weld number ${formData.weldNumber} already exists. Please use a unique weld number.`);
          return;
        }
        
        // Add new weld
        const newWeld: Weld = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to local state
        const updatedWelds = [newWeld, ...welds];
        setWelds(updatedWelds);
        await saveWelds(updatedWelds);
        
        // Sync to Google Sheets if connected and enabled
        if (googleSheetsConnected && syncEnabled) {
          try {
            const sheetsService = new GoogleSheetsService();
            const result = await sheetsService.addWeld(newWeld);
            if (result.success) {
              console.log('Weld added to Google Sheets successfully');
            } else {
              console.error('Failed to add weld to Google Sheets:', result.message);
            }
          } catch (error) {
            console.error('Error syncing to Google Sheets:', error);
          }
        }
        
        showSuccess('Success', 'Weld added successfully!');
      }
      
      // Reset form and navigate back to home
      resetForm();
      setCurrentScreen('home');
      
    } catch (error) {
      console.error('Error adding/updating weld:', error);
      showError('Error', 'Failed to save weld');
    }
  };

  const handleBulkSaveWelds = async (bulkWelds: Weld[]) => {
    try {
      // Validate that all welds have required fields
      const validWelds = bulkWelds.filter(weld => weld.weldNumber?.trim());
      
      if (validWelds.length === 0) {
        showError('Validation Error', 'At least one weld with a weld number is required');
        return;
      }

      // Check for duplicate weld numbers
      const weldNumbers = validWelds.map(w => w.weldNumber.trim());
      const duplicateNumbers = weldNumbers.filter((num, index) => weldNumbers.indexOf(num) !== index);
      
      if (duplicateNumbers.length > 0) {
        showError('Duplicate Weld Numbers', `Duplicate weld numbers found: ${duplicateNumbers.join(', ')}`);
        return;
      }

      // Check for conflicts with existing welds (excluding the welds being edited)
      const existingWeldNumbers = welds.map(w => w.weldNumber);
      const conflictingNumbers = validWelds
        .filter(w => {
          // Skip validation for new welds (temp IDs)
          if (w.id.startsWith('temp-')) return false;
          
          // For existing welds, check if the weld number conflicts with OTHER existing welds
          const otherExistingWelds = existingWeldNumbers.filter((_, index) => 
            welds[index].id !== w.id
          );
          return otherExistingWelds.includes(w.weldNumber);
        })
        .map(w => w.weldNumber);

      if (conflictingNumbers.length > 0) {
        showError('Weld Number Conflict', `Weld numbers already exist: ${conflictingNumbers.join(', ')}`);
        return;
      }

      // Process welds - update existing or create new
      const updatedWelds = [...welds];
      const newWelds: Weld[] = [];

      for (const bulkWeld of validWelds) {
        if (bulkWeld.id.startsWith('temp-')) {
          // This is a new weld
          const newWeld: Weld = {
            ...bulkWeld,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newWelds.push(newWeld);
          updatedWelds.push(newWeld);
        } else {
          // This is an existing weld being updated
          const existingIndex = updatedWelds.findIndex(w => w.id === bulkWeld.id);
          if (existingIndex !== -1) {
            updatedWelds[existingIndex] = {
              ...updatedWelds[existingIndex],
              ...bulkWeld,
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }

      // Save to local storage
      setWelds(updatedWelds);
      await saveWelds(updatedWelds);

      // Sync to Google Sheets if connected and enabled
      if (googleSheetsConnected && syncEnabled && newWelds.length > 0) {
        try {
          const sheetsService = new GoogleSheetsService();
          for (const newWeld of newWelds) {
            const result = await sheetsService.addWeld(newWeld);
            if (!result.success) {
              console.error(`Failed to sync weld ${newWeld.weldNumber} to Google Sheets:`, result.message);
            }
          }
        } catch (error) {
          console.error('Error syncing to Google Sheets:', error);
        }
      }

      showSuccess('Success', `${validWelds.length} welds saved successfully!`);
      setCurrentScreen('home');
      
    } catch (error) {
      console.error('Error saving bulk welds:', error);
      showError('Error', 'Failed to save welds');
    }
  };

  const handleSaveCard = async (card: WeldCardData) => {
    try {
      // Validate card has welds
      if (card.welds.length === 0) {
        showError('No Welds', 'Please add at least one weld to the card before saving.');
        return;
      }

      // Check for duplicate weld numbers within the card
      const weldNumbers = card.welds.map(w => w.weldNumber.trim()).filter(n => n !== '');
      const duplicateNumbers = weldNumbers.filter((number, index) => 
        weldNumbers.indexOf(number) !== index
      );

      if (duplicateNumbers.length > 0) {
        showError('Duplicate Weld Numbers', `The following weld numbers are duplicated: ${duplicateNumbers.join(', ')}. Please fix this before saving.`);
        return;
      }

      // Update or create the weld card
      const updatedWeldCards = [...weldCards];
      
      // If cardId starts with "new-card-", always create a new card
      if (card.cardId.startsWith('new-card-')) {
        // Create new card with auto-incremental ID
        const newCard: WeldCardData = {
          ...card,
          cardId: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedWeldCards.push(newCard);
        console.log('Created new card:', newCard.cardId);
      } else {
        // Check if this is an existing card to update
        const existingCardIndex = updatedWeldCards.findIndex(c => c.cardId === card.cardId);
        
        if (existingCardIndex !== -1) {
          // Update existing card
          updatedWeldCards[existingCardIndex] = {
            ...card,
            updatedAt: new Date().toISOString(),
          };
          console.log('Updated existing card:', card.cardId);
        } else {
          // Create new card with auto-incremental ID (fallback)
          const newCard: WeldCardData = {
            ...card,
            cardId: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updatedWeldCards.push(newCard);
          console.log('Created new card:', newCard.cardId);
        }
      }

      // Update weld cards state and save to storage
      setWeldCards(updatedWeldCards);
      await saveWeldCards(updatedWeldCards);

      // Also update individual welds for backward compatibility
      const allWelds: Weld[] = [];
      updatedWeldCards.forEach(cardData => {
        cardData.welds.forEach(weld => {
          allWelds.push({
            ...weld,
            cardId: cardData.cardId,
            date: cardData.date,
          });
        });
      });
      
      setWelds(allWelds);
      await saveWelds(allWelds);

      showSuccess('Success', `Card with ${card.welds.length} welds saved successfully!`);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error saving card:', error);
      showError('Error', 'Failed to save card');
    }
  };

  const editWeld = (weld: Weld, index: number) => {
    // Find the card that contains this weld
    const parentCard = weldCards.find(card => 
      card.welds.some(w => w.id === weld.id)
    );
    
    if (parentCard) {
      // Set the selected card to edit
      setSelectedCard(parentCard);
      // Navigate to bulk edit with the existing card
      setCurrentScreen('bulk-edit');
    } else {
      // Fallback: if no card found, create a new card with this weld
      const newCard: WeldCardData = {
        cardId: `card-${Date.now()}`,
        date: weld.date,
        weldSketch: weld.weldSketch || '',
        weldSketchDescription: weld.weldSketchDescription || '',
        welderSignature: weld.welderSignature || '',
        welds: [weld],
        createdAt: weld.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedCard(newCard);
      setCurrentScreen('bulk-edit');
    }
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
          
          // If connected to Google Sheets and sync enabled, delete the weld from the sheet
          if (googleSheetsConnected && syncEnabled) {
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
          
          // Find the parent card that contains this weld
          const parentCard = weldCards.find(card => 
            card.welds.some(w => w.id === weld.id)
          );
          
          if (!parentCard) {
            showError('Error', 'Could not find the parent card for this weld');
            hideConfirm();
            return;
          }
          
          // Remove the weld from the parent card
          const updatedParentCard = {
            ...parentCard,
            welds: parentCard.welds.filter(w => w.id !== weld.id)
          };
          
          // If the parent card still has other welds, keep it in active cards
          // If it's empty, move the entire card to trash
          let updatedWeldCards = [...weldCards];
          let updatedTrashCards = [...trashCards];
          
          if (updatedParentCard.welds.length === 0) {
            // Card is empty, remove it completely
            updatedWeldCards = weldCards.filter(card => card.cardId !== parentCard.cardId);
          } else {
            // Card still has welds, update it
            updatedWeldCards = weldCards.map(card => 
              card.cardId === parentCard.cardId ? updatedParentCard : card
            );
          }
          
          // Add the deleted weld to trash (as a single-weld card)
          const trashCard: WeldCardData = {
            cardId: `trash-${weld.id}-${Date.now()}`,
            date: weld.date,
            weldSketch: weld.weldSketch || '',
            weldSketchDescription: weld.weldSketchDescription || '',
            welderSignature: weld.welderSignature || '',
            welds: [weld],
            createdAt: weld.createdAt,
            updatedAt: new Date().toISOString()
          };
          
          updatedTrashCards = [trashCard, ...trashCards];
          
          // Update local state
          setWeldCards(updatedWeldCards);
          setTrashCards(updatedTrashCards);
          
          // Save all data without triggering auto-sync (since we're just moving to trash)
          try {
            await AsyncStorage.setItem('weldCards', JSON.stringify(updatedWeldCards));
            await AsyncStorage.setItem('trashCards', JSON.stringify(updatedTrashCards));
          } catch (error) {
            console.error('Error saving to AsyncStorage:', error);
          }
          
          if (googleSheetsConnected && syncEnabled) {
            showSuccess('Moved to Trash', `${weld.weldNumber} has been moved to trash and deleted from Google Sheets.`);
          } else {
            showSuccess('Moved to Trash', `${weld.weldNumber} has been moved to trash locally.`);
          }
          
          // Debug: Compare weld IDs to help troubleshoot (only when sync enabled)
          if (googleSheetsConnected && syncEnabled) {
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

  const clearAllTrash = () => {
    showConfirm({
      title: 'Empty Trash',
      message: `Are you sure you want to permanently delete all ${trashCards.length} items in trash? This action cannot be undone.`,
      confirmText: 'Empty Trash',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          
          // Clear all trash cards
          setTrashCards([]);
          await AsyncStorage.removeItem('trashCards');
          await AsyncStorage.setItem('trashCards', JSON.stringify([]));
          
          showSuccess('Trash Emptied', 'All items in trash have been permanently deleted');
        } catch (error) {
          console.error('Error clearing trash:', error);
          showError('Error', 'Failed to empty trash');
        } finally {
          hideConfirm();
        }
      }
    });
  };

  const trashAllWelds = () => {
    showConfirm({
      title: 'Move All to Trash',
      message: `Are you sure you want to move all ${weldCards.length} active weld cards to trash? You can recover them later.`,
      confirmText: 'Move All to Trash',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          
          // Move all active weld cards to trash as complete cards
          const cardsToTrash = weldCards.map(card => ({ ...card, deletedAt: new Date().toISOString() }));
          const updatedTrashCards = [...trashCards, ...cardsToTrash];
          
          setTrashCards(updatedTrashCards);
          setWeldCards([]);
          setWelds([]);
          
          // Save to storage
          await AsyncStorage.setItem('weldCards', JSON.stringify([]));
          await AsyncStorage.setItem('welds', JSON.stringify([]));
          await AsyncStorage.setItem('trashCards', JSON.stringify(updatedTrashCards));
          
          showSuccess('Moved to Trash', `All ${weldCards.length} weld cards have been moved to trash`);
        } catch (error) {
          console.error('Error moving all weld cards to trash:', error);
          showError('Error', 'Failed to move weld cards to trash');
        } finally {
          hideConfirm();
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
          
          // Find the parent card in trash that contains this weld
          const parentCard = trashCards.find(card => 
            card.welds.some(w => w.id === weld.id)
          );
          
          if (!parentCard) {
            showError('Error', 'Could not find the parent card for this weld');
            hideConfirm();
            return;
          }
          
          // If connected to Google Sheets and sync enabled, add the weld back to the sheet
          if (googleSheetsConnected && syncEnabled) {
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
          
          // Remove the card from trash
          const updatedTrashCards = trashCards.filter(card => card.cardId !== parentCard.cardId);
          
          // Add the recovered card back to active cards
          const updatedWeldCards = [parentCard, ...weldCards];
          
          // Update local state first
          setTrashCards(updatedTrashCards);
          setWeldCards(updatedWeldCards);
          
          // Save directly to AsyncStorage without triggering auto-sync (since we're just recovering from trash)
          try {
            await AsyncStorage.setItem('trashCards', JSON.stringify(updatedTrashCards));
            await AsyncStorage.setItem('weldCards', JSON.stringify(updatedWeldCards));
          } catch (error) {
            console.error('Error saving to AsyncStorage:', error);
          }
          
          if (googleSheetsConnected && syncEnabled) {
            showSuccess('Recovered', `${weld.weldNumber} has been recovered successfully and added back to Google Sheets!`);
          } else {
            showSuccess('Recovered', `${weld.weldNumber} has been recovered successfully!`);
          }
          
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
          
          // Note: No need to delete from Google Sheets since the weld was already deleted when moved to trash
          // We use hard delete, so the weld is completely removed from the sheet when trashed
          if (googleSheetsConnected) {
            console.log(`Permanently deleting weld ${weld.weldNumber} (already removed from Google Sheets when trashed)`);
          }
          
          // Find the parent card in trash that contains this weld
          const parentCard = trashCards.find(card => 
            card.welds.some(w => w.id === weld.id)
          );
          
          if (!parentCard) {
            showError('Error', 'Could not find the parent card for this weld');
            hideConfirm();
            return;
          }
          
          // Remove the card from trash
          const updatedTrashCards = trashCards.filter(card => card.cardId !== parentCard.cardId);
          
          // Update local state first
          setTrashCards(updatedTrashCards);
          
          // Save to storage
          await AsyncStorage.setItem('trashCards', JSON.stringify(updatedTrashCards));
          
          showSuccess('Deleted', `${weld.weldNumber} has been permanently deleted from the app.`);
          
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



  const handleBack = () => {
    setCurrentScreen('home');
    // Clear selected weld when going back to home to avoid persistent highlighting
    setSelectedWeld(null);
    // Reset form data
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
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
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
      
      // Create a map of existing weld numbers for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, true);
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
          const weldExists = existingWeldMap.has(weld.weldNumber);
          
          if (weldExists) {
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
            const weldExists = existingWeldMap.has(trashedWeld.weldNumber);
            
            if (weldExists) {
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
  }, [googleSheetsConnected, googleSheetsConfig, welds, trashWelds, syncEnabled]);

  const autoSyncToGoogleSheets = useCallback(async (weldsToSync: Weld[], currentTrashWelds?: Weld[]) => {
    if (!googleSheetsConnected || !syncEnabled) {
      return; // Silent return for auto-sync if not connected or sync disabled
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
      
      // Create a map of existing weld numbers for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, true);
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
          const weldExists = existingWeldMap.has(weld.weldNumber);
          
          if (weldExists) {
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
      // Use the passed currentTrashWelds parameter or fall back to state
      const trashedWeldsToProcess = currentTrashWelds || trashWelds;
      
      if (trashedWeldsToProcess.length > 0) {
        console.log(`Auto-sync: Syncing ${trashedWeldsToProcess.length} trashed items to Google Sheets...`);
        
        trashedCount = 0;
        for (const trashedWeld of trashedWeldsToProcess) {
          try {
            // Check if this trashed weld already exists in Google Sheets
            const weldExists = existingWeldMap.has(trashedWeld.weldNumber);
            
            if (weldExists) {
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
  }, [googleSheetsConnected, googleSheetsConfig, trashWelds, syncEnabled]);

  const syncChangedWeldsToGoogleSheets = useCallback(async (changedWelds: Weld[]) => {
    if (!googleSheetsConnected || !syncEnabled || changedWelds.length === 0) {
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
      
      // Create a map of existing weld numbers for quick lookup
      existingSheetWelds.forEach(sheetWeld => {
        existingWeldMap.set(sheetWeld.weldNumber, true);
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
          const weldExists = existingWeldMap.has(weld.weldNumber);
          
          if (weldExists) {
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
  }, [googleSheetsConnected, googleSheetsConfig, syncEnabled]);

  const syncFromGoogleSheets = useCallback(async () => {
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
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
  }, [googleSheetsConnected, googleSheetsConfig, syncEnabled]);

  const initializeGoogleSheet = useCallback(async () => {
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
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
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
      return;
    }
    
    // First authenticate the user with PIN
    const isAuthenticated = await authenticateUser();
    if (!isAuthenticated) {
      return; // User cancelled or authentication failed
    }
    
    // Then show confirmation dialog
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
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
      return;
    }
    
    // First authenticate the user with PIN
    const isAuthenticated = await authenticateUser();
    if (!isAuthenticated) {
      return; // User cancelled or authentication failed
    }
    
    // Then show confirmation dialog
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
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
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
    if (!googleSheetsConnected || !syncEnabled) {
      showError('Not Connected', 'Please connect to Google Sheets first or enable sync in settings');
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
  }, [googleSheetsConnected, googleSheetsConfig, welds, trashWelds, syncEnabled]);

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



  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            weldCards={weldCards}
            trashCards={trashCards}
            onViewWeld={viewWeld}
            onEditWeld={editWeld}
            onDeleteWeld={deleteWeld}
            onRecoverWeld={recoverWeld}
            onPermanentlyDeleteWeld={permanentlyDeleteWeld}
            onClearTrash={clearAllTrash}
            onTrashAll={trashAllWelds}
            onRecoverAll={recoverAllTrashCards}
            onNavigate={setCurrentScreen}
          />
        );

      case 'view':
        return selectedWeld ? (
          <WeldPrintView
            card={(() => {
              // Find the card that contains this weld
              const parentCard = weldCards.find(card => 
                card.welds.some(w => w.id === selectedWeld.id)
              );
              
              if (parentCard) {
                return parentCard;
              } else {
                // Fallback: create a card from the individual weld
                return {
                  cardId: `card-${selectedWeld.id}`,
                  date: selectedWeld.date,
                  weldSketch: selectedWeld.weldSketch || '',
                  weldSketchDescription: selectedWeld.weldSketchDescription || '',
                          welderSignature: selectedWeld.welderSignature || '',
        inspectorSignature: selectedWeld.inspectorSignature || '',
                  welds: [selectedWeld],
                  createdAt: selectedWeld.createdAt || new Date().toISOString(),
                  updatedAt: selectedWeld.updatedAt || new Date().toISOString(),
                };
              }
            })()}
            onBack={handleBack}
          />
        ) : null;
      case 'bulk-edit':
        return (
          <BulkWeldEditorScreen
            onSaveCard={handleSaveCard}
            onBack={handleBack}
            existingCard={selectedCard || undefined}
          />
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
            // Clear selected weld and card when navigating to bulk-edit from bottom nav
            if (screen === 'bulk-edit') {
              setSelectedWeld(null);
              setSelectedCard(null);
            }
            setCurrentScreen(screen);
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

      {/* Security PIN Modal */}
      {showPinModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔒 Security PIN Required</Text>
            <Text style={styles.modalMessage}>
              This action requires a security PIN to prevent accidental data loss.
            </Text>
            
            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>Enter 4-digit PIN:</Text>
              <TextInput
                style={styles.pinInput}
                value={pinInput}
                onChangeText={setPinInput}
                placeholder="1234"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={false}
                autoFocus={true}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={handlePinCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handlePinSubmit}
                disabled={pinInput.length !== 4}
              >
                <Text style={styles.modalButtonText}>
                  {pinInput.length === 4 ? 'Verify PIN' : 'Enter 4 digits'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* PIN Change Modal */}
      {showPinChangeModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔐 Change Security PIN</Text>
            <Text style={styles.modalMessage}>
              Enter a new 4-digit security PIN to protect destructive operations.
            </Text>
            
            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>New PIN:</Text>
              <TextInput
                style={styles.pinInput}
                value={newPinInput}
                onChangeText={setNewPinInput}
                placeholder="0000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={false}
                autoFocus={true}
              />
              
              <Text style={[styles.pinLabel, { marginTop: 16 }]}>Confirm PIN:</Text>
              <TextInput
                style={styles.pinInput}
                value={confirmPinInput}
                onChangeText={setConfirmPinInput}
                placeholder="0000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={false}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={handlePinChangeCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handlePinChangeSubmit}
                disabled={newPinInput.length !== 4 || confirmPinInput.length !== 4}
              >
                <Text style={styles.modalButtonText}>
                  {newPinInput.length === 4 && confirmPinInput.length === 4 ? 'Update PIN' : 'Enter PINs'}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 50, // Add bottom padding for better scroll
  },
  settingsScrollContent: {
    paddingBottom: 50, // Ensure content has bottom padding for scroll
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50, // Adjust for safe area
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 0,
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
    fontSize: 25,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 0,
  },
  settingsPlaceholder: {
    width: 60, // Same width as back button for centering
  },
  bottomSpacer: {
    height: 100, // Add space at bottom for better scroll
  },
  settingsSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 15,
    marginBottom: 10,
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
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
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
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
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
    marginBottom: 12,
  },
  googleSheetsButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
  // Checkbox styles
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Sync note style
  syncNote: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  // Disabled button style
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#9ca3af',
  },
  // PIN Modal styles
  pinInputContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 12,
  },
  pinInput: {
    width: 120,
    height: 50,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  syncToggleButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  syncToggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncEnabledButton: {
    backgroundColor: '#10b981',
  },
  syncDisabledButton: {
    backgroundColor: '#dc2626',
  },
  syncDescriptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

});
