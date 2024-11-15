// src/screens/QuizScreen/index.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Quiz from '../components/Quiz';
import QuizResultModal from '../components/modals/QuizResultModal';
import BackButton from '../components/navigation/BackButton';
import axios from 'axios';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSnackbar } from '../hooks/useSnackbar';

interface QuizScreenProps {
  route: {
    params: {
      quizId: string;
      lessonId: string;
      topicId: string;
      nextLessonIndex: number;
      lessons: Lesson[];
    };
  };
}

const QuizScreen: React.FC<QuizScreenProps> = ({ route, navigation }) => {
  const { isConnected } = useNetworkStatus();
  const { showSnackbar } = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { quizId, lessonId, topicId, nextLessonIndex, lessons } = route.params;

  const handleSubmitQuiz = async (answers: any) => {
    if (!isConnected) {
      showSnackbar('You are offline. Quiz submissions require internet connection.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `dummyurl/api/v1/quiz/submit/${quizId}`,
        answers
      );
      setQuizScore(response.data.score);
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showSnackbar('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetQuiz = async () => {
    if (!isConnected) {
      showSnackbar('You are offline. Quiz reset requires internet connection.');
      return;
    }

    try {
      await axios.put(`dummyurl/api/v1/quiz/reset/${quizId}`);
      setShowModal(false);
    } catch (error) {
      console.error('Error resetting quiz:', error);
      showSnackbar('Failed to reset quiz. Please try again.');
    }
  };

  const handleContinue = useCallback(() => {
    if (nextLessonIndex < lessons.length) {
      // Navigate to next lesson
      navigation.navigate('LessonContent', {
        lessonId: lessons[nextLessonIndex].id,
        topicId,
        lessonIndex: nextLessonIndex,
        lessons
      });
    } else {
      // Topic completed
      showSnackbar('Congratulations! You\'ve completed all lessons.', [
        {
          label: 'Retake Topic',
          onPress: () => navigation.navigate('LearningLevel')
        },
        {
          label: 'Start New Topic',
          onPress: () => navigation.navigate('Explore')
        }
      ]);
    }
    setShowModal(false);
  }, [nextLessonIndex, lessons, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Quiz
          questions={route.params.questions}
          onSubmit={handleSubmitQuiz}
          isSubmitting={isSubmitting}
        />
        <QuizResultModal
          visible={showModal}
          score={quizScore}
          onClose={() => setShowModal(false)}
          onReset={handleResetQuiz}
          onContinue={handleContinue}
        />
        <BackButton 
          onPress={() => navigation.navigate('LessonContent', {
            lessonId,
            topicId,
            lessonIndex: nextLessonIndex - 1,
            lessons
          })}
          style={styles.backButton}
        />
        {showModal && <View style={styles.overlay} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    marginHorizontal: 16, // Consistent 16px horizontal margin
  },
  backButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuizScreen;