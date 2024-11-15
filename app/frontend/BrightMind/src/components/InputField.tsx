// src/components/InputField.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

/**
 * InputField Component
 * 
 * A reusable text input component with label and error handling.
 * Follows BrightMind's design system with consistent colors and styling.
 */
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onFocus?: () => void;
  onBlur?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  autoCapitalize = 'none',
  onFocus,
  onBlur,
  multiline = false,
  numberOfLines = 1,
}) => (
  <View style={styles.container}>
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={!!error}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      style={[styles.input, multiline && styles.multilineInput]}
      onFocus={onFocus}
      onBlur={onBlur}
      multiline={multiline}
      numberOfLines={numberOfLines}
      theme={{
        roundness: 8,
        colors: {
          primary: '#247EBF',
          error: '#C00F0C',
          text: '#186AA4',
          placeholder: '#186AA4',
          background: '#FDFDFD',
        },
      }}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: '#FDFDFD',
    borderColor: '#F3F3F3',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#C00F0C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});
