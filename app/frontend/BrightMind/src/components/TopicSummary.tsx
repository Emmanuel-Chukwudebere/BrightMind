// src/components/TopicSummary.tsx

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { TopicSummary as TopicSummaryType } from '../types/content';

interface TopicSummaryProps {
  data: TopicSummaryType;
  onStartTopic: () => void;
}

const TopicSummary: React.FC<TopicSummaryProps> = ({ data, onStartTopic }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Topic Summary
        </Text>
        
        <Text style={styles.description}>{data.description}</Text>

        <Text variant="titleMedium" style={styles.lessonsTitle}>
          Lessons
        </Text>

        {data.lessons.map((lesson, index) => (
          <List.Item
            key={lesson.id}
            title={lesson.title}
            left={(props) => (
              <Text {...props} style={styles.bulletPoint}>
                •
              </Text>
            )}
          />
        ))}

        <Button
          mode="contained"
          onPress={onStartTopic}
          style={styles.startButton}
        >
          Start Topic
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 24,
    lineHeight: 24,
  },
  lessonsTitle: {
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 24,
    marginRight: 8,
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#2196F3',
  },
});

export default TopicSummary;