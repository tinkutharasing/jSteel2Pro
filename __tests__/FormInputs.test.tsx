import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Simple test to verify TextInput functionality
describe('Form Input Tests', () => {
  test('TextInput should handle text changes', () => {
    const mockOnChangeText = jest.fn();
    
    const { getByTestId } = render(
      <TextInput
        testID="test-input"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />
    );
    
    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'Test Value');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('Test Value');
  });

  test('TextInput should maintain value', () => {
    const { getByTestId } = render(
      <TextInput
        testID="test-input"
        value="Initial Value"
        onChangeText={() => {}}
      />
    );
    
    const input = getByTestId('test-input');
    expect(input.props.value).toBe('Initial Value');
  });
});
