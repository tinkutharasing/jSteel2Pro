import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

interface SignatureFieldProps {
  label: string;
  value: string;
  onSignatureCaptured: (signature: string) => void;
  onClear: () => void;
}

export const SignatureField: React.FC<SignatureFieldProps> = ({ 
  label, 
  value,
  onSignatureCaptured, 
  onClear 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle] = useState('Success');
  const [successMessage] = useState('Signature saved successfully!');
  const signatureRef = useRef<any>(null);

  const handleSignature = (signature: string) => {
    onSignatureCaptured(signature);
    setShowModal(false);
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 2500);
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
    onClear();
  };

  const openDrawingModal = () => {
    setShowModal(true);
  };

  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      
      {/* Signature Display */}
      <View style={styles.signatureDisplay}>
        {value ? (
          <View style={styles.signatureImageContainer}>
            <Text style={styles.signatureText}>✓ Signature Saved</Text>
          </View>
        ) : (
          <View style={styles.noSignatureContainer}>
            <Text style={styles.noSignatureText}>No signature yet</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.signatureActions}>
        <TouchableOpacity style={styles.drawButton} onPress={openDrawingModal}>
          <Text style={styles.drawButtonText}>✏️ Draw Signature</Text>
        </TouchableOpacity>
        
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Drawing Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Draw Your Signature</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={signatureRef}
              style={styles.signatureCanvas}
              onOK={handleSignature}
              onEmpty={() => console.log('Signature is empty')}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText="Save Signature"
              webStyle={`
                .m-signature-pad--footer { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 10px; 
                  background-color: #f8fafc;
                }
                .m-signature-pad--body { 
                  border: 2px solid #e2e8f0; 
                  border-radius: 12px; 
                  background-color: #ffffff; 
                  margin: 10px;
                }
                body { background-color: #f8fafc; }
              `}
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.clearModalButton}
              onPress={handleClear}
            >
              <Text style={styles.clearModalButtonText}>Clear Canvas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {successVisible && (
        <View style={styles.toastBackdrop} pointerEvents="none">
          <View style={styles.toastCard}>
            <View style={styles.toastTopBorder} />
            <Text style={styles.toastTitle}>{successTitle}</Text>
            <Text style={styles.toastMessage}>{successMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  signatureDisplay: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 12,
  },
  signatureImageContainer: {
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  noSignatureContainer: {
    alignItems: 'center',
  },
  noSignatureText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
  },
  signatureActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  drawButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  drawButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  signatureContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  signatureCanvas: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexWrap: 'wrap',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearModalButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  clearModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // lightweight success toast (neutral with green top border)
  toastBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  toastCard: {
    width: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  toastTopBorder: {
    height: 4,
    width: '100%',
    backgroundColor: '#10b981',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -14,
    marginBottom: 8,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
});
