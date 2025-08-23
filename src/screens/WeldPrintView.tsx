import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { Weld } from '../types/Weld';
import { WeldCardData } from '../types/WeldCard';
import { formatDateToUS } from '../utils/dateUtils';

interface WeldPrintViewProps {
  card: WeldCardData;
  onBack: () => void;
}

const { width, height } = Dimensions.get('window');

export const WeldPrintView: React.FC<WeldPrintViewProps> = ({
  card,
  onBack,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const contentRef = useRef<ViewShot>(null);

  const captureScreenshot = async () => {
    if (!contentRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Capture the content
      const uri = await contentRef.current.capture();
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `weld-card-${timestamp}.png`;
      
      // Save to gallery
      const galleryPath = `${RNFS.PicturesDirectoryPath}/${filename}`;
      await RNFS.copyFile(uri, galleryPath);
      
      Alert.alert(
        'Screenshot Saved',
        `Screenshot saved to gallery as ${filename}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to save screenshot to gallery');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weld Card Report</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.screenshotButton]} 
              onPress={captureScreenshot}
              disabled={isCapturing}
            >
              <Icon name="camera-outline" size={24} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, styles.printButton]} 
              onPress={() => {
                // TODO: Implement print functionality
                console.log('Print functionality to be implemented');
              }}
            >
              <Icon name="print-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* A4 Print Layout */}
        <ViewShot ref={contentRef} style={styles.printContainer}>
          {/* Company Header */}
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>jSteel Pro</Text>
            <Text style={styles.companySubtitle}>Weld Inspection Management</Text>
            <Text style={styles.reportTitle}>WELD CARD REPORT</Text>
          </View>



          {/* Two Column Layout for Landscape */}
          <View style={styles.twoColumnContainer}>
            {/* Left Column - Basic Information */}
            <View style={[styles.section, styles.columnSection]}>
              <Text style={styles.sectionTitle}>Card Information</Text>
              <View style={styles.infoGrid}>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>{formatDateToUS(card.date)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Welds:</Text>
                  <Text style={styles.infoValue}>{card.welds.length}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>{card.createdAt ? formatDateToUS(card.createdAt) : 'N/A'}</Text>
                </View>
              </View>
            </View>

            {/* Right Column - Image Information */}
            <View style={[styles.section, styles.columnSection]}>
              <Text style={styles.sectionTitle}>Images & Sketches</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weld Sketch:</Text>
                  <View style={styles.imageContainer}>
                    {card.weldSketch ? (
                      <TouchableOpacity 
                        style={styles.thumbnailContainer}
                        onPress={() => {
                          setSelectedImage(card.weldSketch);
                          setImageModalVisible(true);
                        }}
                      >
                        <Image 
                          source={{ uri: card.weldSketch }} 
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.thumbnailOverlay}>
                          <Icon name="eye" size={16} color="#ffffff" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noImageText}>No Image</Text>
                    )}
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weld Description:</Text>
                  <Text style={styles.infoValue}>{card.weldSketchDescription || 'No Description'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Defect Sketch:</Text>
                  <View style={styles.imageContainer}>
                    {card.defectSketch ? (
                      <TouchableOpacity 
                        style={styles.thumbnailContainer}
                        onPress={() => {
                          setSelectedImage(card.defectSketch);
                          setImageModalVisible(true);
                        }}
                      >
                        <Image 
                          source={{ uri: card.defectSketch }} 
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.thumbnailOverlay}>
                          <Icon name="eye" size={16} color="#ffffff" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noImageText}>No Image</Text>
                    )}
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Defect Description:</Text>
                  <Text style={styles.infoValue}>{card.defectSketchDescription || 'No Description'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weld Table Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weld Specifications</Text>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>Weld #</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>WID #</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>Pipe Size</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>Type</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>Cap Size</Text>
                <Text style={styles.tableHeaderCell}>Passes</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>WPS</Text>
                <Text style={[styles.tableHeaderCell, { borderRightWidth: 1 }]}>Electrode</Text>
                <Text style={styles.tableHeaderCell}>RT</Text>
              </View>

              {/* Table Rows */}
              {card.welds.map((weld, index) => (
                <View key={weld.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.weldNumber || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.widNumber || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.pipeSizeInches || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.typeOfWeld || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.capSize || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{weld.passes || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.wpsNumberAndTitle || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { borderRightWidth: 1 }]}>{weld.electrodeTypeBrand || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{weld.rt || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              <TouchableOpacity 
                style={styles.zoomCloseButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Icon name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  screenshotButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  printButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  printContainer: {
    backgroundColor: '#ffffff',
    margin: 24,
    padding: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: width > height ? width - 48 : width - 48, // Landscape optimized with increased margin
    alignSelf: 'center',
  },
  companyHeader: {
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 4,
  },
  companySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },

  twoColumnContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  columnSection: {
    flex: 1,
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  infoGrid: {
    gap: 12,
    paddingHorizontal: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    maxWidth: '50%',
  },
  infoValue: {
    fontSize: 13,
    color: '#1f2937',
    flex: 1,
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  // Table styles
  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  cardId: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  // Image thumbnail styles
  imageContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: width > 768 ? 32 : 20, // More padding on tablets
    margin: width > 768 ? 16 : 20, // Less margin on tablets for more content space
    maxWidth: width > 768 ? '95%' : '90%', // Larger on tablets
    maxHeight: height > 768 ? '95%' : '90%', // Larger on tablets
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    width: '100%',
  },
  previewImage: {
    width: width > 768 ? Math.min(width * 0.8, 800) : 300,
    height: height > 768 ? Math.min(height * 0.7, 600) : 300,
    borderRadius: 8,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1000,
  },
});
