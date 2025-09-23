import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { formatDateToUS } from '../utils/dateUtils';
import { FieldConfig } from '../types/FieldConfig';
import FieldConfigService from '../services/FieldConfigService';

interface WeldViewScreenProps {
  weld: Weld;
  onBack: () => void;
  onEdit: (weld: Weld) => void;
}

export const WeldViewScreen: React.FC<WeldViewScreenProps> = ({ weld, onBack, onEdit }) => {
  const [fieldConfigs, setFieldConfigs] = useState<{
    header: FieldConfig[];
    table: FieldConfig[];
    footer: FieldConfig[];
  }>({ header: [], table: [], footer: [] });

  // Detect if we're on a tablet (width > 768px)
  const isTablet = Dimensions.get('window').width > 768;

  useEffect(() => {
    loadFieldConfigs();
  }, []);

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

  const renderFieldValue = (field: FieldConfig) => {
    const value = (weld as any)[field.key];
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Weld Details</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(weld)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Weld {weld.weldNumber || 'No Number'} - {formatDateToUS(weld.date)}</Text>
        
        {/* Header Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Header Information</Text>
          
          {fieldConfigs.header.map(field => (
            <View key={field.id} style={styles.viewRow}>
              <Text style={styles.viewLabel}>{field.label}:</Text>
              <Text style={styles.viewValue}>{renderFieldValue(field)}</Text>
            </View>
          ))}
        </View>

        {/* Weld Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weld Table</Text>
          
          {fieldConfigs.table.map(field => (
            <View key={field.id} style={styles.viewRow}>
              <Text style={styles.viewLabel}>{field.label}:</Text>
              <Text style={styles.viewValue}>{renderFieldValue(field)}</Text>
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {fieldConfigs.footer.map(field => (
            <View key={field.id} style={styles.viewRow}>
              <Text style={styles.viewLabel}>{field.label}:</Text>
              <Text style={styles.viewValue}>{renderFieldValue(field)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingBottom: 50, // Add padding for bottom buttons
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  viewLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  viewValue: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: '#1e293b',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusApproved: {
    backgroundColor: '#d1fae5',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  signatureImage: {
    width: 200,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

