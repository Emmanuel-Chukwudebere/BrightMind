// src/components/streak/StreakConnector.tsx
import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { StreakConnectorProps } from '../../types/streak';

export const StreakConnector: React.FC<StreakConnectorProps> = ({ 
  isActive, 
  animated = true 
}) => {
  const animatedValue = new Animated.Value(isActive ? 1 : 0);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: isActive ? 1 : 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D3D3D3', '#4CAF50'],
  });

  return (
    <Animated.View
      style={[
        styles.connector,
        { backgroundColor: animated ? backgroundColor : (isActive ? '#4CAF50' : '#D3D3D3') }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  connector: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
  },
});