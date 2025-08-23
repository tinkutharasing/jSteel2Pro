import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { DatePickerField } from '../components/DatePickerField';

interface BulkWeldEditorScreenProps {
  welds: Weld[];
  onSaveWelds: (welds: Weld[]) => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export const BulkWeldEditorScreen: React.FC<BulkWeldEditorScreenProps> = ({
  welds,
  onSaveWelds,
  onBack,
}) => {
  const [editableWelds, setEditableWelds] = useState<Weld[]>([]);
  const [headerData, setHeaderData] = useState({
    date: '',
    welderName: '',
    jobLocation: '',
  });

  useEffect(() => {
    if (welds.length > 0) {
      // Initialize with existing welds
      setEditableWelds([...welds]);
      // Set header data from first weld
      setHeaderData({
        date: welds[0].date || '',
        welderName: welds[0].welderName || '',
        jobLocation: welds[0].jobLocation || '',
      });
    } else {
      // Create empty weld rows if none exist
      const emptyWelds: Weld[] = Array.from({ length: 10 }, (_, index) => ({
        id: `temp-${Date.now()}-${index}`,
        weldNumber: '',
        widNumber: '',
        pipeSizeInches: '',
        typeOfWeld: '',
        capSize: '',
        passes: '',
        wpsNumberAndTitle: '',
        electrodeTypeBrand: '',
        rt: '',
        welderName: '',
        date: '',
        jobLocation: '',
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
        status: 'pending',
        weldSketch: '',
        weldSketchDescription: '',
        defectSketch: '',
        defectSketchDescription: '',
      }));
      setEditableWelds(emptyWelds);
    }
  }, [welds]);

  const updateHeaderField = (field: keyof typeof headerData, value: string) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
    // Update all welds with new header data
    setEditableWelds(prev => prev.map(weld => ({ ...weld, [field]: value })));
  };

  const updateWeldField = (weldIndex: number, field: keyof Weld, value: string | boolean) => {
    setEditableWelds(prev => prev.map((weld, index) => 
      index === weldIndex ? { ...weld, [field]: value } : weld
    ));
  };

  const addNewWeldRow = () => {
    const newWeld: Weld = {
      id: `temp-${Date.now()}-${editableWelds.length}`,
      weldNumber: '',
      widNumber: '',
      pipeSizeInches: '',
      typeOfWeld: '',
      capSize: '',
      passes: '',
      wpsNumberAndTitle: '',
      electrodeTypeBrand: '',
      rt: '',
      welderName: headerData.welderName,
      date: headerData.date,
      jobLocation: headerData.jobLocation,
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
      status: 'pending',
      weldSketch: '',
      weldSketchDescription: '',
      defectSketch: '',
      defectSketchDescription: '',
    };
    setEditableWelds(prev => [...prev, newWeld]);
  };

  const removeWeldRow = (index: number) => {
    if (editableWelds.length > 1) {
      setEditableWelds(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
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

    // Update all welds with header data
    const finalWelds = validWelds.map(weld => ({
      ...weld,
      welderName: headerData.welderName,
      date: headerData.date,
      jobLocation: headerData.jobLocation,
    }));

    onSaveWelds(finalWelds);
    Alert.alert('Success', `${finalWelds.length} welds saved successfully!`);
  };

  const renderEditableCell = (weld: Weld, field: keyof Weld, weldIndex: number, placeholder: string) => (
    <TextInput
      style={styles.cellInput}
      value={String(weld[field] || '')}
      onChangeText={(value) => updateWeldField(weldIndex, field, value)}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={false}
    />
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <View style={styles.headerCell}>
                <Text style={styles.headerLabel}>Date:</Text>
                <DatePickerField
                  label=""
                  value={headerData.date}
                  onDateChange={(date) => updateHeaderField('date', date)}
                />
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerLabel}>Welder:</Text>
                <TextInput
                  style={styles.headerInput}
                  value={headerData.welderName}
                  onChangeText={(value) => updateHeaderField('welderName', value)}
                  placeholder="Name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerLabel}>Location:</Text>
                <TextInput
                  style={styles.headerInput}
                  value={headerData.jobLocation}
                  onChangeText={(value) => updateHeaderField('jobLocation', value)}
                  placeholder="Job Location"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Table Container */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.actionCol]}>Actions</Text>
                <Text style={[styles.tableHeaderCell, styles.weldNumberCol]}>WELD #</Text>
                <Text style={[styles.tableHeaderCell, styles.widCol]}>WID #</Text>
                <Text style={[styles.tableHeaderCell, styles.pipeSizeCol]}>PIPE SIZE</Text>
                <Text style={[styles.tableHeaderCell, styles.typeCol]}>TYPE OF WELD</Text>
                <Text style={[styles.tableHeaderCell, styles.capSizeCol]}>CAP SIZE</Text>
                <Text style={[styles.tableHeaderCell, styles.passesCol]}>PASSES</Text>
                <Text style={[styles.tableHeaderCell, styles.wpsCol]}>WPS</Text>
                <Text style={[styles.tableHeaderCell, styles.electrodeCol]}>ELECTRODE</Text>
                <Text style={[styles.tableHeaderCell, styles.rtCol]}>RT</Text>
              </View>
            </View>

