// src/components/streak/StreakIcon.tsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Lightning } from '@fluentui/react-native-icons';
import { StreakIconProps } from '../../types/streak';

export const StreakIcon: React.FC<StreakIconProps> = ({ isActive, size = 40 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Lightning
        size={size * 0.6}
        color={isActive ? '#FFD700' : '#D3D3D3'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'white',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});