// components/TopicCard.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Library24Regular, QuizNew24Regular, ArrowDownload24Regular } from '@fluentui/react-native-icons';
import { Topic } from '../types/content';
import { LinearProgress } from './progress/LinearProgress';

interface TopicCardProps {
  topic: Topic;
  onPress: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onPress }) => {
  const { title, subject, lessonCount, quizCount, progress, imageUrl, isDownloaded } = topic;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.cover} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="bodyMedium" style={styles.subject}>{subject}</Text>
            <Text variant="titleLarge" style={styles.title}>{title}</Text>
          </View>
          {isDownloaded && (
            <TouchableOpacity style={styles.iconButton}>
              <ArrowDownload24Regular />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Library24Regular />
            <Text variant="bodyMedium" style={styles.statText}>
              {lessonCount} Lessons
            </Text>
          </View>
          <View style={styles.stat}>
            <QuizNew24Regular />
            <Text variant="bodyMedium" style={styles.statText}>
              {quizCount} Quizzes
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text variant="bodyMedium" style={styles.progressText}>
            Progress • {progress}%
          </Text>
          <LinearProgress progress={progress / 100} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cover: {
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subject: {
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    color: '#1A1A1A',
  },
  iconButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: '#666666',
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    color: '#666666',
  },
});

export default TopicCard;