import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Alert, KeyboardAvoidingView, Platform, StatusBar, View, Text, StyleSheet, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Weld, WeldFormData, Screen } from './src/types/Weld';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeldFormScreen } from './src/screens/WeldFormScreen';
import { WeldViewScreen } from './src/screens/WeldViewScreen';
import { BottomNavigation } from './src/components/BottomNavigation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [welds, setWelds] = useState<Weld[]>([
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
  ]);
  const [trashWelds, setTrashWelds] = useState<Weld[]>([
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
  ]);
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

  useEffect(() => {
    loadWelds();
    loadTrashWelds();
    
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

  const loadWelds = async () => {
    try {
      const stored = await AsyncStorage.getItem('welds');
      if (stored) {
        setWelds(JSON.parse(stored));
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
      }
    } catch (error) {
      console.error('Error loading trash welds:', error);
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
      Alert.alert('Error', 'Weld Number is required');
      return;
    }
    if (!formData.wps?.trim()) {
      Alert.alert('Error', 'WPS is required');
      return;
    }
    if (!formData.welder?.trim()) {
      Alert.alert('Error', 'Welder name is required');
      return;
    }
    if (!formData.inspector?.trim()) {
      Alert.alert('Error', 'Inspector name is required');
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
      Alert.alert('Success', 'Weld updated successfully!');
    } else {
      // Add new weld
      const newWeld = { ...formData, id: Date.now().toString(), status: 'pending' as const, createdAt: new Date().toISOString() };
      const updatedWelds = [newWeld, ...welds];
      setWelds(updatedWelds);
      saveWelds(updatedWelds);
      Alert.alert('Success', 'Weld added successfully!');
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
    Alert.alert(
      'Move to Trash',
      `Move ${weld.weldNumber} to trash? You can recover it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Move to Trash', 
          style: 'destructive',
          onPress: () => {
            // Move to trash instead of permanent deletion
            const updatedWelds = welds.filter(w => w.id !== weld.id);
            const updatedTrashWelds = [weld, ...trashWelds];
            
            setWelds(updatedWelds);
            setTrashWelds(updatedTrashWelds);
            
            saveWelds(updatedWelds);
            saveTrashWelds(updatedTrashWelds);
            
            Alert.alert('Moved to Trash', `${weld.weldNumber} has been moved to trash. You can recover it later.`);
          }
        }
      ]
    );
  };

  const recoverWeld = (weld: Weld) => {
    Alert.alert(
      'Recover Weld',
      `Recover ${weld.weldNumber} from trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Recover', 
          style: 'default',
          onPress: () => {
            // Move back from trash to active welds
            const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
            const updatedWelds = [weld, ...welds];
            
            setTrashWelds(updatedTrashWelds);
            setWelds(updatedWelds);
            
            saveTrashWelds(updatedTrashWelds);
            saveWelds(updatedWelds);
            
            Alert.alert('Recovered', `${weld.weldNumber} has been recovered successfully!`);
          }
        }
      ]
    );
  };

  const permanentlyDeleteWeld = (weld: Weld) => {
    Alert.alert(
      'Permanently Delete',
      `Are you sure you want to permanently delete ${weld.weldNumber}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: () => {
            const updatedTrashWelds = trashWelds.filter(w => w.id !== weld.id);
            setTrashWelds(updatedTrashWelds);
            saveTrashWelds(updatedTrashWelds);
            Alert.alert('Deleted', `${weld.weldNumber} has been permanently deleted.`);
          }
        }
      ]
    );
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
      <BottomNavigation 
        currentScreen={currentScreen === 'view' ? 'home' : currentScreen} 
        onNavigate={(screen) => {
          if (screen === 'add') {
            handleAddWeld();
          } else {
            setCurrentScreen(screen);
          }
        }} 
      />
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
});
