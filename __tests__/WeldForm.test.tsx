import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput, TouchableOpacity, Text } from 'react-native';

// Mock the form components to test input behavior
const MockWeldForm = () => {
  const [formData, setFormData] = React.useState({
    date: '',
    typeFit: '',
    wps: '',
    gradeClass: '',
    weldNumber: '',
    welder: '',
    firstHT: '',
    firstMfg: '',
    firstLength: '',
    jtNumber: '',
    secondHT: '',
    secondMfg: '',
    secondLength: '',
    preHeat: '',
    vt: '',
    process: '',
    ndeNumber: '',
    amps: '',
    volts: '',
    ipm: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <TextInput
        testID="date-input"
        value={formData.date}
        onChangeText={(value) => updateField('date', value)}
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        testID="wps-input"
        value={formData.wps}
        onChangeText={(value) => updateField('wps', value)}
        placeholder="Enter WPS"
      />
      <TextInput
        testID="typeFit-input"
        value={formData.typeFit}
        onChangeText={(value) => updateField('typeFit', value)}
        placeholder="Enter Type Fit"
      />
      <TextInput
        testID="gradeClass-input"
        value={formData.gradeClass}
        onChangeText={(value) => updateField('gradeClass', value)}
        placeholder="Enter Grade/Class"
      />
      <TouchableOpacity testID="save-button" onPress={() => {}}>
        <Text>Save Weld</Text>
      </TouchableOpacity>
    </>
  );
};

describe('Weld Form Input Tests', () => {
  test('should update date field correctly', async () => {
    const { getByTestId } = render(<MockWeldForm />);
    
    const dateInput = getByTestId('date-input');
    fireEvent.changeText(dateInput, '2024-01-15');
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-01-15');
    });
  });

  test('should update WPS field correctly', async () => {
    const { getByTestId } = render(<MockWeldForm />);
    
    const wpsInput = getByTestId('wps-input');
    fireEvent.changeText(wpsInput, 'WPS-001');
    
    await waitFor(() => {
      expect(wpsInput.props.value).toBe('WPS-001');
    });
  });

  test('should update multiple fields correctly', async () => {
    const { getByTestId } = render(<MockWeldForm />);
    
    const dateInput = getByTestId('date-input');
    const wpsInput = getByTestId('wps-input');
    const typeFitInput = getByTestId('typeFit-input');
    
    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(wpsInput, 'WPS-001');
    fireEvent.changeText(typeFitInput, 'Butt Joint');
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-01-15');
      expect(wpsInput.props.value).toBe('WPS-001');
      expect(typeFitInput.props.value).toBe('Butt Joint');
    });
  });

  test('should handle rapid text input changes', async () => {
    const { getByTestId } = render(<MockWeldForm />);
    
    const wpsInput = getByTestId('wps-input');
    
    // Simulate rapid typing
    fireEvent.changeText(wpsInput, 'W');
    fireEvent.changeText(wpsInput, 'WP');
    fireEvent.changeText(wpsInput, 'WPS');
    fireEvent.changeText(wpsInput, 'WPS-');
    fireEvent.changeText(wpsInput, 'WPS-0');
    fireEvent.changeText(wpsInput, 'WPS-00');
    fireEvent.changeText(wpsInput, 'WPS-001');
    
    await waitFor(() => {
      expect(wpsInput.props.value).toBe('WPS-001');
    });
  });
});
