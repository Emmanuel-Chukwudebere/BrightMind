// src/components/quiz/QuizResultModal.tsx
import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CircularProgress } from '../progress/CircularProgress';

/**
 * QuizResultModal Component
 * 
 * Displays quiz results with score visualization and feedback.
 * Features circular progress indicator and contextual messages.
 */
interface QuizResultModalProps {
  visible: boolean;
  score: number;
  onDismiss: () => void;
  onRetake?: () => void;
  onContinue: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  visible,
  score,
  onDismiss,
  onRetake,
  onContinue,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#247EBF';
    if (score >= 60) return '#F5A623';
    return '#EC221F';
  };

  const getFeedbackMessage = (score: number) => {
    if (score >= 80) {
      return "Excellent work! You've mastered this topic.";
    } else if (score >= 60) {
      return "Good job! Consider reviewing the areas you missed.";
    } else {
      return "Keep practicing! Try reviewing the material before retaking.";
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <CircularProgress 
              progress={score} 
              size={120}
              color={getScoreColor(score)}
            />
            <Text variant="titleLarge" style={styles.title}>
              Quiz Complete!
            </Text>
            <Text variant="bodyLarge" style={styles.score}>
              {score}%
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {getFeedbackMessage(score)}
            </Text>
            <View style={styles.buttonContainer}>
              {score < 80 && onRetake && (
                <Button
                  mode="contained"
                  onPress={onRetake}
                  style={styles.retryButton}
                  labelStyle={styles.buttonLabel}
                  theme={{
                    roundness: 100,
                    colors: {
                      primary: '#247EBF',
                    },
                  }}
                >
                  Try Again
                </Button>
              )}
              <Button
                mode={score >= 80 ? 'contained' : 'outlined'}
                onPress={onContinue}
                style={score >= 80 ? styles.continueButton : styles.nextButton}
                labelStyle={[styles.buttonLabel, score < 80 && styles.nextButtonLabel]}
                theme={{
                  roundness: 100,
                  colors: {
                    primary: score >= 80 ? '#247EBF' : '#247EBF',
                  },
                }}
              >
                {score >= 80 ? 'Continue' : 'Next Topic'}
              </Button>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: '#186AA4',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  score: {
    color: '#186AA4',
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    color: '#186AA4',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    borderRadius: 100,
  },
  continueButton: {
    borderRadius: 100,
  },
  nextButton: {
    borderRadius: 100,
    borderColor: '#247EBF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonLabel: {
    color: '#247EBF',
  },
});