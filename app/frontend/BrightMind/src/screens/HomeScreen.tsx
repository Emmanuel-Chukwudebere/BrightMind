// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme, IconButton, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Custom Hooks and Utils
import { useNetwork } from '../hooks/useNetwork';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { performanceMonitor } from '../utils/performance';

// Components
import StreakCard from '../components/streak/StreakCard';
import TopicCard from '../components/TopicCard';
import TabBar from '../components/navigation/TabBar';
import { AIAssistantSystem } from '../components/AIAssistantSystem/AIAssistantSystem';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';

// Types and Services
import { Topic, DownloadOptions } from '../types';
import DownloadManager from '../services/DownloadManager';
import { API_ENDPOINTS } from '../config/api.config';

const HomeScreen: React.FC = () => {
  // Hooks
  const theme = useTheme();
  const navigation = useNavigation();
  const { isConnected, showOfflineMessage } = useNetwork();
  const { getItem, setItem } = useLocalStorage();

  // State
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([]);
  const [downloads, setDownloads] = useState<Map<string, DownloadTask>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized Values
  const sortedRecentTopics = useMemo(() => 
    [...recentTopics].sort((a, b) => 
      new Date(b.lastAccessedAt || 0).getTime() - new Date(a.lastAccessedAt || 0).getTime()
    ), [recentTopics]
  );

  // Data Fetching
  const fetchData = useCallback(async () => {
    const perfMetric = performanceMonitor.start('home_screen_fetch');
    try {
      setLoading(true);
      setError(null);

      // Retrieve cached data
      const cachedRecent = await getItem<Topic[]>('cachedRecentTopics');
      const cachedRecommended = await getItem<Topic[]>('cachedRecommendedTopics');

      if (isConnected) {
        const [recentResponse, recommendedResponse] = await Promise.all([
          fetch(API_ENDPOINTS.RECENT_LESSONS),
          fetch(API_ENDPOINTS.RECOMMENDATIONS)
        ]);

        if (!recentResponse.ok || !recommendedResponse.ok) {
          throw new Error('Failed to fetch data from server');
        }

        const recentData = await recentResponse.json();
        const recommendedData = await recommendedResponse.json();

        setRecentTopics(recentData);
        setRecommendedTopics(recommendedData);

        await Promise.all([
          setItem('cachedRecentTopics', recentData),
          setItem('cachedRecommendedTopics', recommendedData)
        ]);
      } else if (cachedRecent && cachedRecommended) {
        setRecentTopics(cachedRecent);
        setRecommendedTopics(cachedRecommended);
      } else {
        setError('No cached data available offline');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      Alert.alert('Error', 'Failed to fetch topics. Please try again.');
    } finally {
      setLoading(false);
      performanceMonitor.end(perfMetric);
    }
  }, [isConnected, getItem, setItem]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Download Management
  const downloadTopic = useCallback(async (topicId: string) => {
    if (!isConnected) {
      Alert.alert('Offline', 'You need an internet connection to download topics');
      return;
    }

    const options: DownloadOptions = {
      priority: 1,
      onProgress: (progress) => {
        setDownloads(prev => {
          const newMap = new Map(prev);
          const task = newMap.get(topicId);
          if (task) {
            newMap.set(topicId, { ...task, progress });
          }
          return newMap;
        });
      },
      onComplete: () => {
        updateTopicDownloadStatus(topicId, true);
        setDownloads(prev => {
          const newMap = new Map(prev);
          newMap.delete(topicId);
          return newMap;
        });
      },
      onError: (error) => {
        Alert.alert('Download Error', error.message);
        setDownloads(prev => {
          const newMap = new Map(prev);
          newMap.delete(topicId);
          return newMap;
        });
      }
    };

    try {
      await DownloadManager.queueDownload(topicId, options);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start download');
    }
  }, [isConnected]);

  const updateTopicDownloadStatus = useCallback((topicId: string, isDownloaded: boolean) => {
    const updateTopics = (topics: Topic[]) =>
      topics.map(topic => topic.id === topicId ? { ...topic, isDownloaded } : topic);

    setRecentTopics(updateTopics);
    setRecommendedTopics(updateTopics);
  }, []);

  // UI Components
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image source={require('../../assets/images/brain-logo.png')} style={styles.logo} />
      <Text style={styles.noTopicsText}>No recent topics to show</Text>
      <Text style={styles.startLearningText}>Start learning to see your recent topics here</Text>
    </View>
  );

  const TopicSection = ({ title, topics }: { title: string; topics: Topic[] }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.topicsGrid}>
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            {...topic}
            onDownload={() => downloadTopic(topic.id)}
            downloadProgress={downloads.get(topic.id)?.progress}
          />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>{`${getGreeting()}, ${user?.name || 'Learner'}`}</Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={fetchData}
            disabled={loading || refreshing}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchData();
                setRefreshing(false);
              }}
              colors={[theme.colors.primary]}
            />
          }
        >
          <StreakCard />
          
          {sortedRecentTopics.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TopicSection title="Recent Topics" topics={sortedRecentTopics} />
              <TopicSection title="Recommended Topics" topics={recommendedTopics} />
            </>
          )}
        </ScrollView>

        {showOfflineMessage && (
          <View style={styles.offlineMessageContainer}>
            <Text style={styles.offlineMessageText}>
              You're offline. Some features may be limited.
            </Text>
          </View>
        )}

        <AIAssistantSystem mode="FAB" />
        <TabBar />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { paddingTop: 44 },
      android: { paddingTop: 16 },
    }),
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  noTopicsText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  startLearningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  topicsGrid: {
    gap: 16,
  },
  offlineMessageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    padding: 12,
    marginBottom: 60,
  },
  offlineMessageText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});

export default HomeScreen;