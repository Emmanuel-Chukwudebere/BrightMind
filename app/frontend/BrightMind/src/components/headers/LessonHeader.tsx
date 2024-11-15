// src/components/headers/LessonHeader.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface LessonHeaderProps {
  title: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    color: '#1A1A1A',
  },
});

export default LessonHeader;