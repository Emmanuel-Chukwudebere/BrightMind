// src/screens/TopicSummaryScreen/index.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import TopicHeader from '../components/headers/TopicHeader';
import TopicSummary from '../components/TopicSummary';
import BackButton from '../components/navigation/BackButton';
import { useNavigation } from '@react-navigation/native';
import { TopicSummary } from '../types/learning';

interface TopicSummaryScreenProps {
  route: {
    params: {
      topicId: string;
      topicData: TopicSummary;
      fromStreaming?: boolean;
    };
  };
}

const TopicSummaryScreen: React.FC<TopicSummaryScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { topicData, fromStreaming } = route.params;

  // Handle automatic navigation from streaming
  React.useEffect(() => {
    if (fromStreaming) {
      // Auto-navigate to topic summary after content is loaded
      navigation.replace('TopicSummary', {
        topicId: topicData.id,
        topicData: topicData,
        fromStreaming: false
      });
    }
  }, [fromStreaming]);

  const handleStartTopic = () => {
    navigation.navigate('LessonContent', {
      lessonId: topicData.lessons[0].id,
      topicId: topicData.id,
      lessonIndex: 0
    });
  };

  const handleBackPress = () => {
    // Always navigate back to LearningLevelScreen as specified
    navigation.navigate('LearningLevelScreen', { topicId: topicData.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopicHeader 
          title={topicData.title}
          variant="notStarted"
        />
        <View style={styles.content}>
          <TopicSummary
            description={topicData.description}
            lessons={topicData.lessons}
            onStartTopic={handleStartTopic}
          />
        </View>
        <BackButton 
          onPress={handleBackPress}
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default TopicSummaryScreen;