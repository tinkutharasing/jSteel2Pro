import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FieldConfig, FormFieldConfig } from '../types/FieldConfig';
import FieldConfigService from '../services/FieldConfigService';

interface FieldManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

const { width } = Dimensions.get('window');

export const FieldManagementModal: React.FC<FieldManagementModalProps> = ({
  visible,
  onClose,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<FormFieldConfig | null>(null);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'header' | 'table' | 'footer'>('table');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  useEffect(() => {
    if (visible) {
      loadConfig();
    } else {
      // Reset form when modal is closed
      setNewFieldLabel('');
      setNewFieldKey('');
      setNewFieldRequired(false);
      setEditingField(null);
      setShowAddField(false);
    }
  }, [visible]);

  const loadConfig = async () => {
    try {
      const fieldService = FieldConfigService.getInstance();
      await fieldService.initialize();
      const currentConfig = fieldService.getConfig();
      
      setConfig(currentConfig);
    } catch (error) {
      console.error('Error loading field config:', error);
      Alert.alert('Error', 'Failed to load field configuration');
    }
  };

  const handleToggleFieldVisibility = async (fieldId: string) => {
    try {
      const fieldService = FieldConfigService.getInstance();
      await fieldService.toggleFieldVisibility(fieldId);
      await loadConfig();
      onConfigChanged();
    } catch (error) {
      console.error('Error toggling field visibility:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update field visibility';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleAddField = async () => {
    if (!newFieldLabel.trim() || !newFieldKey.trim()) {
      Alert.alert('Error', 'Please enter both label and key');
      return;
    }

    try {
      const fieldService = FieldConfigService.getInstance();
      const newField = fieldService.generateNewField(newFieldLabel.trim(), newFieldKey.trim(), selectedCategory);
      newField.required = newFieldRequired; // Set the required state
      await fieldService.addField(newField);
      await loadConfig();
      onConfigChanged();
      setShowAddField(false);
      setNewFieldLabel('');
      setNewFieldKey('');
      setNewFieldRequired(false);
      Alert.alert('Success', 'Field added successfully');
    } catch (error) {
      console.error('Error adding field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add field';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleRemoveField = async (fieldId: string) => {
    // Check if this is a protected field
    if (fieldId === 'weldNumber') {
      Alert.alert(
        'Cannot Remove Field',
        'Weld # field cannot be removed as it is required for weld identification.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check if this is a protected footer field
    if (fieldId === 'weldSketch' || fieldId === 'welderSignature' || fieldId === 'weldSketchDescription') {
      Alert.alert(
        'Cannot Remove Field',
        'Essential footer fields (Weld Sketch, Welder Signature, Description) cannot be removed.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Remove Field',
      'Are you sure you want to remove this field? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const fieldService = FieldConfigService.getInstance();
              await fieldService.removeField(fieldId);
              await loadConfig();
              onConfigChanged();
              Alert.alert('Success', 'Field removed successfully');
            } catch (error) {
              console.error('Error removing field:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to remove field';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingField(field);
    setShowAddField(false);
  };

  const handleUpdateField = async () => {
    if (!editingField || !editingField.label.trim() || !editingField.key.trim()) {
      Alert.alert('Error', 'Please enter both label and key');
      return;
    }

    try {
      const fieldService = FieldConfigService.getInstance();
      await fieldService.updateField(editingField);
      await loadConfig();
      onConfigChanged();
      setEditingField(null);
      Alert.alert('Success', 'Field updated successfully');
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('Error', 'Failed to update field');
    }
  };

  const renderCategory = (categoryId: 'header' | 'table' | 'footer', categoryName: string) => {
    if (!config) return null;

    const category = config.categories.find(cat => cat.id === categoryId);
    if (!category) return null;

    const visibleFields = category.fields
      .filter(field => field.visible)
      .sort((a, b) => a.order - b.order);

    return (
      <View key={categoryId} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedCategory(categoryId);
              setShowAddField(true);
              setEditingField(null);
            }}
          >
            <Icon name="add" size={20} color="#3b82f6" />
            <Text style={styles.addButtonText}>Add Field</Text>
          </TouchableOpacity>
        </View>
        
        {visibleFields.length === 0 ? (
          <Text style={styles.emptyText}>No fields in this category</Text>
        ) : (
          visibleFields.map(field => {
            const isProtected = field.id === 'weldNumber' || 
                                field.id === 'weldSketch' || 
                                field.id === 'welderSignature' || 
                                field.id === 'weldSketchDescription';
            return (
              <View key={field.id} style={styles.fieldItem}>
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldLabelContainer}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {isProtected && (
                      <View style={styles.protectedBadge}>
                        <Text style={styles.protectedText}>Protected</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.fieldKey}>({field.key})</Text>
                </View>
                <View style={styles.fieldActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditField(field)}
                  >
                    <Icon name="pencil" size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, isProtected && styles.disabledButton]}
                    onPress={() => handleRemoveField(field.id)}
                    disabled={isProtected}
                  >
                    <Icon 
                      name="trash" 
                      size={16} 
                      color={isProtected ? "#9ca3af" : "#ef4444"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderAddFieldModal = () => (
    <Modal
      visible={showAddField}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.addFieldContainer}>
        <View style={styles.addFieldHeader}>
          <TouchableOpacity onPress={() => setShowAddField(false)}>
            <Icon name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.addFieldTitle}>Add New Field</Text>
          <TouchableOpacity onPress={handleAddField}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.addFieldContent}
          contentContainerStyle={styles.addFieldScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.categorySelector}>
            <Text style={styles.categorySelectorLabel}>Add to Category:</Text>
            <View style={styles.categoryButtons}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'header' && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory('header')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'header' && styles.categoryButtonTextActive
                ]}>
                  Header
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'table' && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory('table')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'table' && styles.categoryButtonTextActive
                ]}>
                  Table
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'footer' && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory('footer')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'footer' && styles.categoryButtonTextActive
                ]}>
                  Footer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Field Label *</Text>
            <TextInput
              style={styles.textInput}
              value={newFieldLabel}
              onChangeText={setNewFieldLabel}
              placeholder="Enter field label (e.g., Weld Number)"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Field Key *</Text>
            <TextInput
              style={styles.textInput}
              value={newFieldKey}
              onChangeText={setNewFieldKey}
              placeholder="Enter field key (e.g., weldNumber)"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>
              This will be used as the data property name. Use camelCase (e.g., weldNumber, pipeSize)
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditFieldModal = () => (
    <Modal
      visible={!!editingField}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.editFieldContainer}>
        <View style={styles.editFieldHeader}>
          <TouchableOpacity onPress={() => setEditingField(null)}>
            <Icon name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.editFieldTitle}>Edit Field</Text>
          <TouchableOpacity onPress={handleUpdateField}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.editFieldContent}
          contentContainerStyle={styles.editFieldScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Field Label *</Text>
            <TextInput
              style={styles.textInput}
              value={editingField?.label || ''}
              onChangeText={(text) => setEditingField(prev => prev ? { ...prev, label: text } : null)}
              placeholder="Enter field label"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Field Key *</Text>
            <TextInput
              style={styles.textInput}
              value={editingField?.key || ''}
              onChangeText={(text) => setEditingField(prev => prev ? { ...prev, key: text } : null)}
              placeholder="Enter field key"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Placeholder Text</Text>
            <TextInput
              style={styles.textInput}
              value={editingField?.placeholder || ''}
              onChangeText={(text) => setEditingField(prev => prev ? { ...prev, placeholder: text } : null)}
              placeholder="Enter placeholder text"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Required Field</Text>
            <Switch
              value={editingField?.required || false}
              onValueChange={(value) => setEditingField(prev => prev ? { ...prev, required: value } : null)}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={editingField?.required ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (!config) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Field Management</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {renderCategory('header', 'Header Fields')}
          {renderCategory('table', 'Table Fields')}
          {renderCategory('footer', 'Footer Fields')}
        </ScrollView>
      </View>
      
      {renderAddFieldModal()}
      {renderEditFieldModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
    minHeight: 600,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  fieldKey: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fieldActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addFieldContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  addFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addFieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  addFieldContent: {
    flex: 1,
  },
  addFieldScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  categorySelector: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  categorySelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827', // Ensure text is visible
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  editFieldContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  editFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editFieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editFieldContent: {
    flex: 1,
  },
  editFieldScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  protectedBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  protectedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default FieldManagementModal;