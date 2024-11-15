// src/screens/OfflineContentScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchRecommendedTopics, downloadTopic, deleteTopic } from '../services/apiService';
import {BackButton} from '../components/navigation/BackButton';
import TopicCard from '../components/TopicCard';

const OfflineContentScreen = () => {
  const navigation = useNavigation();
  const [downloadedTopics, setDownloadedTopics] = useState([]);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOfflineContent();
  }, []);

  const loadOfflineContent = async () => {
    // Fetch downloaded topics from the local storage/download manager
    // Fetch recommended topics from the backend
    const recommendations = await fetchRecommendedTopics({ screen: 'downloaded' });
    setRecommendedTopics(recommendations);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOfflineContent();
    setRefreshing(false);
  };

  const handleDownloadOrDelete = (topicId: any, isDownloaded: boolean) => {
    if (isDownloaded) {
      deleteTopic(topicId);
    } else {
      downloadTopic(topicId);
    }
    loadOfflineContent(); // Refresh the content after action
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Offline Content</Text>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Downloaded Topics</Text>
          {downloadedTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPress={() => navigation.navigate('TopicSummaryScreen', { topicId: topic.id })}
              onDownloadOrDelete={() => handleDownloadOrDelete(topic.id, true)}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommended Topics</Text>
          {recommendedTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPress={() => navigation.navigate('TopicSummaryScreen', { topicId: topic.id })}
              onDownloadOrDelete={() => handleDownloadOrDelete(topic.id, false)}
            />
          ))}
        </View>
      </ScrollView>
      <BackButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default OfflineContentScreen;
