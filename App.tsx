import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, View, Text, StyleSheet, BackHandler, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Weld, WeldFormData, Screen } from './src/types/Weld';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeldFormScreen } from './src/screens/WeldFormScreen';
import { WeldViewScreen } from './src/screens/WeldViewScreen';
import { BottomNavigation } from './src/components/BottomNavigation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  
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

  const SAMPLE_TRASH_WELDS: Weld[] = [
    {
      id: 'trash-1',
      date: '2024-01-10',
      typeFit: 'Pipe to Flange',
      wps: 'WPS-3',
      pipeDia: '12 inch',
      gradeClass: 'X42-x42',
      weldNumber: 'Z9999',
      welder: 'Tom Wilson',
      welderSignature: '',
      inspector: 'Alice Cooper',
      inspectorSignature: '',
      firstHT: 'ACCD',
      firstMfg: 'OldSteel',
      firstLength: '18.5 feet',
      jtNumber: 'JT-OLD',
      secondHT: '0E123A',
      secondMfg: 'LegacyCorp',
      secondLength: '12.0 feet',
      preHeat: 'NO',
      vt: 'SMAW',
      process: 'SMAW',
      ndeNumber: 'NDE-001',
      amps: '150,165,180',
      volts: '20,22,24',
      ipm: '4-inch',
      status: 'rejected',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-10T08:00:00Z'
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

  // Styled confirmation modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmConfirmText, setConfirmConfirmText] = useState('Confirm');
  const [confirmCancelText, setConfirmCancelText] = useState('Cancel');
  const confirmActionRef = React.useRef<(() => Promise<void> | void) | null>(null);

  // Success popup state
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Error popup state
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    confirmActionRef.current = opts.onConfirm;
    setConfirmVisible(true);
  };

  const hideConfirm = () => {
    setConfirmVisible(false);
    confirmActionRef.current = null;
  };

  const showSuccess = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessVisible(true);
    // Auto-hide after 3 seconds
    setTimeout(() => setSuccessVisible(false), 3000);
  };

  const hideSuccess = () => {
    setSuccessVisible(false);
  };

  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorVisible(true);
    // Auto-hide after 4 seconds for errors
    setTimeout(() => setErrorVisible(false), 4000);
  };

  const hideError = () => {
    setErrorVisible(false);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadWelds();
      await loadTrashWelds();
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

  const resetToSampleData = async () => {
    try {
      console.log('Resetting to sample data...');
      await AsyncStorage.removeItem('welds');
      await AsyncStorage.removeItem('trashWelds');
      await AsyncStorage.setItem('welds', JSON.stringify(SAMPLE_WELDS));
      await AsyncStorage.setItem('trashWelds', JSON.stringify(SAMPLE_TRASH_WELDS));
      setWelds(SAMPLE_WELDS);
      setTrashWelds(SAMPLE_TRASH_WELDS);
      console.log('Sample data restored successfully');
      showSuccess('Success', `Database reset! Restored ${SAMPLE_WELDS.length} welds and ${SAMPLE_TRASH_WELDS.length} trash items.`);
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
          await AsyncStorage.removeItem('welds');
          await AsyncStorage.removeItem('trashWelds');
          setWelds([]);
          setTrashWelds([]);
          console.log('All data cleared successfully');
          hideConfirm();
          showSuccess('Success', 'All data cleared!');
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
      message: 'This will overwrite current data with 5 sample entries and 1 trash item.',
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
      const message = `Current State:\n• Active Welds: ${welds.length}\n• Trash Items: ${trashWelds.length}\n\nStorage Status:\n• Welds in AsyncStorage: ${storedWelds ? 'Yes' : 'No'}\n• Trash in AsyncStorage: ${storedTrash ? 'Yes' : 'No'}\n\nSample Data Available:\n• Sample Welds: ${SAMPLE_WELDS.length}\n• Sample Trash: ${SAMPLE_TRASH_WELDS.length}`;
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
      onConfirm: () => {
        const updatedWelds = welds.filter(w => w.id !== weld.id);
        const updatedTrashWelds = [weld, ...trashWelds];
        setWelds(updatedWelds);
        setTrashWelds(updatedTrashWelds);
        saveWelds(updatedWelds);
        saveTrashWelds(updatedTrashWelds);
        hideConfirm();
        showSuccess('Moved to Trash', `${weld.weldNumber} has been moved to trash. You can recover it later.`);
      }
    });
  };

  const recoverWeld = async (weld: Weld) => {
    try {
      const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
      const updatedWelds = [weld, ...welds];
      
      await saveTrashWelds(updatedTrashWelds);
      await saveWelds(updatedWelds);
      
      setTrashWelds(updatedTrashWelds);
      setWelds(updatedWelds);
      
      showSuccess('Recovered', `${weld.weldNumber} has been recovered successfully!`);
    } catch (error) {
      console.error('Error recovering weld:', error);
      showError('Error', 'Failed to recover weld');
    }
  };

  const permanentlyDeleteWeld = (weld: Weld) => {
    showConfirm({
      title: 'Permanently Delete',
      message: `Are you sure you want to permanently delete ${weld.weldNumber}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: () => {
        const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
        setTrashWelds(updatedTrashWelds);
        saveTrashWelds(updatedTrashWelds);
        hideConfirm();
        showSuccess('Deleted', `${weld.weldNumber} has been permanently deleted.`);
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
            <Text style={styles.settingsTitle}>Settings</Text>
            <Text style={styles.settingsSubtitle}>App configuration and preferences</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>Total Welds</Text>
              <Text style={styles.settingsItemValue}>{welds.length}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>Trashed Items</Text>
              <Text style={styles.settingsItemValue}>{trashWelds.length}</Text>
            </View>
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
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={hideConfirm}>
                <Text style={styles.modalButtonText}>{confirmCancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={async () => {
                  if (confirmActionRef.current) {
                    await confirmActionRef.current();
                  }
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{confirmConfirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {successVisible && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.successCard]}>
            <Text style={[styles.modalTitle, styles.successTitle]}>{successTitle}</Text>
            <Text style={[styles.modalMessage, styles.successMessage]}>{successMessage}</Text>
            <View style={styles.successActions}>
              <TouchableOpacity style={styles.successButton} onPress={hideSuccess}>
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {errorVisible && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.errorCard]}>
            <Text style={[styles.modalTitle, styles.errorTitle]}>{errorTitle}</Text>
            <Text style={[styles.modalMessage, styles.errorMessage]}>{errorMessage}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.errorButton} onPress={hideError}>
                <Text style={styles.errorButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#0f172a',
  },
  successMessage: {
    color: '#475569',
  },
  successButton: {
    backgroundColor: '#ffffff', // White button for success
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successButtonText: {
    color: '#10b981', // Green text for success button
  },
  successActions: {
    alignItems: 'center',
  },
  // Error popup specific styles - neutral card with red top border
  errorCard: {
    borderTopWidth: 4,
    borderTopColor: '#ef4444',
  },
  errorTitle: {
    color: '#0f172a',
  },
  errorMessage: {
    color: '#475569',
  },
  errorButton: {
    backgroundColor: '#ffffff', // White button for error
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorButtonText: {
    color: '#ef4444', // Red text for error button
  },
  errorActions: {
    alignItems: 'center',
  },
});
