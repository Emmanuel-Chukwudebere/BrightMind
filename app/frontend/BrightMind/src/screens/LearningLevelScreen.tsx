// src/screens/LearningLevelScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LevelSelector } from '../components/LevelSelector';
import { BackButton } from '../components/navigation/BackButton';
import axios from 'axios';

interface LearningLevelScreenProps {
  route: {
    params: {
      topicId: string;
    };
  };
}

export const LearningLevelScreen: React.FC<LearningLevelScreenProps> = ({ route }) => {
  const { topicId } = route.params;
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleContinue = async () => {
    if (!selectedLevel) return;
    
    setIsLoading(true);
    try {
      // Start content generation
      const response = await axios.post('dummyurl/api/v1/content/generate', {
        topicId,
        level: selectedLevel,
      });
      
      // Navigate to streaming screen with necessary data
      navigation.navigate('StreamingScreen', {
        topicId,
        level: selectedLevel,
        contentRequestId: response.data.requestId, // Assuming the API returns a requestId
      });
    } catch (error) {
      console.error('Error generating content:', error);
      setIsLoading(false);
      // Handle error appropriately
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge">Learning Level</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Choose a learning level for BrightMind to streamline your learning content to.
        </Text>
      </View>

      <View style={styles.main}>
        <Text variant="titleLarge" style={styles.label}>Learning Level</Text>
        <LevelSelector
          value={selectedLevel}
          onValueChange={setSelectedLevel}
        />
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedLevel || isLoading}
          loading={isLoading}
          style={styles.button}
        >
          Continue
        </Button>
      </View>

      <BackButton />
    </View>
  );
};

export default LearningLevelScreen;