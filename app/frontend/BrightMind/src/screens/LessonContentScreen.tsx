// src/screens/LessonContentScreen/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import LessonHeader from '../components/headers/LessonHeader';
import LessonContent from '../components/LessonContent';
import AIAssistantSystem from '../components/AIAssistantSystem/AIAssistantSystem';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSnackbar } from '../hooks/useSnackbar';
import { Lesson } from '../types/learning';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LessonContentScreenProps {
  route: {
    params: {
      lessonId: string;
      topicId: string;
      lessonIndex: number;
      lessons: Lesson[];
    };
  };
}

const LessonContentScreen: React.FC<LessonContentScreenProps> = ({ route, navigation }) => {
  const { isConnected } = useNetworkStatus();
  const { showSnackbar } = useSnackbar();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { lessonId, topicId, lessonIndex, lessons } = route.params;

  useEffect(() => {
    const loadLesson = async () => {
      try {
        // Try to load from cache first
        const cachedLesson = await AsyncStorage.getItem(`lesson_${lessonId}`);
        if (cachedLesson) {
          setCurrentLesson(JSON.parse(cachedLesson));
          setIsLoading(false);
          return;
        }

        // If not in cache and offline, show message
        if (!isConnected) {
          showSnackbar('You are offline. Only downloaded lessons are available.');
          return;
        }

        // Load from backend
        const response = await fetch(`dummyurl/api/v1/lessons/${lessonId}`);
        const lessonData = await response.json();
        
        // Cache the lesson
        await AsyncStorage.setItem(`lesson_${lessonId}`, JSON.stringify(lessonData));
        setCurrentLesson(lessonData);
      } catch (error) {
        console.error('Error loading lesson:', error);
        showSnackbar('Error loading lesson content');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, isConnected]);

  const handleNextLesson = () => {
    // Navigate to quiz after lesson
    navigation.navigate('Quiz', {
      quizId: currentLesson?.quizId,
      lessonId: lessonId,
      topicId: topicId,
      nextLessonIndex: lessonIndex + 1,
      lessons: lessons
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LessonHeader 
          title={currentLesson?.title || ''}
        />
        <View style={styles.content}>
          <LessonContent
            content={currentLesson?.content || ''}
            examples={currentLesson?.examples || []}
            notes={currentLesson?.notes}
            onNavigateNext={handleNextLesson}
            isLoading={isLoading}
          />
        </View>
        <AIAssistantSystem 
          mode="lesson-controls"
          onBackPress={() => navigation.navigate('TopicSummary', { topicId })}
        />
      </View>
    </SafeAreaView>
  );
};

export default LessonContentScreen;