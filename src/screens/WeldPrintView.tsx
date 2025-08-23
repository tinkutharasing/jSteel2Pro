import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { WeldCardData } from '../types/WeldCard';

interface WeldPrintViewProps {
  card: WeldCardData;
  onBack: () => void;
}

const WeldPrintView: React.FC<WeldPrintViewProps> = ({ card, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const weldSketchRef = useRef<ViewShot>(null);
  const defectSketchRef = useRef<ViewShot>(null);

  const handleScreenshot = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image first.');
      return;
    }

    setIsCapturing(true);
    try {
      let uri: string;
      
      // Capture the selected image with proper null checks
      if (selectedImage === 'weldSketch') {
        if (!weldSketchRef.current) {
          throw new Error('Weld sketch reference not available');
        }
        uri = await weldSketchRef.current!.capture();
      } else if (selectedImage === 'defectSketch') {
        if (!defectSketchRef.current) {
          throw new Error('Defect sketch reference not available');
        }
        uri = await defectSketchRef.current!.capture();
      } else {
        throw new Error('Invalid image reference');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `weld_card_${selectedImage}_${timestamp}.png`;
      
      // Save to Pictures folder - this should appear in gallery on most devices
      const picturesPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;
      
      await RNFS.copyFile(uri, picturesPath);
      await RNFS.unlink(uri); // Clean up temporary file

      Alert.alert(
        'Screenshot Saved',
        `Screenshot saved to Pictures folder as ${fileName}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = () => {
    Alert.alert('Print', 'Print functionality would be implemented here');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section - Two Columns */}
      <View style={styles.headerSection}>
        {/* Left Column - jSteel Pro Info */}
        <View style={styles.leftColumn}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>jSteel Pro</Text>
            <Text style={styles.subtitleText}>Welding Inspector</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Card ID:</Text>
            <Text style={styles.infoValue}>{card.cardId || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(card.date)}</Text>
          </View>
        </View>

        {/* Right Column - Card Information */}
        <View style={styles.rightColumn}>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Date:</Text>
            <Text style={styles.cardInfoValue}>{formatDate(card.date)}</Text>
          </View>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Welds:</Text>
            <Text style={styles.cardInfoValue}>{card.welds?.length || 'N/A'}</Text>
          </View>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Created:</Text>
            <Text style={styles.cardInfoValue}>{card.createdAt ? formatDate(card.createdAt) : 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Table Section */}
      <View style={styles.tableSection}>
        <Text style={styles.sectionTitle}>Weld Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Weld ID</Text>
            <Text style={styles.headerCell}>Type</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Notes</Text>
          </View>
          {card.welds?.map((weld: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{weld.weldNumber || 'N/A'}</Text>
              <Text style={styles.cell}>{weld.typeOfWeld || 'N/A'}</Text>
              <Text style={styles.cell}>{weld.status || 'N/A'}</Text>
              <Text style={styles.cell}>{weld.notes || 'N/A'}</Text>
            </View>
          )) || (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>-</Text>
              <Text style={styles.cell}>-</Text>
              <Text style={styles.cell}>-</Text>
              <Text style={styles.cell}>-</Text>
            </View>
          )}
        </View>
      </View>

      {/* Images Section - Two Columns */}
      <View style={styles.imagesSection}>
        <Text style={styles.sectionTitle}>Images & Sketches</Text>
        <View style={styles.imagesGrid}>
          {/* Left Column */}
          <View style={styles.imageColumn}>
            <View style={styles.imageItem}>
              <View style={styles.imageContainer}>
                {card.weldSketch ? (
                  <ViewShot
                    ref={weldSketchRef}
                    style={styles.imageWrapper}
                  >
                    <Text style={styles.imageText}>Weld Sketch</Text>
                  </ViewShot>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Icon name="image-outline" size={48} color="#9ca3af" />
                    <Text style={styles.noImageText}>No Weld Sketch</Text>
                  </View>
                )}
              </View>
              <Text style={styles.imageDescription}>Weld Sketch</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setSelectedImage('weldSketch')}
              >
                <Text style={styles.selectButtonText}>Select for Screenshot</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.imageColumn}>
            <View style={styles.imageItem}>
              <View style={styles.imageContainer}>
                {card.defectSketch ? (
                  <ViewShot
                    ref={defectSketchRef}
                    style={styles.imageWrapper}
                  >
                    <Text style={styles.imageText}>Defect Sketch</Text>
                  </ViewShot>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Icon name="image-outline" size={48} color="#9ca3af" />
                    <Text style={styles.noImageText}>No Defect Sketch</Text>
                  </View>
                )}
              </View>
              <Text style={styles.imageDescription}>Defect Sketch</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setSelectedImage('defectSketch')}
              >
                <Text style={styles.selectButtonText}>Select for Screenshot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.screenshotButton]}
          onPress={handleScreenshot}
          disabled={isCapturing || !selectedImage}
        >
          <Icon name="camera" size={24} color="#10b981" />
          <Text style={styles.buttonText}>
            {isCapturing ? 'Capturing...' : 'Screenshot'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrint}
        >
          <Icon name="print" size={24} color="#3b82f6" />
          <Text style={styles.buttonText}>Print</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={onBack}
        >
          <Icon name="arrow-back" size={24} color="#6b7280" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  
  // Header Section - Two Columns
  headerSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  // Left Column - jSteel Pro Info
  leftColumn: {
    flex: 1,
    marginRight: 20,
  },
  
  logoSection: {
    marginBottom: 16,
  },
  
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  
  subtitleText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    width: 80,
  },
  
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  
  // Right Column - Card Information
  rightColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  cardInfoLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    width: 80,
  },
  
  cardInfoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  
  // Table Section
  tableSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
  headerCell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  
  // Images Section - Two Columns
  imagesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  imagesGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  
  imageColumn: {
    flex: 1,
  },
  
  imageItem: {
    alignItems: 'center',
  },
  
  imageContainer: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  
  imageText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  noImageText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  
  imageDescription: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  
  selectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  screenshotButton: {
    borderColor: '#10b981',
  },
  
  printButton: {
    borderColor: '#3b82f6',
  },
  
  backButton: {
    borderColor: '#6b7280',
  },
  
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default WeldPrintView;
