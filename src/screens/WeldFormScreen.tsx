import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { WeldFormData } from '../types/Weld';
import { FormField, CheckboxField } from '../components/FormField';
import { DatePickerField } from '../components/DatePickerField';

interface WeldFormScreenProps {
  formData: WeldFormData;
  isEditMode: boolean;
  onUpdateField: (field: keyof WeldFormData, value: string | boolean) => void;
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

  const updateField = useCallback((field: keyof WeldFormData, value: string | boolean) => {
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
          {isEditMode ? 'Edit Weld Inspection Form' : 'New Weld Form'}
        </Text>
        
        {/* Header Information Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Header Information</Text>
          
          {/* Row 1 - Welder Name and Date */}
          <View style={styles.formRow}>
            <FormField
              label="Welder Name"
              value={formData.welderName || ''}
              onChangeText={(value) => updateField('welderName', value)}
              placeholder="e.g., CHARLES UBERROTH"
              required
            />
            <DatePickerField
              label="Date"
              value={formData.date || ''}
              onDateChange={(value) => updateField('date', value)}
              placeholder="MM/DD/YYYY"
              required
            />
          </View>

          {/* Row 2 - Company/Contractor Selection */}
          <View style={styles.formRow}>
            <CheckboxField
              label="Company"
              value={formData.welderCompany || false}
              onChange={(value) => updateField('welderCompany', value)}
            />
            <CheckboxField
              label="Contractor"
              value={formData.welderContractor || false}
              onChange={(value) => updateField('welderContractor', value)}
            />
          </View>

          {/* Row 3 - LOA/TCC/MOD and Contractor Name */}
          <View style={styles.formRow}>
            <FormField
              label="LOA/TCC/MOD"
              value={formData.loaTccMod || ''}
              onChangeText={(value) => updateField('loaTccMod', value)}
              placeholder="Leave blank if not applicable"
            />
            <FormField
              label="Welding Contractor Name"
              value={formData.weldingContractorName || ''}
              onChangeText={(value) => updateField('weldingContractorName', value)}
              placeholder="e.g., NPL"
            />
          </View>

          {/* Row 4 - WO/JO# and Inspector Name */}
          <View style={styles.formRow}>
            <FormField
              label="WO/JO#"
              value={formData.woJoNumber || ''}
              onChangeText={(value) => updateField('woJoNumber', value)}
              placeholder="Leave blank if not applicable"
            />
            <FormField
              label="Welding Inspector Name"
              value={formData.weldingInspectorName || ''}
              onChangeText={(value) => updateField('weldingInspectorName', value)}
              placeholder="e.g., SHAMJITH KS"
              required
            />
          </View>

          {/* Row 5 - Inspection Company and Job Location */}
          <View style={styles.formRow}>
            <FormField
              label="Welding Inspection Company"
              value={formData.weldingInspectionCompany || ''}
              onChangeText={(value) => updateField('weldingInspectionCompany', value)}
              placeholder="e.g., CPI"
              required
            />
            <FormField
              label="Job Location"
              value={formData.jobLocation || ''}
              onChangeText={(value) => updateField('jobLocation', value)}
              placeholder="e.g., WO24413-914; 25128 Old Cleveland Road"
              required
            />
          </View>

          {/* Row 6 - Number of Welds and Stencil */}
          <View style={styles.formRow}>
            <FormField
              label="Number of Welds Made Today"
              value={formData.numberOfWeldsMadeToday || ''}
              onChangeText={(value) => updateField('numberOfWeldsMadeToday', value)}
              placeholder="Leave blank if not applicable"
            />
            <FormField
              label="Stencil #"
              value={formData.stencilNumber || ''}
              onChangeText={(value) => updateField('stencilNumber', value)}
              placeholder="e.g., QA"
            />
          </View>

          {/* Row 7 - Process Used */}
          <View style={styles.formRow}>
            <FormField
              label="Process Used"
              value={formData.processUsed || ''}
              onChangeText={(value) => updateField('processUsed', value)}
              placeholder="e.g., SMAW"
              required
            />
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Weld Table Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Weld Table</Text>
          
          {/* Row 1 - Weld # and Pipe Size */}
          <View style={styles.formRow}>
            <FormField
              label="Weld #"
              value={formData.weldNumber || ''}
              onChangeText={(value) => updateField('weldNumber', value)}
              placeholder="Enter Weld Number"
              required
            />
            <FormField
              label="Pipe Size (In.)"
              value={formData.pipeSizeInches || ''}
              onChangeText={(value) => updateField('pipeSizeInches', value)}
              placeholder="Enter pipe size in inches"
              required
            />
          </View>

          {/* Row 2 - Butt and Fillet */}
          <View style={styles.formRow}>
            <FormField
              label="Butt"
              value={formData.butt || ''}
              onChangeText={(value) => updateField('butt', value)}
              placeholder="Enter butt information"
            />
            <FormField
              label="Fillet (Tee, Sleeve, Other)"
              value={formData.fillet || ''}
              onChangeText={(value) => updateField('fillet', value)}
              placeholder="Enter fillet information"
            />
          </View>

          {/* Row 3 - Passes and O'Clock Position */}
          <View style={styles.formRow}>
            <FormField
              label="Passes"
              value={formData.passes || ''}
              onChangeText={(value) => updateField('passes', value)}
              placeholder="Enter number of passes"
            />
            <FormField
              label="O'Clock Position"
              value={formData.oClockPosition || ''}
              onChangeText={(value) => updateField('oClockPosition', value)}
              placeholder="e.g., 12 o'clock"
            />
          </View>

          {/* Row 4 - WPS and Electrode */}
          <View style={styles.formRow}>
            <FormField
              label="WPS # and Title Used"
              value={formData.wpsNumberAndTitle || ''}
              onChangeText={(value) => updateField('wpsNumberAndTitle', value)}
              placeholder="Enter WPS number and title"
              required
            />
            <FormField
              label="Electrode Type/Brand"
              value={formData.electrodeTypeBrand || ''}
              onChangeText={(value) => updateField('electrodeTypeBrand', value)}
              placeholder="Enter electrode type and brand"
            />
          </View>

          {/* Row 5 - GPS Coordinates */}
          <View style={styles.formRow}>
            <FormField
              label="GPS Coordinates"
              value={formData.gpsCoordinates || ''}
              onChangeText={(value) => updateField('gpsCoordinates', value)}
              placeholder="Enter GPS coordinates"
            />
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          
          <View style={styles.statusField}>
            <Text style={styles.statusLabel}>Status</Text>
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
          
        <TouchableOpacity style={styles.button} onPress={onSave}>
          <Text style={styles.buttonText}>
            {isEditMode ? 'Update Weld' : 'Save Weld Inspection'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
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
    marginHorizontal: 15,
    marginBottom: 40,
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
