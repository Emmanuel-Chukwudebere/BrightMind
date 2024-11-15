// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import ProfilePicture from '../components/ProfilePicture';
import MenuItem from '../components/MenuItem';
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userId, userName, profilePicture, logout } = useAuth();
  const [user, setUser] = useState({ name: userName, profilePicture });

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const userData = await fetchProfile(userId);
        setUser(userData);
      }
    };
    fetchData();
  }, [userId]);

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent('Hello, I need assistance with...');
    const mailtoUrl = `mailto:immanuelonyinyechi@gmail.com?subject=${subject}&body=${body}`;
    Linking.openURL(mailtoUrl).catch(() =>
      Alert.alert('Error', 'Unable to open email client')
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Profile</Text>
      <View style={styles.profileContainer}>
        <ProfilePicture uri={user.profilePicture} />
        <Text style={styles.name}>{user.name}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.menuContainer}>
        <MenuItem
          icon="edit"
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfileScreen')}
        />
        <MenuItem
          icon="notifications"
          label="Notification Settings"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <MenuItem
          icon="cloud-download"
          label="Offline Content"
          onPress={() => navigation.navigate('OfflineContent')}
        />
        <MenuItem
          icon="contact"
          label="Contact Support"
          onPress={handleContactSupport}
        />
        <MenuItem
          icon="sign-out"
          label="Log Out"
          onPress={() => setLogoutVisible(true)}
        />
      </ScrollView>
      {logoutVisible && (
        <LogoutModal
          visible={logoutVisible}
          onClose={() => setLogoutVisible(false)}
          onConfirm={logout}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    marginTop: 8,
  },
  menuContainer: {
    marginTop: 16,
  },
});

export default ProfileScreen;
