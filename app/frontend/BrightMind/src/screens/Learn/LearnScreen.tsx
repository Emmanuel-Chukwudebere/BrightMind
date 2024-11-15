// src/screens/Learn/LearnScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { Search20Regular } from '@fluentui/react-native-icons';
import { TabBar } from '../../components/navigation/TabBar';
import { TopicCard } from '../../components/cards/TopicCard';
import { useNetwork } from '../../context/NetworkContext';
import { performanceMonitor } from '../../utils/performance';
import api from '../../services/api';

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.logoContainer}>
      <Image source={require('../../assets/images/brain-logo.png')} style={styles.logo} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
    </View>
  </View>
);

const LearnScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inProgress' | 'completed'>('inProgress');
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<TopicsByCategory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected } = useNetwork();

  const fetchTopics = useCallback(async () => {
    if (!isConnected) return;
    
    await performanceMonitor.measureAsync('fetch_topics', async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setIsLoading(false);
      }
    });
  }, [isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTopics();
    setRefreshing(false);
  }, [fetchTopics]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!isConnected) {
      return (
        <EmptyState
          title="No Internet Connection"
          description="Please check your internet connection and try again."
        />
      );
    }

    if (Object.keys(topics).length === 0) {
      return (
        <EmptyState
          title="No Topics Available"
          description="Start your learning journey by exploring new topics."
        />
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search topics..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            icon={() => <Search20Regular />}
            style={styles.searchBar}
          />
        </View>
        <View style={styles.content}>
          {Object.entries(topics).map(([category, topicList]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {topicList.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TabBar
        tabs={[
          { key: 'inProgress', title: 'In Progress' },
          { key: 'completed', title: 'Completed' },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'inProgress' | 'completed')}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default LearnScreen;