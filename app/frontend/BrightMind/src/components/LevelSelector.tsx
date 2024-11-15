// src/components/LevelSelector.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-paper-dropdown';
import { LearningLevel } from '../types/content';

interface LevelSelectorProps {
  onLevelSelect: (level: LearningLevel['value']) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ onLevelSelect }) => {
  // Available learning levels
  const levels: LearningLevel[] = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
  ];

  return (
    <View style={styles.container}>
      <Dropdown
        label="Learning Level"
        mode="outlined"
        style={styles.dropdown}
        outlineStyle={styles.dropdownOutline}
        onValueChange={(value) => onLevelSelect(value as LearningLevel['value'])}
        items={levels.map((level) => ({
          label: level.label,
          value: level.value,
        }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dropdown: {
    backgroundColor: '#FDFDFD',
    height: 56,
  },
  dropdownOutline: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E0E0E0',
  },
});

export default LevelSelector;