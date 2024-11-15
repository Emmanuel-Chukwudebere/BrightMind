// src/components/AuthButton.tsx
import React from 'react';
import { Button } from 'react-native-paper';

interface AuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  mode?: 'text' | 'outlined' | 'contained';
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  onPress,
  loading,
  mode = 'contained',
  children,
}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    style={{
      borderRadius: 28,
      marginVertical: 8,
    }}
    contentStyle={{
      paddingVertical: 8,
    }}
  >
    {children}
  </Button>
);