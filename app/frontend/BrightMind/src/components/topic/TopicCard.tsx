// src/components/topic/TopicCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { 
  BookRegular,
  QuizNewRegular,
  CloudArrowDownRegular,
  CircleRegular,
  CheckmarkRegular,
  PauseRegular,
  PlayRegular,
  DeleteRegular 
} from '@fluentui/react-native-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearProgress } from '../progress/LinearProgress';
import { Topic, TopicCardVariant } from '../../types/topic';
import { useDownloadManager } from '../../hooks/useDownloadManager';
import { deleteDownloadedTopic, downloadTopic, getLessonById } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

interface TopicCardProps {
  topic: Topic;
  variant: TopicCardVariant;
  onStartTopic?: () => void;
  onLessonPress: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  variant,
  onStartTopic,
  onLessonPress,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const {
    downloadStatus,
    progress,
    startDownload,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    error
  } = useDownloadManager(topic.id);

  const handleDownload = async () => {
    try {
      if (!topic?.downloadUrl) {
        throw new Error('Download URL not available');
      }
      await downloadTopic(topic.id);
      await startDownload(topic.downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      Alert.alert(
        'Download Failed',
        'Failed to start download. Please try again later.'
      );
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Topic',
      'Are you sure you want to delete this downloaded topic? You can download it again later.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDownloadedTopic(topic.id);
              await cancelDownload();
            } catch (err) {
              console.error('Failed to delete topic:', err);
              Alert.alert(
                'Delete Failed',
                'Failed to delete topic. Please try again later.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDownloadAction = () => {
    const status = topic.downloadStatus || downloadStatus;
    switch (status) {
      case 'queued':
      case 'error':
        handleDownload();
        break;
      case 'downloading':
        pauseDownload();
        break;
      case 'paused':
        resumeDownload();
        break;
      case 'completed':
        handleDelete();
        break;
      default:
        handleDownload();
    }
  };

  const handleLessonPress = async () => {
    try {
      const lessonData = await getLessonById(topic.id);
      if (!lessonData) {
        throw new Error('Lesson data not available');
      }
      onLessonPress();
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
      Alert.alert(
        'Error',
        'Failed to load lesson. Please try again later.'
      );
    }
  };

  const handleStartTopic = () => {
    if (!topic?.id) {
      console.error('Topic ID is missing');
      return;
    }
    navigation.navigate('LearningLevelScreen', { topicId: topic.id });
    onStartTopic?.();
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderDownloadIcon = () => {
    const status = topic.downloadStatus || downloadStatus;
    switch (status) {
      case 'downloading':
        return <PauseRegular size={24} color="#186AA4" />;
      case 'paused':
        return <PlayRegular size={24} color="#186AA4" />;
      case 'completed':
        return <DeleteRegular size={24} color="#C00F0C" />;
      case 'error':
        return <CloudArrowDownRegular size={24} color="#C00F0C" />;
      default:
        return <CloudArrowDownRegular size={24} color="#186AA4" />;
    }
  };

  const renderStartedVariant = () => (
    <>
      <View style={styles.infoContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <BookRegular size={20} color="#186AA4" />
            <Text style={styles.statText}>{topic.totalLessons} Lessons</Text>
          </View>
          
          <View style={styles.statItem}>
            <QuizNewRegular size={20} color="#186AA4" />
            <Text style={styles.statText}>{topic.totalQuizzes} Quizzes</Text>
          </View>
        </View>

        <Pressable 
          onPress={handleDownloadAction} 
          style={styles.iconButton}
          disabled={downloadStatus === 'queued'}
        >
          {renderDownloadIcon()}
        </Pressable>
      </View>

      {(topic.downloadStatus || downloadStatus) === 'downloading' && progress !== undefined && (
        <View style={styles.progressContainer}>
          <Text style={styles.downloadText}>
            Downloading... {Math.round(progress)}%
          </Text>
          <LinearProgress progress={progress} showLabel={false} />
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <View style={styles.progressContainer}>
        <LinearProgress progress={topic.progress?.percentage || 0} showLabel={false} />
      </View>
    </>
  );

  const renderNotStartedVariant = () => (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <BookRegular size={20} color="#186AA4" />
          <Text style={styles.statText}>{topic.totalLessons} Lessons</Text>
        </View>
        
        <View style={styles.statItem}>
          <QuizNewRegular size={20} color="#186AA4" />
          <Text style={styles.statText}>{topic.totalQuizzes} Quizzes</Text>
        </View>
      </View>

      <Pressable 
        style={styles.startButton}
        onPress={handleStartTopic}
      >
        <Text style={styles.startButtonText}>Start Topic</Text>
      </Pressable>
    </>
  );

  return (
    <Pressable 
      style={[
        styles.container,
        variant === 'started' && styles.startedContainer
      ]}
      onPress={variant === 'started' ? handleLessonPress : undefined}
    >
      <Image 
        source={{ uri: topic.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.subject}>{topic.subject}</Text>
          <Text style={styles.title}>{topic.title}</Text>
        </View>

        {variant === 'started' ? renderStartedVariant() : renderNotStartedVariant()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 16,
  },
  startedContainer: {
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    height: 160,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  headerContainer: {
    gap: 4,
  },
  subject: {
    color: '#186AA4',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  title: {
    color: '#186AA4',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#186AA4',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  iconButton: {
    padding: 8,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    gap: 4,
  },
  downloadText: {
    color: '#186AA4',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  errorText: {
    color: '#C00F0C',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#247EBF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default TopicCard;