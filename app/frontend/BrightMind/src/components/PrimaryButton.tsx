// src/components/PrimaryButton.tsx
import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  testID
}) => {
  const buttonStyles = useMemo(() => [
    styles.button, 
    variant === 'secondary' && styles.secondaryButton,
    variant === 'danger' && styles.dangerButton,
    disabled && styles.disabledButton,
    style
  ], [variant, disabled, style]);

  const textStyles = useMemo(() => [
    styles.buttonText,
    variant === 'secondary' && styles.secondaryButtonText,
    variant === 'danger' && styles.dangerButtonText,
    disabled && styles.disabledButtonText,
    textStyle
  ], [variant, disabled, textStyle]);

  return (
    <TouchableOpacity 
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
    >
      <Text style={textStyles}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#247EBF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginVertical: 12,
    elevation: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#247EBF',
  },
  dangerButton: {
    backgroundColor: '#EC221F',
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
    borderColor: '#E5E5E5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButtonText: {
    color: '#247EBF',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#A0A0A0',
  },
});
