// src/components/progress/CircularProgress.tsx
import { CircularProgressProps } from '@/src/types/progress';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  progress, 
  size = 200, 
  strokeWidth = 12 
}) => {
  const getColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#F44336';
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#E5E5E5"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={getColor(progress)}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressValue}
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.textContainer, { width: size, height: size }]}>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
});