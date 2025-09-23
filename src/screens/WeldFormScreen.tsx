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
import { FieldConfig } from '../types/FieldConfig';
import FieldConfigService from '../services/FieldConfigService';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';

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
  const [fieldConfigs, setFieldConfigs] = useState<{
    header: FieldConfig[];
    table: FieldConfig[];
    footer: FieldConfig[];
  }>({ header: [], table: [], footer: [] });

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

  // Create dynamic styles based on current screen width
  const dynamicStyles = StyleSheet.create({
    // Column widths - distribute width proportionally with reasonable minimums
    // Total columns: 10 (weldNumber, wid, pipeSize, type, capSize, passes, wps, electrode, rt, ht)
    // Use flex for better distribution, with reasonable minimum widths
    weldNumberCol: { flex: 1, minWidth: 70 },
    widCol: { flex: 1, minWidth: 70 },
    pipeSizeCol: { flex: 1.1, minWidth: 80 },
    typeCol: { flex: 1.3, minWidth: 90 },
    capSizeCol: { flex: 1, minWidth: 70 },
    passesCol: { flex: 1.2, minWidth: 80 }, // Made wider
    wpsCol: { flex: 1.3, minWidth: 90 },
    electrodeCol: { flex: 1.4, minWidth: 100 },
    rtCol: { flex: 0.9, minWidth: 60 },
    htCol: { flex: 1.2, minWidth: 80 }, // Made wider
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
      {/* Header Section - Dynamic */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          {fieldConfigs.header.map((field) => (
            <View key={field.id} style={[styles.headerCell, { flex: field.width || 1 }]}>
              <Text style={styles.headerLabel}>{field.label}:</Text>
              <DynamicFieldRenderer
                field={field}
                value={formData[field.key as keyof WeldFormData]}
                onChange={(value) => onUpdateField(field.key as keyof WeldFormData, value)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Table Header - Dynamic */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderRow}>
          {fieldConfigs.table.map((field) => (
            <Text 
              key={field.id} 
              style={[
                styles.tableHeaderCell, 
                { flex: field.width || 1, minWidth: 60 }
              ]}
            >
              {field.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Table Row - Dynamic */}
      <View style={styles.tableRow}>
        {fieldConfigs.table.map((field) => (
          <View 
            key={field.id} 
            style={[
              styles.tableCell, 
              { flex: field.width || 1, minWidth: 60 }
            ]}
          >
            <DynamicFieldRenderer
              field={field}
              value={formData[field.key as keyof WeldFormData]}
              onChange={(value) => onUpdateField(field.key as keyof WeldFormData, value)}
            />
          </View>
        ))}
      </View>

      {/* Footer Section - Dynamic */}
      {fieldConfigs.footer.length > 0 && (
        <View style={styles.footerSection}>
          {fieldConfigs.footer.map((field) => (
            <View key={field.id} style={styles.footerField}>
              <Text style={styles.footerLabel}>{field.label}:</Text>
              <DynamicFieldRenderer
                field={field}
                value={formData[field.key as keyof WeldFormData]}
                onChange={(value) => onUpdateField(field.key as keyof WeldFormData, value)}
                onDescriptionChange={(description) => {
                  if (field.key === 'weldSketch') {
                    onUpdateField('weldSketchDescription', description);
                  }
                }}
                onClear={() => onUpdateField(field.key as keyof WeldFormData, '')}
              />
            </View>
          ))}
        </View>
      )}

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
  footerSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footerField: {
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
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
