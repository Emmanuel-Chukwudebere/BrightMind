// src/screens/NotificationSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../components/navigation/BackButton';
import PrimaryButton from '../components/PrimaryButton';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleToggleSwitch = () => setNotificationsEnabled(!notificationsEnabled);

  const handleSubscribe = async () => {
    try {
      await fetch('dummyurl/api/v1/notifications/subscribe', { method: 'POST' });
      alert('Subscribed to notifications successfully.');
    } catch (error) {
      alert('Failed to subscribe to notifications.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications & Reminders</Text>
      <View style={styles.settingContainer}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleSwitch}
          color="#1E90FF" // Adjust to match design
        />
      </View>
      <PrimaryButton title="Subscribe" onPress={handleSubscribe} />
      <BackButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
    textAlign: 'center',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationSettingsScreen;
