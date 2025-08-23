import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import RNPrint from 'react-native-print';
import { WeldCardData } from '../types/WeldCard';

interface WeldPrintViewProps {
  card: WeldCardData;
  onBack: () => void;
}

const WeldPrintView: React.FC<WeldPrintViewProps> = ({ card, onBack }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<{
    uri: string;
    title: string;
  } | null>(null);
  const weldSketchRef = useRef<ViewShot>(null);
  const defectSketchRef = useRef<ViewShot>(null);

  // Debug logging
  console.log('WeldPrintView rendered with props:', { card, onBack });
  console.log('Card type:', typeof card);
  console.log('Card content:', JSON.stringify(card, null, 2));
  console.log('Weld Sketch:', card.weldSketch);
  console.log('Defect Sketch:', card.defectSketch);
  console.log('Weld Sketch Description:', card.weldSketchDescription);
  console.log('Defect Sketch Description:', card.defectSketchDescription);

  // Validate props
  if (!card) {
    console.error('WeldPrintView: card prop is null or undefined');
    return (
      <View style={styles.container}>
        <Text>Error: No card data provided</Text>
        <TouchableOpacity onPress={onBack}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!onBack) {
    console.error('WeldPrintView: onBack prop is null or undefined');
    return (
      <View style={styles.container}>
        <Text>Error: No onBack function provided</Text>
      </View>
    );
  }

  const handleScreenshot = async () => {
    // Determine which image to capture based on availability
    let imageToCapture: 'weldSketch' | 'defectSketch' | null = null;
    let refToUse: ViewShot | null = null;
    
    if (card.weldSketch) {
      imageToCapture = 'weldSketch';
      refToUse = weldSketchRef.current;
    } else if (card.defectSketch) {
      imageToCapture = 'defectSketch';
      refToUse = defectSketchRef.current;
    }
    
    if (!imageToCapture || !refToUse) {
      Alert.alert('No Image Available', 'No weld or defect sketch images available to capture.');
      return;
    }

    setIsCapturing(true);
    try {
      console.log(`Capturing ${imageToCapture}...`);
      const uri = await refToUse.capture();
      console.log(`${imageToCapture} captured:`, uri);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `weld_card_${imageToCapture}_${timestamp}.png`;
      
      // Try multiple save locations to ensure it appears in gallery
      let savedPath = '';
      
      try {
        // First try DCIM folder (most reliable for gallery)
        const dcimPath = `${RNFS.DCIMDirectoryPath}/Camera/${fileName}`;
        console.log('Trying DCIM path:', dcimPath);
        await RNFS.copyFile(uri, dcimPath);
        savedPath = dcimPath;
        console.log('Successfully saved to DCIM:', savedPath);
      } catch (dcimError) {
        console.log('DCIM save failed, trying Pictures folder:', dcimError);
        
        try {
          // Fallback to Pictures folder
          const picturesPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;
          console.log('Trying Pictures path:', picturesPath);
          await RNFS.copyFile(uri, picturesPath);
          savedPath = picturesPath;
          console.log('Successfully saved to Pictures:', savedPath);
        } catch (picturesError) {
          console.log('Pictures save failed, trying Downloads folder:', picturesError);
          
          // Final fallback to Downloads
          const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          console.log('Trying Downloads path:', downloadsPath);
          await RNFS.copyFile(uri, downloadsPath);
          savedPath = downloadsPath;
          console.log('Successfully saved to Downloads:', savedPath);
        }
      }
      
      // Clean up temporary file
      await RNFS.unlink(uri);

      Alert.alert(
        'Screenshot Saved',
        `Screenshot saved as ${fileName}\n\nLocation: ${savedPath}\n\nNote: It may take a few moments to appear in your gallery.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to capture screenshot: ' + error.message);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = async () => {
    try {
      // Generate HTML content for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Weld Inspection Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            @page {
              margin: 0.5in;
              size: A4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .back-button {
              margin-top: 20px;
              text-align: center;
              padding: 10px;
              background-color: #f0f9ff;
              border: 2px solid #3b82f6;
              border-radius: 8px;
              display: inline-block;
              margin-left: auto;
              margin-right: auto;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 8px;
            }
            .company-subtitle {
              font-size: 18px;
              color: #64748b;
              margin-bottom: 20px;
            }
            .card-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
            }
            .info-item {
              margin: 5px 0;
            }
            .label {
              font-weight: bold;
              color: #64748b;
            }
            .value {
              color: #1e293b;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e293b;
              margin: 20px 0 10px 0;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .table th,
            .table td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              text-align: center;
              font-size: 12px;
            }
            .table th {
              background-color: #f9fafb;
              font-weight: bold;
              color: #374151;
            }
            .images-section {
              margin-top: 30px;
            }
            .image-row {
              display: flex;
              margin: 20px 0;
              align-items: flex-start;
            }
            .image-info {
              margin-right: 30px;
            }
            .image-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #374151;
            }
            .description {
              max-width: 400px;
              padding: 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .header {
                page-break-after: avoid;
                margin-top: 0;
              }
              .table {
                page-break-inside: avoid;
              }
              .image-row {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">jSteel Pro</div>
            <div class="company-subtitle">Weld Inspection Management</div>
            <div class="back-button">
              <strong style="color: #3b82f6; font-size: 16px; font-weight: 600; display: inline-block; padding: 12px 20px; border: 2px solid #3b82f6; border-radius: 8px; background-color: #f0f9ff; text-align: center; min-width: 200px;">
                ← BACK TO PREVIOUS PAGE
              </strong>
            </div>
          </div>

          <div class="card-info">
            <div>
              <div class="info-item">
                <span class="label">Date:</span> 
                <span class="value">${formatDate(card.date)}</span>
              </div>
              <div class="info-item">
                <span class="label">Card ID:</span> 
                <span class="value">${card.cardId}</span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Total Welds:</span> 
                <span class="value">${card.welds?.length || 0}</span>
              </div>
              <div class="info-item">
                <span class="label">Created:</span> 
                <span class="value">${card.createdAt ? formatDate(card.createdAt) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section-title">Weld Details</div>
          <table class="table">
            <thead>
              <tr>
                <th>Weld #</th>
                <th>WID #</th>
                <th>Pipe Size</th>
                <th>Type</th>
                <th>Cap Size</th>
                <th>Passes</th>
                <th>WPS</th>
                <th>Electrode</th>
                <th>RT</th>
              </tr>
            </thead>
            <tbody>
              ${card.welds && card.welds.length > 0 ? 
                card.welds.map((weld: any) => `
                  <tr>
                    <td>${weld.weldNumber || 'N/A'}</td>
                    <td>${weld.widNumber || 'N/A'}</td>
                    <td>${weld.pipeSizeInches || 'N/A'}</td>
                    <td>${weld.typeOfWeld || 'N/A'}</td>
                    <td>${weld.capSize || 'N/A'}</td>
                    <td>${weld.passes || 'N/A'}</td>
                    <td>${weld.wpsNumberAndTitle || 'N/A'}</td>
                    <td>${weld.electrodeTypeBrand || 'N/A'}</td>
                    <td>${weld.rt || 'N/A'}</td>
                  </tr>
                `).join('') : 
                `<tr>
                  <td colspan="9">No welds available</td>
                </tr>`
              }
            </tbody>
          </table>

          <div class="section-title">Images and Sketches</div>
          <div class="images-section">
            <div class="image-row">
              <div class="image-info">
                <div class="image-title">Weld Sketch</div>
                <div class="description">
                  ${card.weldSketchDescription || 'No weld sketch description available'}
                </div>
              </div>
            </div>
            <div class="image-row">
              <div class="image-info">
                <div class="image-title">Defect Sketch</div>
                <div class="description">
                  ${card.defectSketchDescription || 'No defect sketch description available'}
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;

      // Print the HTML content
      await RNPrint.print({
        html: htmlContent,
        jobName: `WeldCard_${card.cardId}_${new Date().toISOString().split('T')[0]}`,
      });

    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print the document. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Section - Two Columns */}
        <View style={styles.headerSection}>
          {/* Left Column - jSteel Pro Info */}
          <View style={styles.leftColumn}>
            <Text style={styles.companyName}>jSteel Pro</Text>
            <Text style={styles.companySubtitle}>Weld Inspection Management</Text>
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
          </View>
        </View>

        {/* Back Button and Action Buttons Row */}
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color="#3b82f6" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.screenshotButton]}
              onPress={handleScreenshot}
              disabled={isCapturing}
            >
              <Icon name="camera" size={20} color="#10b981" />
              <Text style={styles.actionButtonText}>
                {isCapturing ? 'Capturing...' : 'Screenshot'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.printButton]}
              onPress={handlePrint}
            >
              <Icon name="print" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Weld Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Weld #</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>WID #</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Pipe Size</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Type</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Cap Size</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Passes</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>WPS</Text>
              <Text style={[styles.headerCell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>Electrode</Text>
              <Text style={styles.headerCell}>RT</Text>
            </View>
            {card.welds && card.welds.length > 0 ? (
              card.welds.map((weld: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.weldNumber || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.widNumber || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.pipeSizeInches || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.typeOfWeld || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.capSize || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.passes || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.wpsNumberAndTitle || 'N/A'}</Text>
                  <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>{weld.electrodeTypeBrand || 'N/A'}</Text>
                  <Text style={styles.cell}>{weld.rt || 'N/A'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>No welds</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>-</Text>
                <Text style={styles.cell}>-</Text>
              </View>
            )}
          </View>
        </View>

        {/* Images Section - 4 Columns */}
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Images and Sketches</Text>
          <View style={styles.imagesGrid}>
            {/* Weld Sketch Row */}
            <View style={styles.imageRow}>
              {/* Weld Sketch Image */}
              <View style={styles.imageColumn}>
                <View style={styles.imageContainer}>
                  {card.weldSketch ? (
                    <TouchableOpacity
                      onPress={() => setSelectedImageForPreview({
                        uri: card.weldSketch!,
                        title: 'Weld Sketch'
                      })}
                      style={styles.imageTouchable}
                    >
                      <ViewShot
                        ref={weldSketchRef}
                        style={styles.imageWrapper}
                      >
                        <Image 
                          source={{ uri: card.weldSketch }} 
                          style={styles.actualImage}
                          resizeMode="contain"
                          onError={(error) => console.log('Weld sketch image error:', error)}
                        />
                      </ViewShot>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Icon name="image-outline" size={32} color="#9ca3af" />
                      <Text style={styles.noImageText}>No Weld Sketch</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.imageDescription}>Weld Sketch</Text>
              </View>

              {/* Weld Sketch Description */}
              <View style={styles.descriptionColumn}>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>
                    {card.weldSketchDescription || 'No weld sketch description available'}
                  </Text>
                </View>
                <Text style={styles.imageDescription}>Description</Text>
              </View>
            </View>

            {/* Defect Sketch Row */}
            <View style={styles.imageRow}>
              {/* Defect Sketch Image */}
              <View style={styles.imageColumn}>
                <View style={styles.imageContainer}>
                  {card.defectSketch ? (
                    <TouchableOpacity
                      onPress={() => setSelectedImageForPreview({
                        uri: card.defectSketch!,
                        title: 'Defect Sketch'
                      })}
                      style={styles.imageTouchable}
                    >
                      <ViewShot
                        ref={defectSketchRef}
                        style={styles.imageWrapper}
                      >
                        <Image 
                          source={{ uri: card.defectSketch }} 
                          style={styles.actualImage}
                          resizeMode="contain"
                          onError={(error) => console.log('Defect sketch image error:', error)}
                        />
                      </ViewShot>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Icon name="image-outline" size={32} color="#9ca3af" />
                      <Text style={styles.noImageText}>No Defect Sketch</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.imageDescription}>Defect Sketch</Text>
              </View>

              {/* Defect Sketch Description */}
              <View style={styles.descriptionColumn}>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>
                    {card.defectSketchDescription || 'No defect sketch description available'}
                  </Text>
                </View>
                <Text style={styles.imageDescription}>Description</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={selectedImageForPreview !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImageForPreview(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedImageForPreview?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedImageForPreview(null)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {selectedImageForPreview && (
              <Image
                source={{ uri: selectedImageForPreview.uri }}
                style={styles.previewImage}
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
    justifyContent: 'center',
  },
  
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  
  companySubtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
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
    width: 100,
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
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  
  // Images Section - 4 Columns
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
    gap: 16,
  },
  
  imageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  imageColumn: {
    alignItems: 'center',
    // No flex property - let images take only needed space
  },
  
  descriptionColumn: {
    flex: 1,
    alignItems: 'center',
  },
  
  imageContainer: {
    width: 100, // Fixed width for images
    height: 80,
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
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  descriptionContainer: {
    width: '100%', // Take full width of the flex container
    height: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12, // Add margin between image and description
  },
  
  descriptionText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  imageDescription: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  
  selectButtonText: {
    color: '#ffffff',
    fontSize: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  
  // Back Button Container
  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },

  // New styles for header actions
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  headerActionButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  // New styles for navigation row
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  actionButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  actualImage: {
    width: '100%',
    height: '100%',
  },

  noImageText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },

  imageTouchable: {
    flex: 1,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  closeButton: {
    padding: 8,
  },

  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default WeldPrintView;
