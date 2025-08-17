import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  required = false 
}) => {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label} {required && '*'}
      </Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#495057"
        blurOnSubmit={false}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        multiline={false}
      />
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
  textInput: {
    fontSize: 16,
    color: '#0f172a',
    padding: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    borderRadius: 12,
    minHeight: 56,
  },
});
