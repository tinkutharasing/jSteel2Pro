import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('App Form Input Tests', () => {
  test('should render form fields correctly', () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    
    // Check if form fields are rendered
    expect(getByText('Date')).toBeTruthy();
    expect(getByText('Type Fit')).toBeTruthy();
    expect(getByText('WPS *')).toBeTruthy();
    expect(getByText('Grade/Class')).toBeTruthy();
  });

  test('should handle text input changes', async () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<App />);
    
    // Find the WPS input field
    const wpsInput = getByPlaceholderText('Enter WPS');
    expect(wpsInput).toBeTruthy();
    
    // Type in the field
    fireEvent.changeText(wpsInput, 'WPS-001');
    
    // Check if the value is updated
    await waitFor(() => {
      expect(getByDisplayValue('WPS-001')).toBeTruthy();
    });
  });

  test('should handle form submission', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    
    // Fill out required fields
    const wpsInput = getByPlaceholderText('Enter WPS');
    fireEvent.changeText(wpsInput, 'WPS-001');
    
    const dateInput = getByPlaceholderText('YYYY-MM-DD');
    fireEvent.changeText(dateInput, '2024-01-15');
    
    // Submit form
    const submitButton = getByText('Save Weld');
    fireEvent.press(submitButton);
    
    // Check if form is submitted successfully
    await waitFor(() => {
      expect(getByText('Weld saved successfully!')).toBeTruthy();
    });
  });

  test('should validate required fields', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    
    // Try to submit without filling required fields
    const submitButton = getByText('Save Weld');
    fireEvent.press(submitButton);
    
    // Check if validation error is shown
    await waitFor(() => {
      expect(getByText('WPS is required')).toBeTruthy();
    });
  });
});
