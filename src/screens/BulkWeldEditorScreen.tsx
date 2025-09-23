import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { WeldCardData } from '../types/WeldCard';
import { DatePickerField } from '../components/DatePickerField';
import { SignatureField } from '../components/SignatureField';
import { ImageUploadField } from '../components/ImageUploadField';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import { FieldConfig } from '../types/FieldConfig';
import FieldConfigService from '../services/FieldConfigService';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';
import FieldManagementModal from '../components/FieldManagementModal';

interface BulkWeldEditorScreenProps {
  onSaveCard: (card: WeldCardData) => void;
  onBack: () => void;
  existingCard?: WeldCardData; // For editing existing cards
}

const { width } = Dimensions.get('window');

export const BulkWeldEditorScreen: React.FC<BulkWeldEditorScreenProps> = ({
  onSaveCard,
  onBack,
  existingCard,
}) => {
  const [editableWelds, setEditableWelds] = useState<Weld[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerData, setHeaderData] = useState({
    date: '',
    weldSketch: '',
    weldSketchDescription: '',
    welderSignature: '',
  });
  
  // State for responsive dimensions
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Field configuration state
  const [fieldConfigs, setFieldConfigs] = useState<{
    header: FieldConfig[];
    table: FieldConfig[];
    footer: FieldConfig[];
  }>({ header: [], table: [], footer: [] });
  const [showFieldManagement, setShowFieldManagement] = useState(false);
  
  // Refs for managing focus between input fields
  const inputRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  useEffect(() => {
    if (existingCard) {
      // Initialize with existing card data
      setEditableWelds([...existingCard.welds]);
      setHeaderData({
        date: existingCard.date || '',
        weldSketch: existingCard.weldSketch || '',
        weldSketchDescription: existingCard.weldSketchDescription || '',
        welderSignature: existingCard.welderSignature || '',
  
      });
    } else {
      // Create new card with empty weld rows
      const cardId = `new-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const emptyWelds: Weld[] = Array.from({ length: 10 }, (_, index) => ({
        id: `temp-${Date.now()}-${index}`,
        cardId: cardId,
        weldNumber: '',
        widNumber: '',
        pipeSizeInches: '',
        typeOfWeld: '',
        capSize: '',
        passes: '',
        wpsNumberAndTitle: '',
        electrodeTypeBrand: '',
        rt: '',
        date: '',
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
        weldSketch: '',
        weldSketchDescription: '',
        welderSignature: '',
      }));
      setEditableWelds(emptyWelds);
      // Set default header data
      setHeaderData({
        date: new Date().toISOString().split('T')[0],
        weldSketch: '',
        weldSketchDescription: '',
        welderSignature: '',
      });
    }
  }, [existingCard]);

  // Listen for screen dimension changes (rotation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    
    return () => subscription?.remove();
  }, []);

  // Load field configurations
  useEffect(() => {
    const loadFieldConfigs = async () => {
      try {
        const fieldService = FieldConfigService.getInstance();
        await fieldService.initialize();
        
        const headerFields = fieldService.getVisibleFields('header');
        const tableFields = fieldService.getVisibleFields('table');
        const footerFields = fieldService.getVisibleFields('footer');
        
        setFieldConfigs({
          header: headerFields,
          table: tableFields,
          footer: footerFields,
        });
      } catch (error) {
        console.error('Error loading field configs:', error);
      }
    };

    loadFieldConfigs();
  }, []);

  const handleFieldConfigChanged = async () => {
    try {
      const fieldService = FieldConfigService.getInstance();
      const headerFields = fieldService.getVisibleFields('header');
      const tableFields = fieldService.getVisibleFields('table');
      const footerFields = fieldService.getVisibleFields('footer');
      
      setFieldConfigs({
        header: headerFields,
        table: tableFields,
        footer: footerFields,
      });
    } catch (error) {
      console.error('Error reloading field configs:', error);
    }
  };

  // Create dynamic styles based on current screen width
  const dynamicStyles = StyleSheet.create({
    // Column widths - action column fixed width, rest distributed proportionally
    // Action column: fixed width for delete button
    // Data columns: distribute remaining width proportionally (10 columns total)
    actionCol: { width: 60 }, // Fixed width for delete button
    weldNumberCol: { width: Math.max(80, (screenWidth - 32 - 60) * 0.10) }, // 10% of remaining width
    widCol: { width: Math.max(80, (screenWidth - 32 - 60) * 0.10) }, // 10% of remaining width
    pipeSizeCol: { width: Math.max(90, (screenWidth - 32 - 60) * 0.11) }, // 11% of remaining width
    typeCol: { width: Math.max(100, (screenWidth - 32 - 60) * 0.12) }, // 12% of remaining width
    capSizeCol: { width: Math.max(80, (screenWidth - 32 - 60) * 0.10) }, // 10% of remaining width
    passesCol: { width: Math.max(90, (screenWidth - 32 - 60) * 0.12) }, // 12% of remaining width (made wider)
    wpsCol: { width: Math.max(100, (screenWidth - 32 - 60) * 0.12) }, // 12% of remaining width
    electrodeCol: { width: Math.max(100, (screenWidth - 32 - 60) * 0.12) }, // 12% of remaining width
    rtCol: { width: Math.max(70, (screenWidth - 32 - 60) * 0.09) }, // 9% of remaining width
    htCol: { width: Math.max(90, (screenWidth - 32 - 60) * 0.12), borderRightWidth: 0 }, // 12% of remaining width (made wider)
    tableContainer: {
      backgroundColor: '#ffffff',
      marginHorizontal: 16,
      borderRadius: 8,
      width: 'auto', // Let content determine width
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    // Mobile responsive image container
    imagesContainer: {
      flexDirection: screenWidth < 768 ? 'column' : 'row',
      gap: screenWidth < 768 ? 12 : 16,
      flexWrap: 'wrap',
    },
    imageCell: {
      width: screenWidth < 768 ? '100%' : 'auto',
      minWidth: screenWidth < 768 ? '100%' : 180,
      maxWidth: screenWidth < 768 ? '100%' : '50%',
    },
  });

  const updateHeaderField = (field: keyof typeof headerData, value: string) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
    // Update all welds with new header data
    setEditableWelds(prev => prev.map(weld => ({ ...weld, [field]: value })));
  };

  const updateWeldField = (weldIndex: number, field: string, value: string | boolean) => {
    console.log('=== UPDATING WELD FIELD ===');
    console.log('Weld index:', weldIndex);
    console.log('Field:', field);
    console.log('Value:', value);
    
    setEditableWelds(prev => {
      const updated = prev.map((weld, index) => 
        index === weldIndex ? { ...weld, [field]: value } : weld
      );
      console.log('Updated weld data:', updated[weldIndex]);
      return updated;
    });
  };

  const addNewWeldRow = () => {
    const cardId = existingCard?.cardId || `card-${Date.now()}`;
    const newWeld: Weld = {
      id: `temp-${Date.now()}-${editableWelds.length}`,
      cardId: cardId,
      weldNumber: '',
      widNumber: '',
      pipeSizeInches: '',
      typeOfWeld: '',
      capSize: '',
      passes: '',
      wpsNumberAndTitle: '',
      electrodeTypeBrand: '',
      rt: '',
      date: headerData.date,
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
      
      weldSketch: '',
      weldSketchDescription: '',
      welderSignature: '',
    };
    setEditableWelds(prev => [...prev, newWeld]);
  };

  const removeWeldRow = (weldId: string) => {
    if (editableWelds.length > 1) {
      setEditableWelds(prev => prev.filter(weld => weld.id !== weldId));
    }
  };

  const handleSave = () => {
    // Filter out empty weld rows
    const validWelds = editableWelds.filter(weld => 
      weld.weldNumber.trim() || 
      weld.weldNumber.trim() || 
      weld.widNumber.trim() || 
      weld.pipeSizeInches.trim() ||
      weld.typeOfWeld.trim()
    );

    if (validWelds.length === 0) {
      Alert.alert('No Data', 'Please add at least one weld entry');
      return;
    }

    // Create card structure
    const card: WeldCardData = {
      cardId: existingCard?.cardId || `card-${Date.now()}`,
      date: headerData.date,
      weldSketch: headerData.weldSketch,
      weldSketchDescription: headerData.weldSketchDescription,
      welderSignature: headerData.welderSignature,
      welds: validWelds.map(weld => ({
        ...weld,
        cardId: existingCard?.cardId || `card-${Date.now()}`,
        date: headerData.date,
      })),
      createdAt: existingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('=== SAVING CARD ===');
    console.log('Card data:', card);
    console.log('First weld data:', card.welds[0]);
    console.log('First weld keys:', Object.keys(card.welds[0]));

    onSaveCard(card);
    Alert.alert('Success', `Card with ${validWelds.length} welds saved successfully!`);
  };

  const handleSaveAs = () => {
    // Filter out empty weld rows
    const validWelds = editableWelds.filter(weld => 
      weld.weldNumber.trim() || 
      weld.widNumber.trim() || 
      weld.pipeSizeInches.trim() ||
      weld.typeOfWeld.trim()
    );

    if (validWelds.length === 0) {
      Alert.alert('No Data', 'Please add at least one weld entry');
      return;
    }

    // Create a duplicate card with a new ID and timestamp
    const duplicateCard: WeldCardData = {
      cardId: `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: headerData.date,
      weldSketch: headerData.weldSketch,
      weldSketchDescription: headerData.weldSketchDescription,
      welderSignature: headerData.welderSignature,
      welds: validWelds.map(weld => ({
        ...weld,
        id: `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cardId: `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: headerData.date,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCard(duplicateCard);
    Alert.alert('Success', `Duplicate card with ${validWelds.length} welds saved successfully!`);
  };

  const renderEditableCell = (weld: any, field: string, weldIndex: number, placeholder: string) => {
    // Define the order of fields for tab navigation (excluding the delete button)
    const fieldOrder = ['weldNumber', 'widNumber', 'pipeSizeInches', 'typeOfWeld', 'capSize', 'passes', 'wpsNumberAndTitle', 'electrodeTypeBrand', 'rt', 'htNumber'];
    const currentFieldIndex = fieldOrder.indexOf(field);
    
    // Create a unique key for this input field
    const inputKey = `${weldIndex}-${field}`;
    
    // Initialize ref if it doesn't exist
    if (!inputRefs.current[inputKey]) {
      inputRefs.current[inputKey] = React.createRef();
    }
    
    const handleSubmitEditing = () => {
      // Move to next field in the same row
      if (currentFieldIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentFieldIndex + 1];
        const nextInputKey = `${weldIndex}-${nextField}`;
        const nextInputRef = inputRefs.current[nextInputKey];
        if (nextInputRef?.current) {
          nextInputRef.current.focus();
        }
      } else {
        // Move to first field of next row
        if (weldIndex < editableWelds.length - 1) {
          const nextRowFirstField = fieldOrder[0];
          const nextInputKey = `${weldIndex + 1}-${nextRowFirstField}`;
          const nextInputRef = inputRefs.current[nextInputKey];
          if (nextInputRef?.current) {
            nextInputRef.current.focus();
          }
        }
      }
    };

    return (
      <TextInput
        ref={inputRefs.current[inputKey]}
        style={styles.cellInput}
        value={String(weld[field] || '')}
        onChangeText={(value) => updateWeldField(weldIndex, field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={false}
        returnKeyType={currentFieldIndex < fieldOrder.length - 1 ? 'next' : 'done'}
        blurOnSubmit={false}
        onSubmitEditing={handleSubmitEditing}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <KeyboardAwareScrollView 
          style={styles.verticalScroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Screen Header with Back Button */}
          <View style={styles.screenHeader}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Icon name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>
              {existingCard ? 'Edit Weld Card' : 'Add New Weld Card'}
            </Text>
            <TouchableOpacity 
              style={styles.fieldManagementButton} 
              onPress={() => setShowFieldManagement(true)}
            >
              <Icon name="settings" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Form Header Section - Dynamic */}
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              {fieldConfigs.header.map((field) => (
                <View key={field.id} style={[styles.headerCell, { flex: field.width || 1 }]}>
                  <Text style={styles.headerLabel}>{field.label}:</Text>
                  <DynamicFieldRenderer
                    field={field}
                    value={headerData[field.key as keyof typeof headerData] || ''}
                    onChange={(value) => updateHeaderField(field.key as keyof typeof headerData, value)}
                    onDescriptionChange={(description) => {
                      if (field.key === 'weldSketch') {
                        updateHeaderField('weldSketchDescription', description);
                      }
                    }}
                    onClear={() => updateHeaderField(field.key as keyof typeof headerData, '')}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Search Box */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Weld # or WID #..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <Icon name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Table Container */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
            <View style={dynamicStyles.tableContainer}>
            {/* Table Header - Dynamic */}
            <View style={styles.tableHeader}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, dynamicStyles.actionCol]}>Actions</Text>
                {fieldConfigs.table.map((field) => (
                  <Text 
                    key={field.id} 
                    style={[
                      styles.tableHeaderCell, 
                      { width: Math.max(80, (screenWidth - 32 - 60) * (field.width || 0.1)) }
                    ]}
                  >
                    {field.label}
                  </Text>
                ))}
              </View>
            </View>

            {/* Table Rows */}
            {editableWelds
              .filter(weld => 
                searchQuery === '' || 
                weld.weldNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                weld.widNumber?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((weld, index) => (
              <View 
                key={weld.id} 
                style={styles.tableRow}
              >
                {/* Actions Column */}
                <View style={[styles.tableCell, dynamicStyles.actionCol]}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeWeldRow(weld.id)}
                    disabled={editableWelds.length <= 1}
                  >
                    <Icon name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Dynamic Table Fields */}
                {fieldConfigs.table.map((field) => (
                  <View 
                    key={field.id} 
                    style={[
                      styles.tableCell, 
                      { width: Math.max(80, (screenWidth - 32 - 60) * (field.width || 0.1)) }
                    ]}
                  >
                    {renderEditableCell(weld, field.key, index, field.placeholder)}
                  </View>
                ))}

              </View>
            ))}
            </View>
          </ScrollView>

          {/* Add Row Button */}
          <View style={styles.addRowSection}>
            <TouchableOpacity style={styles.addRowButton} onPress={addNewWeldRow}>
              <Icon name="add-circle-outline" size={20} color="#3b82f6" />
              <Text style={styles.addRowButtonText}>Add New Weld Row</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section - Dynamic */}
          {fieldConfigs.footer.length > 0 && (
            <View style={styles.footerSection}>
              {fieldConfigs.footer.map((field) => (
                <View key={field.id} style={styles.footerField}>
                  <Text style={styles.footerLabel}>{field.label}:</Text>
                  <DynamicFieldRenderer
                    field={field}
                    value={headerData[field.key as keyof typeof headerData] || ''}
                    onChange={(value) => updateHeaderField(field.key as keyof typeof headerData, value)}
                    onDescriptionChange={(description) => {
                      if (field.key === 'weldSketch') {
                        updateHeaderField('weldSketchDescription', description);
                      }
                    }}
                    onClear={() => updateHeaderField(field.key as keyof typeof headerData, '')}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.saveAsButton} onPress={handleSaveAs}>
              <Text style={styles.saveAsButtonText}>Save As</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save All Welds</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* Field Management Modal */}
      <FieldManagementModal
        visible={showFieldManagement}
        onClose={() => setShowFieldManagement(false)}
        onConfigChanged={handleFieldConfigChanged}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#3b82f6',
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  fieldManagementButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  searchSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  clearSearchButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to ensure buttons are visible
  },
  tableScrollContainer: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateCell: {
    flex: 0,
    minWidth: 200,
    marginRight: 16,
  },
  imagesContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  imageCell: {
    flex: 1,
    minWidth: 180,
    marginBottom: 16,
  },
  headerCell: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  headerInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 8,
    width: width - 32, // Use screen width minus margins
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    minHeight: 50,
    alignItems: 'center',
  },
  tableHeaderCell: {
    padding: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  tableCell: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  cellInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    color: '#374151',
    padding: 4,
  },


  removeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fef2f2',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  confirmButton: {
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmYesButton: {
    backgroundColor: '#10b981',
  },
  confirmNoButton: {
    backgroundColor: '#ef4444',
  },
  addRowSection: {
    padding: 16,
    alignItems: 'center',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  addRowButtonText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '600',
  },
  footerSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  footerField: {
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  saveAsButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  saveAsButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
