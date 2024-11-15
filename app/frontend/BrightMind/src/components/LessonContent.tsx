// src/components/LessonContent.tsx

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { ChevronLeftRegular, ChevronRightRegular, CloudArrowDownRegular } from '@fluentui/react-native-icons';
import { Lesson } from '../types/content';
import { useDownloadManager } from '../hooks/useDownloadManager';

interface LessonContentProps {
  lesson: Lesson;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  isFirstLesson,
  isLastLesson,
  onNext,
  onPrevious,
}) => {
  const {
    downloadStatus,
    progress: downloadProgress,
    startDownload,
    error
  } = useDownloadManager(lesson.id);

  const handleDownload = async () => {
    try {
      if (!lesson.contentUrl) {
        throw new Error('Content URL not available');
      }
      await startDownload(lesson.contentUrl);
    } catch (err) {
      console.error('Failed to start download:', err);
    }
  };

  const renderContent = () => {
    if (downloadStatus === 'downloading') {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#186AA4" />
          <Text style={styles.downloadText}>
            Downloading lesson content... {Math.round(downloadProgress)}%
          </Text>
        </View>
      );
    }

    if (downloadStatus === 'error' || error) {
      return (
        <View style={styles.centerContent}>
          <CloudArrowDownRegular size={48} color="#EC221F" />
          <Text style={styles.errorText}>
            {error || 'Failed to load lesson content'}
          </Text>
          <Button 
            mode="contained" 
            onPress={handleDownload}
            style={styles.retryButton}
          >
            Retry Download
          </Button>
        </View>
      );
    }

    return (
      <>
        <Text variant="titleLarge" style={styles.title}>
          {lesson.title}
        </Text>

        <Text style={styles.content}>{lesson.content}</Text>

        {lesson.examples?.map((example, index) => (
          <View key={index} style={styles.exampleContainer}>
            <Text variant="titleMedium" style={styles.exampleTitle}>
              Examples
            </Text>
            <Text style={styles.example}>{example}</Text>
          </View>
        ))}

        {lesson.notes && (
          <View style={styles.noteContainer}>
            <Text variant="titleMedium" style={styles.noteTitle}>
              Note/Emphasis
            </Text>
            <Text style={styles.note}>{lesson.notes}</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          mode="outlined"
          onPress={onPrevious}
          disabled={isFirstLesson}
          icon={() => <ChevronLeftRegular />}
          style={[styles.navButton, styles.previousButton]}
          labelStyle={styles.buttonLabel}
        >
          Previous
        </Button>

        <Button
          mode="contained"
          onPress={onNext}
          disabled={isLastLesson}
          icon={() => <ChevronRightRegular />}
          style={[styles.navButton, styles.nextButton]}
          labelStyle={styles.buttonLabel}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#1A1A1A',
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    color: '#4D4D4D',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },
  exampleContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  exampleTitle: {
    color: '#186AA4',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  example: {
    color: '#4D4D4D',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  noteContainer: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteTitle: {
    color: '#F5A623',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  note: {
    color: '#4D4D4D',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FDFDFD',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  previousButton: {
    borderColor: '#186AA4',
  },
  nextButton: {
    backgroundColor: '#186AA4',
  },
  buttonLabel: {
    fontFamily: 'Inter_500Medium',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  downloadText: {
    color: '#186AA4',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  errorText: {
    color: '#EC221F',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#186AA4',
    marginTop: 8,
  },
});

export default LessonContent;