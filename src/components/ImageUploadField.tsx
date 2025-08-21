import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onImageChange: (imageUri: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ 
  label, 
  value, 
  onImageChange, 
  placeholder = "Tap to add image",
  required = false 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Show permission denied dialog with settings option
  const showPermissionDeniedDialog = (permissionType: 'camera' | 'storage') => {
    const title = permissionType === 'camera' ? 'Camera Permission Required' : 'Storage Permission Required';
    const message = permissionType === 'camera' 
      ? 'Camera access is required to take photos. Please enable it in your device settings.'
      : 'Storage access is required to select photos. Please enable it in your device settings.';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings }
      ]
    );
  };

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPermission) {
          return true;
        }

        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos of weld inspections.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Deny",
            buttonPositive: "Allow"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          // User denied, show explanation and ask again
          const retryGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission Required",
              message: "Camera access is essential for taking weld inspection photos. Please allow camera access.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Deny",
              buttonPositive: "Allow"
            }
          );
          return retryGranted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // User selected "Don't ask again" or denied multiple times
          showPermissionDeniedDialog('camera');
          return false;
        }
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    // iOS handles permissions automatically
    return true;
  };

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (hasPermission) {
          return true;
        }

        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "This app needs access to your storage to select photos for weld inspections.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Deny",
            buttonPositive: "Allow"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          // User denied, show explanation and ask again
          const retryGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Storage Permission Required",
              message: "Storage access is essential for selecting weld inspection photos. Please allow storage access.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Deny",
              buttonPositive: "Allow"
            }
          );
          return retryGranted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // User selected "Don't ask again" or denied multiple times
          showPermissionDeniedDialog('storage');
          return false;
        }
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    // iOS handles permissions automatically
    return true;
  };

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      setIsLoading(true);
      
      if (source === 'camera') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          return;
        }

        const result: ImagePickerResponse = await launchCamera({
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          includeBase64: false,
          saveToPhotos: true,
        });

        if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          if (asset.uri) {
            onImageChange(asset.uri);
            setShowOptions(false);
          }
        } else if (result.didCancel) {
          console.log('User cancelled camera');
        } else if (result.errorCode) {
          Alert.alert('Camera Error', `Failed to access camera: ${result.errorMessage}`);
        }
      } else if (source === 'gallery') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          return;
        }

        const result: ImagePickerResponse = await launchImageLibrary({
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          includeBase64: false,
        });

        if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          if (asset.uri) {
            onImageChange(asset.uri);
            setShowOptions(false);
          }
        } else if (result.didCancel) {
          console.log('User cancelled gallery picker');
        } else if (result.errorCode) {
          Alert.alert('Gallery Error', `Failed to access gallery: ${result.errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to access image picker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onImageChange('')
        }
      ]
    );
  };

  const openImageOptions = () => {
    setShowOptions(true);
  };

  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label} {required && '*'}
      </Text>
      
      {value ? (
        // Image Preview
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: value }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <TouchableOpacity 
              style={styles.overlayButton} 
              onPress={openImageOptions}
            >
              <Icon name="camera" size={20} color="#ffffff" />
              <Text style={styles.overlayButtonText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.overlayButton, styles.removeButton]} 
              onPress={handleRemoveImage}
            >
              <Icon name="trash" size={20} color="#ffffff" />
              <Text style={styles.overlayButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Upload Button
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={openImageOptions}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Icon name="camera-outline" size={32} color={isLoading ? "#94a3b8" : "#64748b"} />
          <Text style={[styles.uploadButtonText, isLoading && styles.uploadButtonTextDisabled]}>
            {isLoading ? 'Processing...' : placeholder}
          </Text>
          <Text style={[styles.uploadSubtext, isLoading && styles.uploadButtonTextDisabled]}>
            {isLoading ? 'Please wait...' : 'Tap to add from camera or gallery'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Image Source Selection Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isLoading && styles.optionButtonDisabled]}
                onPress={() => handleImagePicker('camera')}
                disabled={isLoading}
              >
                <View style={styles.optionIcon}>
                  <Icon name="camera" size={32} color={isLoading ? "#94a3b8" : "#3b82f6"} />
                </View>
                <Text style={[styles.optionTitle, isLoading && styles.optionTextDisabled]}>Take Photo</Text>
                <Text style={[styles.optionSubtitle, isLoading && styles.optionTextDisabled]}>Use camera to capture new photo</Text>
                {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, isLoading && styles.optionButtonDisabled]}
                onPress={() => handleImagePicker('gallery')}
                disabled={isLoading}
              >
                <View style={styles.optionIcon}>
                  <Icon name="images" size={32} color={isLoading ? "#94a3b8" : "#3b82f6"} />
                </View>
                <Text style={[styles.optionTitle, isLoading && styles.optionTextDisabled]}>Choose from Gallery</Text>
                <Text style={[styles.optionSubtitle, isLoading && styles.optionTextDisabled]}>Select existing photo from device</Text>
                {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 6,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    minHeight: 120,
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 120,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    justifyContent: 'space-around',
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    gap: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  overlayButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionTextDisabled: {
    color: '#94a3b8',
  },
  loadingText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadButtonTextDisabled: {
    color: '#94a3b8',
  },
});
