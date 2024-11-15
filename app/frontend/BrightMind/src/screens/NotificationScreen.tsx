// src/screens/NotificationScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../components/navigation/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import NotificationCard from '../components/NotificationCard';
import { api, sendNotification } from '../services/api';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      alert('Failed to load notifications.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      <ScrollView style={styles.content}>
        {notifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
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
});

export default NotificationScreen;
