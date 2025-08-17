import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const InputFieldTest = () => {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    console.log('onChangeText called with:', text);
    setValue(text);
  };

  const handleFocus = () => {
    console.log('Input focused');
  };

  const handleBlur = () => {
    console.log('Input blurred');
  };

  const clearInput = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TextInput Focus Test</Text>
      
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Type here..."
        placeholderTextColor="#666"
        blurOnSubmit={false}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        multiline={false}
      />
      
      <Text style={styles.value}>Current value: "{value}"</Text>
      
      <TouchableOpacity style={styles.button} onPress={clearInput}>
        <Text style={styles.buttonText}>Clear & Focus</Text>
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        Try typing multiple characters. The keyboard should stay open.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default InputFieldTest;
