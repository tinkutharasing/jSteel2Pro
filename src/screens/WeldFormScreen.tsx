import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { FormField, CheckboxField } from '../components/FormField';
import { DatePickerField } from '../components/DatePickerField';
import { ImageUploadField } from '../components/ImageUploadField';
import { WeldFormData } from '../types/Weld';

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
  const handleSave = () => {
    if (!formData.weldNumber?.trim()) {
      Alert.alert('Required Field', 'Weld Number is required');
      return;
    }
    onSave();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              value={formData.welderName || ''}
              onChangeText={(value) => onUpdateField('welderName', value)}
              placeholder="Name"
            />
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Location:</Text>
            <FormField
              label=""
              value={formData.jobLocation || ''}
              onChangeText={(value) => onUpdateField('jobLocation', value)}
              placeholder="Job Location"
            />
          </View>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderRow}>
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

      {/* Table Row - Single row for now, can be expanded */}
      <View style={styles.tableRow}>
        {/* WELD # */}
        <View style={[styles.tableCell, styles.weldNumberCol]}>
          <FormField
            label=""
            value={formData.weldNumber || ''}
            onChangeText={(value) => onUpdateField('weldNumber', value)}
            placeholder="Weld #"
            required
          />
        </View>

        {/* WID # */}
        <View style={[styles.tableCell, styles.widCol]}>
          <FormField
            label=""
            value={formData.widNumber || ''}
            onChangeText={(value) => onUpdateField('widNumber', value)}
            placeholder="WID #"
          />
        </View>

        {/* PIPE SIZE */}
        <View style={[styles.tableCell, styles.pipeSizeCol]}>
          <FormField
            label=""
            value={formData.pipeSizeInches || ''}
            onChangeText={(value) => onUpdateField('pipeSizeInches', value)}
            placeholder="Size"
          />
        </View>

        {/* TYPE OF WELD */}
        <View style={[styles.tableCell, styles.typeCol]}>
          <FormField
            label=""
            value={formData.typeOfWeld || ''}
            onChangeText={(value) => onUpdateField('typeOfWeld', value)}
            placeholder="Type"
          />
        </View>

        {/* CAP SIZE */}
        <View style={[styles.tableCell, styles.capSizeCol]}>
          <FormField
            label=""
            value={formData.capSize || ''}
            onChangeText={(value) => onUpdateField('capSize', value)}
            placeholder="Cap Size"
          />
        </View>

        {/* PASSES */}
        <View style={[styles.tableCell, styles.passesCol]}>
          <FormField
            label=""
            value={formData.passes || ''}
            onChangeText={(value) => onUpdateField('passes', value)}
            placeholder="Passes"
          />
        </View>

        {/* WPS */}
        <View style={[styles.tableCell, styles.wpsCol]}>
          <FormField
            label=""
            value={formData.wpsNumberAndTitle || ''}
            onChangeText={(value) => onUpdateField('wpsNumberAndTitle', value)}
            placeholder="WPS #"
          />
        </View>

        {/* ELECTRODE */}
        <View style={[styles.tableCell, styles.electrodeCol]}>
          <FormField
            label=""
            value={formData.electrodeTypeBrand || ''}
            onChangeText={(value) => onUpdateField('electrodeTypeBrand', value)}
            placeholder="Electrode"
          />
        </View>

        {/* RT */}
        <View style={[styles.tableCell, styles.rtCol]}>
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
    </ScrollView>
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
  },
  headerCell: {
    flex: 1,
    marginHorizontal: 8,
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
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Column widths optimized for tablet
  weldNumberCol: { width: width * 0.08 },
  widCol: { width: width * 0.08 },
  pipeSizeCol: { width: width * 0.09 },
  typeCol: { width: width * 0.12 },
  capSizeCol: { width: width * 0.09 },
  passesCol: { width: width * 0.08 },
  wpsCol: { width: width * 0.12 },
  electrodeCol: { width: width * 0.14 },
  rtCol: { width: width * 0.10 },
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
