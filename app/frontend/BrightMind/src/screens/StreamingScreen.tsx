// src/screens/StreamingScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../components/navigation/BackButton';
import axios from 'axios';

const STREAMING_MESSAGES = [
  "Analyzing your learning preferences...",
  "Crafting personalized content just for you...",
  "Adding some brain-friendly examples...",
  "Making sure everything is easy to understand...",
  "Almost ready to begin your learning journey...",
  "Preparing an engaging learning experience...",
];

interface StreamingScreenProps {
  route: {
    params: {
      topicId: string;
      level: string;
      contentRequestId: string;
    };
  };
}

export const StreamingScreen: React.FC<StreamingScreenProps> = ({ route }) => {
  const { contentRequestId } = route.params;
  const navigation = useNavigation();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const checkContentStatus = async () => {
    try {
      const response = await axios.get(`dummyurl/api/v1/content/status/${contentRequestId}`);
      if (response.data.status === 'completed') {
        navigation.navigate('ContentScreen', {
          contentId: response.data.contentId,
        });
      }
    } catch (error) {
      console.error('Error checking content status:', error);
    }
  };

  useEffect(() => {
    // Poll for content status every 3 seconds
    const statusInterval = setInterval(checkContentStatus, 3000);

    // Cycle through messages every 4 seconds
    const messageInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentMessageIndex((prev) =>
        prev === STREAMING_MESSAGES.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Replace with actual logo component */}
        <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/brrighmind-logo-blue-icon.png')} style={styles.logo} />
          <View style={styles.logo} />
        </View>

        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.message}>
            {STREAMING_MESSAGES[currentMessageIndex]}
          </Text>
        </Animated.View>

        <ProgressBar
          indeterminate
          style={styles.progressBar}
        />
      </View>

      <BackButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  main: {
    flex: 1,
    gap: 24,
  },
  label: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#fdfdfd', // Replace with actual logo
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
  },
  progressBar: {
    width: '100%',
    height: 4,
  },
});

export default StreamingScreen;