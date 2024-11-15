// src/components/headers/TopicHeader.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { 
  BookRegular, 
  QuizNewRegular, 
  CloudArrowDownRegular,
  CircleRegular,
  CheckmarkRegular,
  PauseRegular,
  PlayRegular 
} from '@fluentui/react-native-icons';
import { LinearProgress } from '../progress/LinearProgress';
import { Topic } from '../../types/topic';
import { useDownloadManager } from '../../hooks/useDownloadManager';

type TopicHeaderVariant = 'started' | 'notStarted';

interface TopicHeaderProps {
  topic: Topic;
  variant: TopicHeaderVariant;
  style?: ViewStyle;
  testID?: string;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({ 
  topic, 
  variant,
  style,
  testID 
}) => {
  const {
    downloadStatus,
    progress: downloadProgress,
  } = useDownloadManager(topic.id);

  const renderDownloadStatus = useMemo(() => {
    if (downloadStatus === 'downloading' && typeof downloadProgress === 'number') {
      return (
        <View 
          style={styles.downloadProgress}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: downloadProgress, min: 0, max: 100 }}
        >
          <Text 
            style={styles.downloadText}
            accessibilityLabel={`Downloading... ${Math.round(downloadProgress)}%`}
          >
            Downloading... {Math.round(downloadProgress)}%
          </Text>
          <LinearProgress progress={downloadProgress} showLabel={false} />
        </View>
      );
    }
    return null;
  }, [downloadStatus, downloadProgress]);

  const statsSection = useMemo(() => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <BookRegular size={20} color="#186AA4" />
        <Text style={styles.statText}>{topic.totalLessons} Lessons</Text>
      </View>
      
      <View style={styles.statItem}>
        <QuizNewRegular size={20} color="#186AA4" />
        <Text style={styles.statText}>{topic.totalQuizzes} Quizzes</Text>
      </View>
      
      {topic.progress && (
        <View style={styles.statItem}>
          <CircleRegular size={20} color="#186AA4" />
          <Text style={styles.statText}>{topic.progress.percentage}% Complete</Text>
        </View>
      )}
    </View>
  ), [topic.totalLessons, topic.totalQuizzes, topic.progress?.percentage]);

  return (
    <View 
      style={[styles.container, style]} 
      testID={testID}
      accessibilityRole="header"
    >
      <View style={styles.contentContainer}>
        <Text 
          style={styles.subject}
          accessibilityRole="text"
        >
          {topic.subject}
        </Text>
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          {topic.title}
        </Text>
        {statsSection}
        {renderDownloadStatus}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFDFD',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  contentContainer: {
    gap: 8,
  },
  subject: {
    fontSize: 14,
    color: '#186AA4',
    fontFamily: 'Inter_400Regular',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#186AA4',
    fontFamily: 'Inter_600SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#186AA4',
    fontFamily: 'Inter_400Regular',
  },
  downloadProgress: {
    marginTop: 16,
  },
  downloadText: {
    fontSize: 12,
    color: '#186AA4',
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
});