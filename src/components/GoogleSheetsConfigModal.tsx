import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { GOOGLE_SHEETS_DEFAULTS } from '../config/googleSheetsDefaults';

interface GoogleSheetsConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: { spreadsheetId: string; credentials: any }) => void;
  currentConfig?: { spreadsheetId: string; credentials: any };
}

export const GoogleSheetsConfigModal: React.FC<GoogleSheetsConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  currentConfig
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState(currentConfig?.spreadsheetId || GOOGLE_SHEETS_DEFAULTS.spreadsheetId);
  const [webAppUrl, setWebAppUrl] = useState(currentConfig?.credentials?.webapp_url || GOOGLE_SHEETS_DEFAULTS.webappUrl);

  // Update fields when modal opens or currentConfig changes
  useEffect(() => {
    if (visible) {
      setSpreadsheetId(currentConfig?.spreadsheetId || GOOGLE_SHEETS_DEFAULTS.spreadsheetId);
      setWebAppUrl(currentConfig?.credentials?.webapp_url || GOOGLE_SHEETS_DEFAULTS.webappUrl);
    }
  }, [visible, currentConfig]);

  const handleSave = () => {
    if (!spreadsheetId.trim()) {
      Alert.alert('Error', 'Please enter a Spreadsheet ID');
      return;
    }

    if (!webAppUrl.trim()) {
      Alert.alert('Error', 'Please enter the Google Apps Script Web App URL');
      return;
    }

    const credentials = {
      webapp_url: webAppUrl,
    };

    onSave({ spreadsheetId, credentials });
    onClose();
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      Alert.alert('Error', 'Please enter the Google Apps Script Web App URL before testing connection');
      return;
    }

    try {
      Alert.alert('Testing Connection', 'Testing connection to Google Sheets...');
      
      // Create test credentials with just the Web App URL
      const testCredentials = {
        webapp_url: webAppUrl,
      };

      // Test the connection
      const { createGoogleSheetsService } = await import('../services/GoogleSheetsService');
      const sheetsService = createGoogleSheetsService(spreadsheetId, testCredentials);
      
      // Try to get sheet stats to test connection
      const stats = await sheetsService.getSheetStats();
      
      Alert.alert(
        'Connection Successful! ✅',
        `Connected to Google Sheets!\n\nSheet Stats:\nTotal Rows: ${stats.total}\nActive Items: ${stats.active}\nDeleted Items: ${stats.deleted}`
      );
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert(
        'Connection Failed ❌',
        `Failed to connect to Google Sheets:\n\n${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Google Sheets Configuration</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>
            Connect your jSteel Pro app to Google Sheets for automatic data synchronization.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Spreadsheet Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spreadsheet ID *</Text>
              <TextInput
                style={styles.input}
                value={spreadsheetId}
                onChangeText={setSpreadsheetId}
                placeholder="Enter your Google Sheet ID"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.helpText}>
                Found in your Google Sheet URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Google Apps Script Configuration</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Google Apps Script Web App URL *</Text>
              <TextInput
                style={styles.input}
                value={webAppUrl}
                onChangeText={setWebAppUrl}
                placeholder="https://script.google.com/macros/s/.../exec"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helpText}>
                This is the URL you got after deploying your Google Apps Script
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Setup Instructions</Text>
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>1. Create a Google Apps Script project</Text>
              <Text style={styles.instructionText}>2. Copy the script code from google-apps-script.js</Text>
              <Text style={styles.instructionText}>3. Deploy as Web App (Execute as: Me, Access: Anyone)</Text>
              <Text style={styles.instructionText}>4. Copy the Web App URL</Text>
              <Text style={styles.instructionText}>5. Paste the URL in the field above</Text>
              <Text style={styles.instructionText}>6. Save configuration and start syncing!</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
            <Text style={styles.testButtonText}>🧪 Test Connection</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  instructions: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  testButton: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
