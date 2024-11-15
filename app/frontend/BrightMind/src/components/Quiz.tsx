// src/components/Quiz.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, RadioButton, Checkbox, TextInput, Button } from 'react-native-paper';
import { Quiz as QuizType } from '../types/content';

interface QuizProps {
  quiz: QuizType;
  onSubmit: (answer: string | string[]) => void;
  onReset: () => void;
}

/**
 * Quiz Component
 * 
 * Interactive quiz component supporting multiple question types:
 * - Single choice (radio buttons)
 * - Multiple choice (checkboxes)
 * - Text input
 */
export const Quiz: React.FC<QuizProps> = ({
  quiz,
  onSubmit,
  onReset,
}) => {
  const [answer, setAnswer] = useState<string | string[]>(
    quiz.type === 'multiple-choice' ? [] : ''
  );
  const [textInput, setTextInput] = useState('');

  const handleSubmit = useCallback(() => {
    if (quiz.type === 'text-input') {
      onSubmit(textInput.trim());
    } else {
      onSubmit(answer);
    }
  }, [quiz.type, textInput, answer, onSubmit]);

  const handleReset = useCallback(() => {
    setAnswer(quiz.type === 'multiple-choice' ? [] : '');
    setTextInput('');
    onReset();
  }, [quiz.type, onReset]);

  const handleMultiChoiceChange = useCallback((option: string) => {
    setAnswer((prev) => {
      if (Array.isArray(prev)) {
        return prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option];
      }
      return [option];
    });
  }, []);

  const renderQuestionInput = useCallback(() => {
    if (!quiz.options) {
      return null;
    }

    switch (quiz.type) {
      case 'single-choice':
        return quiz.options.map((option, index) => (
          <View key={`${option}-${index}`} style={styles.choiceRow}>
            <RadioButton
              value={option}
              status={answer === option ? 'checked' : 'unchecked'}
              onPress={() => setAnswer(option)}
              color="#247EBF"
            />
            <Text
              variant="bodyLarge"
              style={[
                styles.choiceText,
                answer === option && styles.selectedChoiceText,
              ]}
              onPress={() => setAnswer(option)}
            >
              {option}
            </Text>
          </View>
        ));

      case 'multiple-choice':
        return quiz.options.map((option, index) => {
          const selected = Array.isArray(answer) && answer.includes(option);
          return (
            <View key={`${option}-${index}`} style={styles.choiceRow}>
              <Checkbox
                status={selected ? 'checked' : 'unchecked'}
                onPress={() => handleMultiChoiceChange(option)}
                color="#247EBF"
              />
              <Text
                variant="bodyLarge"
                style={[
                  styles.choiceText,
                  selected && styles.selectedChoiceText,
                ]}
                onPress={() => handleMultiChoiceChange(option)}
              >
                {option}
              </Text>
            </View>
          );
        });

      case 'text-input':
        return (
          <TextInput
            mode="outlined"
            value={textInput}
            onChangeText={setTextInput}
            style={styles.textInput}
            placeholder="Type your answer here..."
            multiline
            theme={{
              roundness: 16,
              colors: {
                primary: '#247EBF',
                text: '#186AA4',
                placeholder: '#186AA4',
              },
            }}
          />
        );

      default:
        return null;
    }
  }, [quiz.type, quiz.options, answer, textInput, handleMultiChoiceChange]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text variant="bodyMedium" style={styles.instructions}>
          Answer the following question. You can reset or try again at any time.
        </Text>

        <View style={styles.questionContainer}>
          <Text variant="titleMedium" style={styles.question}>
            {quiz.question}
          </Text>
          {renderQuestionInput()}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="text"
          onPress={handleReset}
          style={styles.resetButton}
          labelStyle={styles.resetButtonLabel}
        >
          Reset
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!answer && !textInput}
          style={styles.submitButton}
          labelStyle={styles.buttonLabel}
          theme={{
            roundness: 100,
            colors: {
              primary: '#247EBF',
            },
          }}
        >
          Submit
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
    padding: 16,
  },
  instructions: {
    marginBottom: 24,
    color: '#186AA4',
    fontFamily: 'Inter_400Regular',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  question: {
    color: '#186AA4',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  choiceText: {
    flex: 1,
    color: '#186AA4',
    fontFamily: 'Inter_400Regular',
  },
  selectedChoiceText: {
    color: '#247EBF',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
    backgroundColor: '#FFFFFF',
  },
  resetButton: {
    borderRadius: 100,
  },
  resetButtonLabel: {
    color: '#186AA4',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  submitButton: {
    borderRadius: 100,
    minWidth: 120,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});