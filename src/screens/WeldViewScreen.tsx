import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image, Platform } from 'react-native';
import { Weld } from '../types/Weld';

interface WeldViewScreenProps {
  weld: Weld;
  onEdit: (weld: Weld) => void;
  onDelete: (weld: Weld) => void;
  onBack: () => void;
}

export const WeldViewScreen: React.FC<WeldViewScreenProps> = ({
  weld,
  onEdit,
  onDelete,
  onBack
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent"
        translucent={false}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonContainer} onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Weld Details</Text>
        <Text style={styles.subtitle}>{weld.wps} - {weld.date}</Text>
        
        <View style={styles.viewSection}>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Weld Number:</Text>
            <Text style={styles.viewValue}>{weld.weldNumber}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>NDE Number:</Text>
            <Text style={styles.viewValue}>{weld.ndeNumber}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>WPS:</Text>
            <Text style={styles.viewValue}>{weld.wps}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Date:</Text>
            <Text style={styles.viewValue}>{weld.date}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Type Fit:</Text>
            <Text style={styles.viewValue}>{weld.typeFit}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Pipe Diameter:</Text>
            <Text style={styles.viewValue}>{weld.pipeDia}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Grade/Class:</Text>
            <Text style={styles.viewValue}>{weld.gradeClass}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Welder:</Text>
            <Text style={styles.viewValue}>{weld.welder}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Inspector:</Text>
            <Text style={styles.viewValue}>{weld.inspector}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>First HT:</Text>
            <Text style={styles.viewValue}>{weld.firstHT}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>First MFG:</Text>
            <Text style={styles.viewValue}>{weld.firstMfg}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>First Length:</Text>
            <Text style={styles.viewValue}>{weld.firstLength}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>JT Number:</Text>
            <Text style={styles.viewValue}>{weld.jtNumber}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Second HT:</Text>
            <Text style={styles.viewValue}>{weld.secondHT}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Second MFG:</Text>
            <Text style={styles.viewValue}>{weld.secondMfg}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Second Length:</Text>
            <Text style={styles.viewValue}>{weld.secondLength}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Pre Heat:</Text>
            <Text style={styles.viewValue}>{weld.preHeat}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>VT:</Text>
            <Text style={styles.viewValue}>{weld.vt}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Process:</Text>
            <Text style={styles.viewValue}>{weld.process}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Amps:</Text>
            <Text style={styles.viewValue}>{weld.amps}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Volts:</Text>
            <Text style={styles.viewValue}>{weld.volts}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>IPM:</Text>
            <Text style={styles.viewValue}>{weld.ipm}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Status:</Text>
            <Text style={[styles.viewValue, styles[`status${weld.status.charAt(0).toUpperCase() + weld.status.slice(1)}`]]}>
              {weld.status}
            </Text>
          </View>
          
          {/* Signature Fields */}
          <View style={styles.signatureSection}>
            <Text style={styles.signatureSectionTitle}>Signatures</Text>
            
            <View style={styles.signatureRow}>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Welder Signature:</Text>
                {weld.welderSignature ? (
                  <Image 
                    source={{ uri: weld.welderSignature }} 
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.noSignatureText}>No signature captured</Text>
                )}
              </View>
              
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Inspector Signature:</Text>
                {weld.inspectorSignature ? (
                  <Image 
                    source={{ uri: weld.inspectorSignature }} 
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.noSignatureText}>No signature captured</Text>
                )}
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(weld)}>
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(weld)}>
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButtonContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '700',
  },

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  viewSection: {
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
  },
  viewValue: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  statusPending: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  statusApproved: {
    color: '#10b981',
    fontWeight: '700',
  },
  statusRejected: {
    color: '#ef4444',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    gap: 16,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  signatureSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  signatureSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 20,
  },
  signatureField: {
    flex: 1,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  signatureImage: {
    width: 120,
    height: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  noSignatureText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    width: 120,
  },
});
