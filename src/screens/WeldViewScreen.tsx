import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { formatDateToUS } from '../utils/dateUtils';

interface WeldViewScreenProps {
  weld: Weld;
  onBack: () => void;
  onEdit: (weld: Weld) => void;
}

export const WeldViewScreen: React.FC<WeldViewScreenProps> = ({ weld, onBack, onEdit }) => {
  // Detect if we're on a tablet (width > 768px)
  const isTablet = Dimensions.get('window').width > 768;

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
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welder Name:</Text>
            <Text style={styles.viewValue}>{weld.welderName || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Date:</Text>
            <Text style={styles.viewValue}>{formatDateToUS(weld.date)}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welder Type:</Text>
            <Text style={styles.viewValue}>
              {weld.welderCompany ? 'Company' : ''}
              {weld.welderCompany && weld.welderContractor ? ' | ' : ''}
              {weld.welderContractor ? 'Contractor' : ''}
              {!weld.welderCompany && !weld.welderContractor ? 'N/A' : ''}
            </Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>LOA/TCC/MOD:</Text>
            <Text style={styles.viewValue}>{weld.loaTccMod || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welding Contractor Name:</Text>
            <Text style={styles.viewValue}>{weld.weldingContractorName || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>WO/JO#:</Text>
            <Text style={styles.viewValue}>{weld.woJoNumber || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welding Inspector Name:</Text>
            <Text style={styles.viewValue}>{weld.weldingInspectorName || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welding Inspection Company:</Text>
            <Text style={styles.viewValue}>{weld.weldingInspectionCompany || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Job Location:</Text>
            <Text style={styles.viewValue}>{weld.jobLocation || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Number of Welds Made Today:</Text>
            <Text style={styles.viewValue}>{weld.numberOfWeldsMadeToday || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Stencil #:</Text>
            <Text style={styles.viewValue}>{weld.stencilNumber || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Process Used:</Text>
            <Text style={styles.viewValue}>{weld.processUsed || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Status:</Text>
            <View style={[
              styles.statusBadge, 
              weld.status === 'pending' ? styles.statusPending :
              weld.status === 'approved' ? styles.statusApproved :
              styles.statusRejected
            ]}>
              <Text style={styles.statusText}>{weld.status}</Text>
            </View>
          </View>
        </View>

        {/* Weld Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weld Table</Text>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Weld #:</Text>
            <Text style={styles.viewValue}>{weld.weldNumber || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Pipe Size (In.):</Text>
            <Text style={styles.viewValue}>{weld.pipeSizeInches || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Butt:</Text>
            <Text style={styles.viewValue}>{weld.butt || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Fillet (Tee, Sleeve, Other):</Text>
            <Text style={styles.viewValue}>{weld.fillet || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Passes:</Text>
            <Text style={styles.viewValue}>{weld.passes || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Cap Size:</Text>
            <Text style={styles.viewValue}>{weld.capSize || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>WPS # and Title Used:</Text>
            <Text style={styles.viewValue}>{weld.wpsNumberAndTitle || 'N/A'}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Electrode Type/Brand:</Text>
            <Text style={styles.viewValue}>{weld.electrodeTypeBrand || 'N/A'}</Text>
          </View>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Weld Sketch:</Text>
            <Text style={styles.viewValue}>{weld.weldSketch ? 'Uploaded' : 'Not uploaded'}</Text>
          </View>
          
          {weld.weldSketchDescription && (
            <View style={styles.viewRow}>
              <Text style={styles.viewLabel}>Weld Sketch Description:</Text>
              <Text style={styles.viewValue}>{weld.weldSketchDescription}</Text>
            </View>
          )}
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Defect Sketch:</Text>
            <Text style={styles.viewValue}>{weld.defectSketch ? 'Uploaded' : 'Not uploaded'}</Text>
          </View>
          
          {weld.defectSketchDescription && (
            <View style={styles.viewRow}>
              <Text style={styles.viewLabel}>Defect Sketch Description:</Text>
              <Text style={styles.viewValue}>{weld.defectSketchDescription}</Text>
            </View>
          )}
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
});