            {/* Table Rows */}
            {editableWelds.map((weld, index) => (
              <View key={weld.id} style={styles.tableRow}>
                {/* Actions Column */}
                <View style={[styles.tableCell, styles.actionCol]}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeWeldRow(index)}
                    disabled={editableWelds.length <= 1}
                  >
                    <Icon name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* WELD # */}
                <View style={[styles.tableCell, styles.weldNumberCol]}>
                  {renderEditableCell(weld, 'weldNumber', index, 'Weld #')}
                </View>

                {/* WID # */}
                <View style={[styles.tableCell, styles.widCol]}>
                  {renderEditableCell(weld, 'widNumber', index, 'WID #')}
                </View>

                {/* PIPE SIZE */}
                <View style={[styles.tableCell, styles.pipeSizeCol]}>
                  {renderEditableCell(weld, 'pipeSizeInches', index, 'Size')}
                </View>

                {/* TYPE OF WELD */}
                <View style={[styles.tableCell, styles.typeCol]}>
                  {renderEditableCell(weld, 'typeOfWeld', index, 'Type')}
                </View>

                {/* CAP SIZE */}
                <View style={[styles.tableCell, styles.capSizeCol]}>
                  {renderEditableCell(weld, 'capSize', index, 'Cap Size')}
                </View>

                {/* PASSES */}
                <View style={[styles.tableCell, styles.passesCol]}>
                  {renderEditableCell(weld, 'passes', index, 'Passes')}
                </View>

                {/* WPS */}
                <View style={[styles.tableCell, styles.wpsCol]}>
                  {renderEditableCell(weld, 'wpsNumberAndTitle', index, 'WPS #')}
                </View>

                {/* ELECTRODE */}
                <View style={[styles.tableCell, styles.electrodeCol]}>
                  {renderEditableCell(weld, 'electrodeTypeBrand', index, 'Electrode')}
                </View>

                {/* RT */}
                <View style={[styles.tableCell, styles.rtCol]}>
                  {renderEditableCell(weld, 'rt', index, 'RT')}
                </View>
              </View>
            ))}
          </View>

          {/* Add Row Button */}
          <View style={styles.addRowSection}>
            <TouchableOpacity style={styles.addRowButton} onPress={addNewWeldRow}>
              <Icon name="add-circle-outline" size={20} color="#3b82f6" />
              <Text style={styles.addRowButtonText}>Add New Weld Row</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save All Welds</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
    minWidth: Math.max(width, 1200), // Ensure minimum width for table
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  // Column widths
  actionCol: { width: 60 },
  weldNumberCol: { width: 80 },
  widCol: { width: 80 },
  pipeSizeCol: { width: 100 },
  typeCol: { width: 120 },
  capSizeCol: { width: 80 },
  passesCol: { width: 80 },
  wpsCol: { width: 120 },
  electrodeCol: { width: 120 },
  rtCol: { width: 60 },
  removeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fef2f2',
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
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
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
