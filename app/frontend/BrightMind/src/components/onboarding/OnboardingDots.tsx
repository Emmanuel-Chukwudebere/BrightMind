// src/components/onboarding/OnboardingDots.tsx
import { OnboardingDotsProps } from '@/src/types/onboarding';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export const OnboardingDots: React.FC<OnboardingDotsProps> = ({
  currentScreen,
  totalScreens,
  onDotPress,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalScreens }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onDotPress(index)}
          style={styles.dotContainer}
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor: currentScreen === index ? '#0078D4' : '#BFE6FF',
              },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dotContainer: {
    padding: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});