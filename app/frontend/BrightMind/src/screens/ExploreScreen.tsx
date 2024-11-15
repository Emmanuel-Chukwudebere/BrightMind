// src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Searchbar, Text, Snackbar } from 'react-native-paper';
import { Search24Regular } from '@fluentui/react-native-icons';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash/debounce';

// Types
import { Topic } from '../types';

// Components
import { TopicCard } from '../components/topic/TopicCard';
import { TabBar } from '../components/navigation/TabBar';

// Services & Utils
import { api } from '../services/api';
import { performanceMonitor } from '../utils/performance';
import { useNetwork } from '../hooks/useNetwork';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TOPICS } from '../constants/topics';

interface SubjectSection {
  title: string;
  topics: Topic[];
}

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isConnected, showOfflineMessage } = useNetwork();
  const storage = useLocalStorage();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filteredSections, setFilteredSections] = useState<SubjectSection[]>(() => 
    Object.entries(TOPICS).map(([title, topics]) => ({
      title,
      topics
    }))
  );

  // Memoized search handler with debounce
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length > 2 && isConnected) {
          setIsSearching(true);
          setSearchError(null);

          await performanceMonitor.measureAsync('topic_search', async () => {
            try {
              const response = await api.get(`/api/v1/search/search?screen=explore&query=${query}`);
              const searchResults = response.data;

              const filteredTopics = Object.entries(TOPICS).reduce<Record<string, Topic[]>>(
                (acc, [subject, topics]) => {
                  const filtered = topics.filter(topic =>
                    searchResults.some((result: { id: string }) => result.id === topic.id)
                  );

                  if (filtered.length > 0) {
                    acc[subject] = filtered;
                  }
                  return acc;
                },
                {}
              );

              setFilteredSections(
                Object.entries(filteredTopics).map(([title, topics]) => ({ title, topics }))
              );
            } catch (error) {
              console.error('Search error:', error);
              setSearchError('Failed to search topics. Please try again.');
            } finally {
              setIsSearching(false);
            }
          });
        } else if (query.length === 0) {
          resetTopics();
        }
      }, 300),
    [isConnected]
  );

  // Reset topics to original state
  const resetTopics = useCallback(() => {
    setFilteredSections(
      Object.entries(TOPICS).map(([title, topics]) => ({
        title,
        topics
      }))
    );
    setSearchError(null);
  }, []);

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    await performanceMonitor.measureAsync('explore_refresh', async () => {
      setRefreshing(true);
      resetTopics();
      setRefreshing(false);
    });
  }, [resetTopics]);

  // Handle topic selection
  const handleTopicPress = useCallback(
    async (topic: Topic) => {
      if (!isConnected && !topic.isDownloaded) {
        return;
      }

      // Save to recent topics
      const recentTopics = await storage.getItem<string[]>('recentTopics') || [];
      if (!recentTopics.includes(topic.id)) {
        recentTopics.unshift(topic.id);
        await storage.setItem('recentTopics', recentTopics.slice(0, 10));
      }

      navigation.navigate('LearningLevelScreen', { topicId: topic.id });
    },
    [isConnected, navigation, storage]
  );

  // Render section
  const renderSection = useCallback(
    ({ title, topics }: SubjectSection) => (
      <View style={styles.sectionContainer} key={title}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPress={() => handleTopicPress(topic)}
              style={styles.topicCard}
            />
          ))}
        </ScrollView>
      </View>
    ),
    [handleTopicPress]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      <View style={styles.header}>
        <Searchbar
          placeholder="Search topics..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => <Search24Regular />}
        />
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : searchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredSections.map(renderSection)}
        </ScrollView>
      )}

      <Snackbar
        visible={showOfflineMessage}
        onDismiss={() => {}}
        duration={3000}
        style={styles.snackbar}
      >
        You're offline. Some features may be limited.
      </Snackbar>

      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingBottom: 8,
    backgroundColor: '#FDFDFD',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  topicCard: {
    marginRight: 16,
    width: 280,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
  },
  snackbar: {
    position: 'absolute',
    bottom: 60,
  },
});

export default ExploreScreen;