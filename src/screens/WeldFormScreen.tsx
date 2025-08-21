import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { WeldFormData } from '../types/Weld';
import { FormField } from '../components/FormField';
import { DatePickerField } from '../components/DatePickerField';
import { ImageUploadField } from '../components/ImageUploadField';
import { SignatureField } from '../components/SignatureField';

interface WeldFormScreenProps {
  formData: WeldFormData;
  isEditMode: boolean;
  onUpdateField: (field: keyof WeldFormData, value: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export const WeldFormScreen: React.FC<WeldFormScreenProps> = ({
  formData,
  isEditMode,
  onUpdateField,
  onSave,
  onBack
}) => {
  // Debug logging
  useEffect(() => {
    console.log('WeldFormScreen rendered with:', { formData, isEditMode });
  }, [formData, isEditMode]);

  const updateField = useCallback((field: keyof WeldFormData, value: string) => {
    console.log(`Updating field ${field} with value: ${value}`);
    onUpdateField(field, value);
  }, [onUpdateField]);

  // Check if formData is valid
  if (!formData) {
    console.error('formData is undefined or null');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Form data not loaded</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Weld' : 'Add New Weld'}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.subtitle}>
          {isEditMode ? 'Edit Weld Inspection Form' : 'SAW Groove Weld Inspection Form - 2 Required Fields'}
        </Text>
        
        <View style={styles.formSection}>
          {/* Row 1 - Weld Number First */}
          <View style={styles.formRow}>
            <FormField
              label="1. Weld Number *"
              value={formData.weldNumber || ''}
              onChangeText={(value) => updateField('weldNumber', value)}
              placeholder="Enter Weld Number"
              required
            />
            <FormField
              label="2. NDE Number *"
              value={formData.ndeNumber || ''}
              onChangeText={(value) => updateField('ndeNumber', value)}
              placeholder="Enter NDE Number"
              required
            />
          </View>

          {/* Row 2 */}
          <View style={styles.formRow}>
            <FormField
              label="3. WPS"
              value={formData.wps || ''}
              onChangeText={(value) => updateField('wps', value)}
              placeholder="Enter WPS"
            />
            <DatePickerField
              label="4. Date"
              value={formData.date || ''}
              onDateChange={(value) => updateField('date', value)}
              placeholder="MM/DD/YYYY"
            />
          </View>

          {/* Row 3 */}
          <View style={styles.formRow}>
            <FormField
              label="5. Type Fit"
              value={formData.typeFit || ''}
              onChangeText={(value) => updateField('typeFit', value)}
              placeholder="Enter Type Fit"
            />
            <FormField
              label="6. Pipe Diameter"
              value={formData.pipeDia || ''}
              onChangeText={(value) => updateField('pipeDia', value)}
              placeholder="Enter Pipe Diameter"
            />
          </View>

          {/* Row 4 */}
          <View style={styles.formRow}>
            <FormField
              label="7. Grade/Class"
              value={formData.gradeClass || ''}
              onChangeText={(value) => updateField('gradeClass', value)}
              placeholder="Enter Grade/Class"
            />
            <FormField
              label="8. Welder Name"
              value={formData.welder || ''}
              onChangeText={(value) => updateField('welder', value)}
              placeholder="Enter Welder Name"
            />
          </View>

          {/* Row 5 */}
          <View style={styles.formRow}>
            <FormField
              label="9. Inspector Name"
              value={formData.inspector || ''}
              onChangeText={(value) => updateField('inspector', value)}
              placeholder="Enter Inspector Name"
            />
            <FormField
              label="10. First HT"
              value={formData.firstHT || ''}
              onChangeText={(value) => updateField('firstHT', value)}
              placeholder="Enter First HT"
            />
          </View>

          {/* Row 6 */}
          <View style={styles.formRow}>
            <FormField
              label="11. First MFG"
              value={formData.firstMfg || ''}
              onChangeText={(value) => updateField('firstMfg', value)}
              placeholder="Enter First MFG"
            />
            <FormField
              label="12. First Length"
              value={formData.firstLength || ''}
              onChangeText={(value) => updateField('firstLength', value)}
              placeholder="Enter First Length"
            />
          </View>

          {/* Row 7 */}
          <View style={styles.formRow}>
            <FormField
              label="13. JT Number"
              value={formData.jtNumber || ''}
              onChangeText={(value) => updateField('jtNumber', value)}
              placeholder="Enter JT Number"
            />
            <FormField
              label="14. Second HT"
              value={formData.secondHT || ''}
              onChangeText={(value) => updateField('secondHT', value)}
              placeholder="Enter Second HT"
            />
          </View>

          {/* Row 8 */}
          <View style={styles.formRow}>
            <FormField
              label="15. Second MFG"
              value={formData.secondMfg || ''}
              onChangeText={(value) => updateField('secondMfg', value)}
              placeholder="Enter Second MFG"
            />
            <FormField
              label="16. Second Length"
              value={formData.secondLength || ''}
              onChangeText={(value) => updateField('secondLength', value)}
              placeholder="Enter Second Length"
            />
          </View>

          {/* Row 9 */}
          <View style={styles.formRow}>
            <FormField
              label="17. Pre Heat"
              value={formData.preHeat || ''}
              onChangeText={(value) => updateField('preHeat', value)}
              placeholder="Enter Pre Heat"
            />
            <FormField
              label="18. VT"
              value={formData.vt || ''}
              onChangeText={(value) => updateField('vt', value)}
              placeholder="Enter VT"
            />
          </View>

          {/* Row 10 */}
          <View style={styles.formRow}>
            <FormField
              label="19. Process"
              value={formData.process || ''}
              onChangeText={(value) => updateField('process', value)}
              placeholder="Enter Process"
            />
            <FormField
              label="20. Amps"
              value={formData.amps || ''}
              onChangeText={(value) => updateField('amps', value)}
              placeholder="Enter Amps"
            />
          </View>

          {/* Row 11 */}
          <View style={styles.formRow}>
            <FormField
              label="21. Volts"
              value={formData.volts || ''}
              onChangeText={(value) => updateField('volts', value)}
              placeholder="Enter Volts"
            />
            <FormField
              label="22. IPM"
              value={formData.ipm || ''}
              onChangeText={(value) => updateField('ipm', value)}
              placeholder="Enter IPM"
            />
          </View>

          {/* Row 12 - Status */}
          <View style={styles.formRow}>
            <View style={styles.statusField}>
              <Text style={styles.statusLabel}>23. Status</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    (formData.status === 'pending' || !formData.status) && styles.statusOptionActive
                  ]}
                  onPress={() => updateField('status', 'pending')}
                >
                  <Text style={[
                    styles.statusOptionText,
                    (formData.status === 'pending' || !formData.status) && styles.statusOptionTextActive
                  ]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    formData.status === 'approved' && styles.statusOptionActive
                  ]}
                  onPress={() => updateField('status', 'approved')}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === 'approved' && styles.statusOptionTextActive
                  ]}>Approved</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    formData.status === 'rejected' && styles.statusOptionActive
                  ]}
                  onPress={() => updateField('status', 'rejected')}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === 'rejected' && styles.statusOptionTextActive
                  ]}>Rejected</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Row 13 - Signatures (At the end) */}
          <View style={styles.formRow}>
            <SignatureField
              label="24. Welder Signature"
              value={formData.welderSignature || ''}
              onSignatureCaptured={(signature) => updateField('welderSignature', signature)}
              onClear={() => updateField('welderSignature', '')}
            />
            <SignatureField
              label="25. Inspector Signature"
              value={formData.inspectorSignature || ''}
              onSignatureCaptured={(signature) => updateField('inspectorSignature', signature)}
              onClear={() => updateField('inspectorSignature', '')}
            />
          </View>

          {/* Row 14 - Image Uploads */}
          <View style={styles.formRow}>
            <ImageUploadField
              label="26. Weld Sketch"
              value={formData.weldSketch || ''}
              onImageChange={(imageUri) => updateField('weldSketch', imageUri)}
              description={formData.weldSketchDescription || ''}
              onDescriptionChange={(description) => updateField('weldSketchDescription', description)}
              placeholder="Add Weld Sketch"
            />
            <ImageUploadField
              label="27. Defect Sketch"
              value={formData.defectSketch || ''}
              onImageChange={(imageUri) => updateField('defectSketch', imageUri)}
              description={formData.defectSketchDescription || ''}
              onDescriptionChange={(description) => updateField('defectSketchDescription', description)}
              placeholder="Add Defect Sketch"
            />
          </View>
          
          <TouchableOpacity style={styles.button} onPress={onSave}>
            <Text style={styles.buttonText}>
              {isEditMode ? 'Update Weld' : 'Save Weld Inspection'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50, // Adjust for safe area
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 25,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 40,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    alignItems: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
  statusField: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  statusOptionTextActive: {
    color: '#ffffff',
  },
});
