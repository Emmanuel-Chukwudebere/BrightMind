// src/components/NotificationCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationCard = ({ notification }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{notification.title}</Text>
    <Text style={styles.message}>{notification.message}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
});

export default NotificationCard;
