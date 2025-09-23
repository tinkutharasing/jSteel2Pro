import React, { useState, useRef, useEffect } from 'react';
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
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';

import RNPrint from 'react-native-print';
import { WeldCardData } from '../types/WeldCard';
import { formatDateToUS } from '../utils/dateUtils';
import { FieldConfig } from '../types/FieldConfig';
import FieldConfigService from '../services/FieldConfigService';

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
  const [fieldConfigs, setFieldConfigs] = useState<{
    header: FieldConfig[];
    table: FieldConfig[];
    footer: FieldConfig[];
  }>({ header: [], table: [], footer: [] });
  const weldSketchRef = useRef<ViewShot>(null);
  const welderSignatureRef = useRef<ViewShot>(null);

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
      
      console.log('=== PRINT VIEW FIELD CONFIGS ===');
      console.log('Header fields:', headerFields.map(f => ({ key: f.key, label: f.label })));
      console.log('Table fields:', tableFields.map(f => ({ key: f.key, label: f.label })));
      console.log('Footer fields:', footerFields.map(f => ({ key: f.key, label: f.label })));
      console.log('Total table fields:', tableFields.length);
      console.log('Card welds count:', card.welds?.length);
      console.log('First weld data:', card.welds?.[0]);
      console.log('First weld keys:', card.welds?.[0] ? Object.keys(card.welds[0]) : 'No welds');
      
      // Check if custom fields are in the weld data
      if (card.welds && card.welds.length > 0) {
        const firstWeld = card.welds[0];
        const customFields = Object.keys(firstWeld).filter(key => 
          !['id', 'cardId', 'date', 'weldNumber', 'widNumber', 'pipeSizeInches', 'typeOfWeld', 'capSize', 'passes', 'wpsNumberAndTitle', 'electrodeTypeBrand', 'rt', 'htNumber', 'welderCompany', 'welderContractor', 'loaTccMod', 'weldingContractorName', 'woJoNumber', 'weldingInspectorName', 'weldingInspectionCompany', 'numberOfWeldsMadeToday', 'stencilNumber', 'processUsed', 'butt', 'fillet', 'weldSketch', 'weldSketchDescription', 'welderSignature', 'createdAt', 'updatedAt'].includes(key)
        );
        console.log('Custom fields in weld data:', customFields);
      }
      
      setFieldConfigs({
        header: headerFields,
        table: tableFields,
        footer: footerFields,
      });
    } catch (error) {
      console.error('Error loading field configs:', error);
    }
  };

  const renderFieldValue = (field: FieldConfig, data?: any) => {
    const source = data || card;
    const value = (source as any)[field.key];
    
    // Field value rendered
    
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  };

  // Debug logging
  console.log('WeldPrintView rendered with props:', { card, onBack });
  console.log('Card type:', typeof card);
  console.log('Card content:', JSON.stringify(card, null, 2));
  console.log('Weld Sketch:', card.weldSketch);
  console.log('Welder Signature:', card.welderSignature);
  console.log('Weld Sketch Description:', card.weldSketchDescription);

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
    let imageToCapture: 'weldSketch' | 'welderSignature' | null = null;
    let refToUse: ViewShot | null = null;
    
    if (card.weldSketch) {
      imageToCapture = 'weldSketch';
      refToUse = weldSketchRef.current;
    } else if (card.welderSignature) {
      imageToCapture = 'welderSignature';
      refToUse = welderSignatureRef.current;
    }
    
    if (!imageToCapture || !refToUse) {
      Alert.alert('No Image Available', 'No weld or welder signature drawing field images available to capture. Please add a sketch image first.');
      return;
    }

    setIsCapturing(true);
    try {
      console.log(`Capturing ${imageToCapture}...`);
      if (!refToUse) {
        throw new Error(`Reference for ${imageToCapture} is not available`);
      }
      const uri = await refToUse.capture?.();
      console.log(`${imageToCapture} captured:`, uri);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `weld_card_${imageToCapture}_${timestamp}.png`;
      
      // Share the captured image
      try {
        await Share.share({
          url: uri,
          title: `Weld Card ${imageToCapture.charAt(0).toUpperCase() + imageToCapture.slice(1)}`,
          message: `Weld card ${imageToCapture} screenshot: ${fileName}`,
        });
      } catch (shareError) {
        console.log('Share failed:', shareError);
        Alert.alert(
          'Screenshot Captured',
          `Screenshot captured successfully!\n\nTo save: Use your device's share menu to save to gallery or files.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to capture screenshot: ' + error.message);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = async () => {
    try {
      // For React Native, we need to handle both base64 and URI formats
      let weldSketchBase64 = '';
      let welderSignatureBase64 = '';
      
      // Check if weld sketch is already base64 or needs conversion
      if (card.weldSketch) {
        if (card.weldSketch.startsWith('data:image/')) {
          // Already base64
          weldSketchBase64 = card.weldSketch;
        } else if (card.weldSketch.startsWith('file://') || card.weldSketch.startsWith('content://')) {
          // Local file URI - for now, we'll skip it in print but log the issue
          console.warn('Weld sketch is a local file URI, cannot convert to base64 for print. Consider using base64 storage.');
          weldSketchBase64 = '';
        } else {
          // Remote URL - try to use as is
          weldSketchBase64 = card.weldSketch;
        }
      }
      
      // Check if welder signature is already base64 or needs conversion
      if (card.welderSignature) {
        if (card.welderSignature.startsWith('data:image/')) {
          // Already base64
          welderSignatureBase64 = card.welderSignature;
        } else if (card.welderSignature.startsWith('file://') || card.welderSignature.startsWith('content://')) {
          // Local file URI - for now, we'll skip it in print but log the issue
          console.warn('Welder signature is a local file URI, cannot convert to base64 for print. Consider using base64 storage.');
          welderSignatureBase64 = '';
        } else {
          // Remote URL - try to use as is
          welderSignatureBase64 = card.welderSignature;
        }
      }

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
            .images-row {
              display: flex;
              flex-direction: row;
              gap: 20px;
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .sketch-column {
              flex: 0 0 70%;
              min-width: 300px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .signature-column {
              flex: 0 0 30%;
              min-width: 150px;
            }
            .image-row {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .image-title {
              font-weight: bold;
              margin-bottom: 15px;
              color: #374151;
              font-size: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .image-container {
              margin: 15px 0;
              text-align: center;
            }
            .image-container img {
              max-width: 100%;
              min-width: 200px;
              min-height: 150px;
              height: auto;
              border: none;
              border-radius: 0;
              box-shadow: none;
              object-fit: contain;
            }
            
            .weld-image {
              max-width: 100%;
              min-width: 250px;
              min-height: 200px;
              height: auto;
              object-fit: contain;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .signature-image {
              max-width: 100%;
              min-width: 120px;
              min-height: 80px;
              height: auto;
              object-fit: contain;
            }
            
            /* Enhanced image styling for print layout */
            .image-container img {
              transition: all 0.3s ease;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Portrait images will be rotated to landscape for print */
            .image-container img.portrait-rotate {
              transform: rotate(90deg);
              transform-origin: center center;
              max-width: 70%;
              max-height: 500px;
              margin: 30px auto;
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
            
            /* Landscape images optimized for print */
            .image-container img.landscape-optimized {
              max-width: 90%;
              max-height: 600px;
              margin: 15px auto;
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
            
            /* Print-specific optimizations */
            @media print {
              .image-container {
                page-break-inside: avoid;
                break-inside: avoid;
                margin: 20px 0;
                overflow: hidden;
                padding: 20px;
              }
              
              .image-container img {
                page-break-inside: avoid;
                break-inside: avoid;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
              }
              
              /* Ensure rotated images don't break across pages */
              .image-container img.portrait-rotate {
                transform: rotate(90deg) !important;
                transform-origin: center center !important;
                max-width: 70% !important;
                max-height: 500px !important;
                margin: 30px auto !important;
              }
              
              .image-container img.landscape-optimized {
                max-width: 90% !important;
                max-height: 600px !important;
                margin: 15px auto !important;
              }
            }
            .no-image {
              text-align: center;
              padding: 40px 20px;
              background: #f8fafc;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              color: #9ca3af;
              font-style: italic;
              margin: 15px 0;
            }
            .description {
              margin-top: 15px;
              padding: 15px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 12px;
              color: #64748b;
              line-height: 1.5;
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
            <div class="company-name">Inspector Sham Pro</div>
            <div class="company-subtitle">Weld Inspection Management</div>
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
                <th>MFG</th>
                <th>Cap Size</th>
                <th>Passes</th>
                <th>WPS</th>
                <th>Electrode</th>
                <th>RT</th>
                <th>HT #</th>
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
                    <td>${weld.htNumber || 'N/A'}</td>
                  </tr>
                `).join('') : 
                `<tr>
                  <td colspan="10">No welds available</td>
                </tr>`
              }
            </tbody>
          </table>

          <div class="section-title">Images and Sketches</div>
          <div class="images-section">
            <div class="images-row">
              <div class="sketch-column">
                <div class="image-title">Weld Sketch</div>
                ${weldSketchBase64 ? `
                  <div class="image-container">
                    <img src="${weldSketchBase64}" alt="Weld Sketch" class="weld-image" />
                  </div>
                  <div class="description">
                    ${card.weldSketchDescription || 'No weld sketch description available'}
                  </div>
                ` : `
                  <div class="no-image">No Weld Sketch Image Available</div>
                  <div class="description">
                    ${card.weldSketchDescription || 'No weld sketch description available'}
                  </div>
                `}
              </div>
              
              <div class="signature-column">
                <div class="image-title">Welder Signature</div>
                ${welderSignatureBase64 ? `
                  <div class="image-container">
                    <img src="${welderSignatureBase64}" alt="Welder Signature" class="signature-image" />
                  </div>
                ` : `
                  <div class="no-image">No Signature Available</div>
                `}
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af;">
            Generated on ${new Date().toLocaleString()}
          </div>
          
          <script>
            // Auto-rotate images for optimal print layout - always landscape orientation
            document.addEventListener('DOMContentLoaded', function() {
              const images = document.querySelectorAll('.image-container img');
              images.forEach(function(img) {
                img.onload = function() {
                  const isLandscape = this.naturalWidth > this.naturalHeight;
                  
                  if (isLandscape) {
                    // Original image is landscape - keep as is, optimize for print
                    this.classList.add('landscape-optimized');
                    this.style.maxWidth = '90%';
                    this.style.maxHeight = '600px';
                    this.style.width = 'auto';
                    this.style.height = 'auto';
                    this.style.transform = 'none';
                    this.style.margin = '15px auto';
                    this.style.display = 'block';
                    this.style.pageBreakInside = 'avoid';
                  } else {
                    // Original image is portrait - rotate to landscape for print
                    this.classList.add('portrait-rotate');
                    this.style.maxWidth = '70%';
                    this.style.maxHeight = '500px';
                    this.style.width = 'auto';
                    this.style.height = 'auto';
                    this.style.transform = 'rotate(90deg)';
                    this.style.margin = '30px auto';
                    this.style.display = 'block';
                    this.style.pageBreakInside = 'avoid';
                    this.style.transformOrigin = 'center center';
                  }
                  
                  // Add print-specific styles
                  this.style.border = '2px solid #e5e7eb';
                  this.style.borderRadius = '8px';
                  this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                };
                
                // Handle images that might already be loaded
                if (img.complete) {
                  img.onload();
                }
              });
            });
            
            // Additional print optimization
            window.addEventListener('beforeprint', function() {
              const images = document.querySelectorAll('.image-container img');
              images.forEach(function(img) {
                // Ensure all images are properly sized for print
                img.style.pageBreakInside = 'avoid';
                img.style.breakInside = 'avoid';
              });
            });
          </script>
        </body>
        </html>
      `;

      // Print the HTML content
      await RNPrint.print({
        html: htmlContent,
        jobName: `WeldCard_${card.cardId}_${new Date().toISOString().split('T')[0]}`,
      });

      // Show success message and option to go back
      Alert.alert(
        'Print Successful',
        'Document has been sent to printer. Would you like to go back to the previous page?',
        [
          {
            text: 'Stay Here',
            style: 'cancel'
          },
          {
            text: 'Go Back',
            onPress: onBack
          }
        ]
      );

    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print the document. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateToUS(dateString);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Section - Two Columns */}
        <View style={styles.headerSection}>
          {/* Left Column - Inspector Sham Pro Info */}
          <View style={styles.leftColumn}>
            <Text style={styles.companyName}>Inspector Sham Pro</Text>
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
              style={[styles.headerActionButton, styles.screenshotButton]}
              onPress={handleScreenshot}
              disabled={isCapturing}
            >
              <Icon name="camera" size={20} color="#10b981" />
              <Text style={styles.actionButtonText}>
                {isCapturing ? 'Capturing...' : 'Screenshot'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerActionButton, styles.printButton]}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollView}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                {fieldConfigs.table.map((field, index) => (
                  <Text 
                    key={field.id} 
                    style={[
                      styles.headerCell, 
                      index < fieldConfigs.table.length - 1 && { borderRightWidth: 1, borderRightColor: '#e5e7eb' }
                    ]}
                  >
                    {field.label}
                  </Text>
                ))}
              </View>
            {card.welds && card.welds.length > 0 ? (
              card.welds.map((weld: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  {fieldConfigs.table.map((field, fieldIndex) => (
                    <Text 
                      key={field.id} 
                      style={[
                        styles.cell, 
                        fieldIndex < fieldConfigs.table.length - 1 && { borderRightWidth: 1, borderRightColor: '#e5e7eb' }
                      ]}
                    >
                      {renderFieldValue(field, weld)}
                    </Text>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>No welds</Text>
                {fieldConfigs.table.slice(1).map((field, fieldIndex) => (
                  <Text 
                    key={field.id} 
                    style={[
                      styles.cell, 
                      fieldIndex < fieldConfigs.table.length - 2 && { borderRightWidth: 1, borderRightColor: '#e5e7eb' }
                    ]}
                  >
                    -
                  </Text>
                ))}
              </View>
            )}
            </View>
          </ScrollView>
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

            {/* Welder Signature Row */}
            <View style={styles.imageRow}>
              {/* Welder Signature Image */}
              <View style={styles.imageColumn}>
                <View style={styles.imageContainer}>
                  {card.welderSignature ? (
                    <TouchableOpacity
                      onPress={() => setSelectedImageForPreview({
                        uri: card.welderSignature!,
                        title: 'Welder Signature'
                      })}
                      style={styles.imageTouchable}
                    >
                      <ViewShot
                        ref={welderSignatureRef}
                        style={styles.imageWrapper}
                      >
                        <Image 
                          source={{ uri: card.welderSignature }} 
                          style={styles.actualImage}
                          resizeMode="contain"
                          onError={(error) => console.log('Welder signature image error:', error)}
                        />
                      </ViewShot>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Icon name="image-outline" size={32} color="#9ca3af" />
                      <Text style={styles.noImageText}>No Signature Available</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.imageDescription}>Welder Signature</Text>
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
  
          // Left Column - Inspector Sham Pro Info
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
  
  tableScrollView: {
    maxHeight: 300,
  },
  
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '100%',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  headerCell: {
    width: 120,
    padding: 12,
    fontSize: 12,
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
    width: 120,
    padding: 12,
    fontSize: 12,
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
  
  headerActionButton: {
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

  navigationActionButton: {
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
