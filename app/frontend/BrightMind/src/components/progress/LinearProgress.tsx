// src/components/progress/LinearProgress.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ProgressBarProps } from '../../types/progress';

/**
 * LinearProgress Component
 * 
 * A customizable progress bar that displays progress percentage
 * and an animated fill bar.
 * 
 * @param progress - Progress percentage (0-100)
 * @param showLabel - Whether to show the progress label
 */
export const LinearProgress: React.FC<ProgressBarProps> = ({ 
  progress, 
  showLabel = true 
}) => {
  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Progress</Text>
          <Text style={styles.percentage}>{progress}%</Text>
        </View>
      )}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#186AA4',
  },
  percentage: {
    fontSize: 16,
    color: '#186AA4',
    marginLeft: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F3F3F3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#247EBF',
    borderRadius: 4,
  },
});