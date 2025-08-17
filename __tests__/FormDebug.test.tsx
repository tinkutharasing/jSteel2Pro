import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput, Alert, Text } from 'react-native';

// Debug component to test various input scenarios
const DebugFormInputs = () => {
  const [values, setValues] = React.useState({
    field1: '',
    field2: '',
    field3: '',
  });

  const [errors, setErrors] = React.useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input change: ${field} = "${value}"`);
    
    // Simulate potential issues
    if (value.length === 1) {
      console.log(`First character entered: ${field}`);
    }
    
    if (value.length === 0) {
      console.log(`Field cleared: ${field}`);
    }
    
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const testInputBehavior = () => {
    const issues = [];
    
    if (values.field1.length === 0) issues.push('Field 1 is empty');
    if (values.field2.length === 0) issues.push('Field 2 is empty');
    if (values.field3.length === 0) issues.push('Field 3 is empty');
    
    setErrors(issues);
    
    if (issues.length > 0) {
      console.log('Form validation issues:', issues);
    }
  };

  return (
    <>
      <TextInput
        testID="debug-field1"
        value={values.field1}
        onChangeText={(value) => handleInputChange('field1', value)}
        placeholder="Test Field 1"
        onFocus={() => console.log('Field 1 focused')}
        onBlur={() => console.log('Field 1 blurred')}
        onEndEditing={() => console.log('Field 1 editing ended')}
      />
      
      <TextInput
        testID="debug-field2"
        value={values.field2}
        onChangeText={(value) => handleInputChange('field2', value)}
        placeholder="Test Field 2"
        onFocus={() => console.log('Field 2 focused')}
        onBlur={() => console.log('Field 2 blurred')}
        onEndEditing={() => console.log('Field 2 editing ended')}
      />
      
      <TextInput
        testID="debug-field3"
        value={values.field3}
        onChangeText={(value) => handleInputChange('field3', value)}
        placeholder="Test Field 3"
        onFocus={() => console.log('Field 3 focused')}
        onBlur={() => console.log('Field 3 blurred')}
        onEndEditing={() => console.log('Field 3 editing ended')}
      />
      
      {errors.map((error, index) => (
        <Text key={index} testID={`error-${index}`}>{error}</Text>
      ))}
    </>
  );
};

describe('Form Input Debug Tests', () => {
  test('should track input changes with logging', async () => {
    const { getByTestId } = render(<DebugFormInputs />);
    
    const field1 = getByTestId('debug-field1');
    const field2 = getByTestId('debug-field2');
    
    // Test sequential input
    fireEvent.changeText(field1, 'A');
    fireEvent.changeText(field1, 'AB');
    fireEvent.changeText(field1, 'ABC');
    
    fireEvent.changeText(field2, '1');
    fireEvent.changeText(field2, '12');
    fireEvent.changeText(field2, '123');
    
    await waitFor(() => {
      expect(field1.props.value).toBe('ABC');
      expect(field2.props.value).toBe('123');
    });
  });

  test('should handle focus and blur events', async () => {
    const { getByTestId } = render(<DebugFormInputs />);
    
    const field1 = getByTestId('debug-field1');
    
    fireEvent(field1, 'focus');
    fireEvent.changeText(field1, 'Test');
    fireEvent(field1, 'blur');
    
    await waitFor(() => {
      expect(field1.props.value).toBe('Test');
    });
  });

  test('should handle rapid input changes', async () => {
    const { getByTestId } = render(<DebugFormInputs />);
    
    const field1 = getByTestId('debug-field1');
    
    // Simulate very rapid typing
    const rapidInputs = ['A', 'B', 'C', 'D', 'E'];
    
    rapidInputs.forEach((char, index) => {
      setTimeout(() => {
        fireEvent.changeText(field1, char);
      }, index * 10);
    });
    
    // Wait for final value
    await waitFor(() => {
      expect(field1.props.value).toBe('E');
    }, { timeout: 1000 });
  });
});
