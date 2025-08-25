import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { FormField, CheckboxField } from '../components/FormField';
import { DatePickerField } from '../components/DatePickerField';
import { ImageUploadField } from '../components/ImageUploadField';
import { WeldFormData } from '../types/Weld';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';

interface WeldFormScreenProps {
  formData: WeldFormData;
  isEditMode: boolean;
  onUpdateField: (field: keyof WeldFormData, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export const WeldFormScreen: React.FC<WeldFormScreenProps> = ({
  formData,
  isEditMode,
  onUpdateField,
  onSave,
  onBack,
}) => {
  // State for responsive dimensions
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Listen for screen dimension changes (rotation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    
    return () => subscription?.remove();
  }, []);

  // Create dynamic styles based on current screen width
  const dynamicStyles = StyleSheet.create({
    // Column widths - distribute width proportionally with reasonable minimums
    // Total columns: 9 (weldNumber, wid, pipeSize, type, capSize, passes, wps, electrode, rt)
    // Use flex for better distribution, with reasonable minimum widths
    weldNumberCol: { flex: 1, minWidth: 70 },
    widCol: { flex: 1, minWidth: 70 },
    pipeSizeCol: { flex: 1.1, minWidth: 80 },
    typeCol: { flex: 1.3, minWidth: 90 },
    capSizeCol: { flex: 1, minWidth: 70 },
    passesCol: { flex: 0.9, minWidth: 60 },
    wpsCol: { flex: 1.3, minWidth: 90 },
    electrodeCol: { flex: 1.4, minWidth: 100 },
    rtCol: { flex: 0.9, minWidth: 60 },
  });

  const handleSave = () => {
    if (!formData.weldNumber?.trim()) {
      Alert.alert('Required Field', 'Weld Number is required');
      return;
    }
    onSave();
  };

  return (
    <KeyboardAwareScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section - Fixed at top */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Date:</Text>
            <DatePickerField
              label=""
              value={formData.date || ''}
              onDateChange={(date) => onUpdateField('date', date)}
            />
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Welder:</Text>
            <FormField
              label=""
              value={formData.weldingContractorName || ''}
              onChangeText={(value) => onUpdateField('weldingContractorName', value)}
              placeholder="Name"
            />
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Location:</Text>
            <FormField
              label=""
              value={formData.woJoNumber || ''}
              onChangeText={(value) => onUpdateField('woJoNumber', value)}
              placeholder="Job Location"
            />
          </View>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, dynamicStyles.weldNumberCol]}>WELD #</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.widCol]}>WID #</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.pipeSizeCol]}>PIPE SIZE</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.typeCol]}>TYPE OF WELD</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.capSizeCol]}>CAP SIZE</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.passesCol]}>PASSES</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.wpsCol]}>WPS</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.electrodeCol]}>ELECTRODE</Text>
          <Text style={[styles.tableHeaderCell, dynamicStyles.rtCol]}>RT</Text>
        </View>
      </View>

      {/* Table Row - Single row for now, can be expanded */}
      <View style={styles.tableRow}>
        {/* WELD # */}
        <View style={[styles.tableCell, dynamicStyles.weldNumberCol]}>
          <FormField
            label=""
            value={formData.weldNumber || ''}
            onChangeText={(value) => onUpdateField('weldNumber', value)}
            placeholder="Weld #"
            required
          />
        </View>

        {/* WID # */}
        <View style={[styles.tableCell, dynamicStyles.widCol]}>
          <FormField
            label=""
            value={formData.widNumber || ''}
            onChangeText={(value) => onUpdateField('widNumber', value)}
            placeholder="WID #"
          />
        </View>

        {/* PIPE SIZE */}
        <View style={[styles.tableCell, dynamicStyles.pipeSizeCol]}>
          <FormField
            label=""
            value={formData.pipeSizeInches || ''}
            onChangeText={(value) => onUpdateField('pipeSizeInches', value)}
            placeholder="Size"
          />
        </View>

        {/* TYPE OF WELD */}
        <View style={[styles.tableCell, dynamicStyles.typeCol]}>
          <FormField
            label=""
            value={formData.typeOfWeld || ''}
            onChangeText={(value) => onUpdateField('typeOfWeld', value)}
            placeholder="Type"
          />
        </View>

        {/* CAP SIZE */}
        <View style={[styles.tableCell, dynamicStyles.capSizeCol]}>
          <FormField
            label=""
            value={formData.capSize || ''}
            onChangeText={(value) => onUpdateField('capSize', value)}
            placeholder="Cap Size"
          />
        </View>

        {/* PASSES */}
        <View style={[styles.tableCell, dynamicStyles.passesCol]}>
          <FormField
            label=""
            value={formData.passes || ''}
            onChangeText={(value) => onUpdateField('passes', value)}
            placeholder="Passes"
          />
        </View>

        {/* WPS */}
        <View style={[styles.tableCell, dynamicStyles.wpsCol]}>
          <FormField
            label=""
            value={formData.wpsNumberAndTitle || ''}
            onChangeText={(value) => onUpdateField('wpsNumberAndTitle', value)}
            placeholder="WPS #"
          />
        </View>

        {/* ELECTRODE */}
        <View style={[styles.tableCell, dynamicStyles.electrodeCol]}>
          <FormField
            label=""
            value={formData.electrodeTypeBrand || ''}
            onChangeText={(value) => onUpdateField('electrodeTypeBrand', value)}
            placeholder="Electrode"
          />
        </View>

        {/* RT */}
        <View style={[styles.tableCell, dynamicStyles.rtCol]}>
          <FormField
            label=""
            value={formData.rt || ''}
            onChangeText={(value) => onUpdateField('rt', value)}
            placeholder="RT"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Weld</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e9ecef',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping in landscape
  },
  headerCell: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 150, // Ensure minimum width for header cells
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    marginHorizontal: 8,
    marginBottom: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60, // Ensure minimum cell width
  },

  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
