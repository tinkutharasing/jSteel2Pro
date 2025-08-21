import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { formatDateToUS } from '../utils/dateUtils';

interface WeldViewScreenProps {
  weld: Weld;
  onBack: () => void;
  onEdit: (weld: Weld) => void;
}

export const WeldViewScreen: React.FC<WeldViewScreenProps> = ({ weld, onBack, onEdit }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Detect if we're on a tablet (width > 768px)
  const isTablet = Dimensions.get('window').width > 768;
  
  // Responsive image dimensions
  const imageWidth = '100%';
  const imageHeight = isTablet ? 300 : 200;
  const imageMaxWidth = isTablet ? 500 : '100%';
  const imageMinWidth = isTablet ? 300 : '100%';

  const openImagePreview = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Weld Details</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(weld)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Weld {weld.weldNumber} - {weld.wps} - {formatDateToUS(weld.date)}</Text>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
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
            <Text style={styles.viewValue}>{formatDateToUS(weld.date)}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Type/Fit:</Text>
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
            <Text style={styles.viewLabel}>Welder Name:</Text>
            <Text style={styles.viewValue}>{weld.welder}</Text>
          </View>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Inspector Name:</Text>
            <Text style={styles.viewValue}>{weld.inspector}</Text>
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

        {/* First Pass */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>First Pass</Text>
          
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
        </View>

        {/* Second Pass */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Second Pass</Text>
          
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
        </View>

        {/* Process Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Process Parameters</Text>
          
          <View style={styles.viewRow}>
            <Text style={styles.viewLabel}>Pre-Heat:</Text>
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
        </View>

        {/* Image Fields */}
        <View style={[styles.imageSection, isTablet && styles.imageSectionTablet]}>
          <Text style={styles.imageSectionTitle}>Images</Text>
          
          <View style={[styles.imageRow, isTablet && styles.imageRowTablet]}>
            <View style={[styles.imageField, isTablet && styles.imageFieldTablet]}>
              <Text style={[styles.imageLabel, isTablet && styles.imageLabelTablet]}>Weld Sketch:</Text>
              {weld.weldSketch ? (
                <View style={styles.imageContent}>
                  <TouchableOpacity onPress={() => openImagePreview(weld.weldSketch!)}>
                    <Image 
                      source={{ uri: weld.weldSketch }} 
                      style={[styles.imagePreview, { height: imageHeight, maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  {weld.weldSketchDescription && (
                    <Text style={[styles.imageDescription, { maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}>
                      {weld.weldSketchDescription}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={[styles.noImageContainer, { height: imageHeight, maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}>
                  <Text style={styles.noImageText}>No weld sketch uploaded</Text>
                </View>
              )}
            </View>
            
            <View style={[styles.imageField, isTablet && styles.imageFieldTablet]}>
              <Text style={[styles.imageLabel, isTablet && styles.imageLabelTablet]}>Defect Sketch:</Text>
              {weld.defectSketch ? (
                <View style={styles.imageContent}>
                  <TouchableOpacity onPress={() => openImagePreview(weld.defectSketch!)}>
                    <Image 
                      source={{ uri: weld.defectSketch }} 
                      style={[styles.imagePreview, { height: imageHeight, maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  {weld.defectSketchDescription && (
                    <Text style={[styles.imageDescription, { maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}>
                      {weld.defectSketchDescription}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={[styles.noImageContainer, { height: imageHeight, maxWidth: imageMaxWidth, minWidth: imageMinWidth }]}>
                  <Text style={styles.noImageText}>No defect sketch uploaded</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Welder Signature:</Text>
              {weld.welderSignature ? (
                <Image 
                  source={{ uri: weld.welderSignature }} 
                  style={styles.signaturePreview}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.noSignatureText}>No signature</Text>
              )}
            </View>
            
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Inspector Signature:</Text>
              {weld.inspectorSignature ? (
                <Image 
                  source={{ uri: weld.inspectorSignature }} 
                  style={styles.signaturePreview}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.noSignatureText}>No signature</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeImagePreview} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
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
  },
  viewValue: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
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
  imageSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  imageSectionTablet: {
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
  imageSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageSectionRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  imageRowTablet: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
  imageField: {
    flex: 1,
    alignItems: 'center',
    minWidth: 150,
    maxWidth: '100%',
    paddingHorizontal: 5,
  },
  imageFieldTablet: {
    flex: 1,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 500,
    paddingHorizontal: 10,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageLabelTablet: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContent: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    minWidth: 150,
    maxWidth: '100%',
    resizeMode: 'cover',
  },
  imageDescription: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    minHeight: 50,
    maxWidth: '100%',
  },
  noImageText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    width: '100%',
    minWidth: 200,
    maxWidth: 400,
    minHeight: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageContainer: {
    width: '100%',
    minWidth: 150,
    maxWidth: '100%',
    minHeight: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
  signaturePreview: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#333',
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
