import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FieldConfig } from '../types/FieldConfig';
import { DatePickerField } from './DatePickerField';

interface DynamicFieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  style?: any;
  placeholder?: string;
  required?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  style,
  placeholder,
  required,
}) => {
  const fieldPlaceholder = placeholder || field.placeholder;
  const isRequired = required !== undefined ? required : field.required;

  // Check if this is a date field
  if (field.key === 'date') {
    return (
      <View style={[styles.container, style]}>
        <DatePickerField
          label=""
          value={value || ''}
          onDateChange={onChange}
          placeholder={fieldPlaceholder}
          required={isRequired}
        />
      </View>
    );
  }

  // Default text input for other fields
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        value={value || ''}
        onChangeText={onChange}
        placeholder={fieldPlaceholder}
        placeholderTextColor="#9ca3af"
        multiline={false}
        numberOfLines={1}
      />
      {isRequired && (
        <Text style={styles.requiredIndicator}>*</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 40,
  },
  requiredIndicator: {
    position: 'absolute',
    top: 4,
    right: 8,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DynamicFieldRenderer;