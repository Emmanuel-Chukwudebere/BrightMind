// src/screens/EditProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile, uploadProfilePicture } from '../services/apiService';
import ProfilePicture from '../components/ProfilePicture';
import InputField from '../components/2InputField';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const { userId } = useAuth();
  const navigation = useNavigation();
  const [profile, setProfile] = useState({ name: '', email: '', profilePicture: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const userData = await fetchProfile(userId);
        setProfile(userData);
      }
    };
    fetchData();
  }, [userId]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(userId, { name: profile.name, email: profile.email });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handlePictureUpload = async (newPictureUri: string) => {
    const formData = new FormData();
    formData.append('picture', {
      uri: newPictureUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      await uploadProfilePicture(formData);
      setProfile(prev => ({ ...prev, profilePicture: newPictureUri }));
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Edit Profile</Text>
      <View style={styles.profileContainer}>
        <ProfilePicture uri={profile.profilePicture} onUpload={handlePictureUpload} />
      </View>
      <View style={styles.inputContainer}>
        <InputField
          label="Name"
          value={profile.name}
          placeholder={profile.name} // Using current name as placeholder
          onChangeText={(name: any) => setProfile(prev => ({ ...prev, name }))}
        />
        <InputField
          label="Email"
          value={profile.email}
          placeholder={profile.email} // Using current email as placeholder
          onChangeText={(email: any) => setProfile(prev => ({ ...prev, email }))}
        />
        <Text
          style={styles.changePasswordText}
          onPress={() => navigation.navigate('ForgotPasswordEmail')}
        >
          Change Password
        </Text>
        <PrimaryButton title="Update Profile" onPress={handleUpdateProfile} />
      </View>
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
  inputContainer: {
    marginTop: 16,
  },
  changePasswordText: {
    color: '#1E90FF', // Adjust color to match your design
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'left',
  },
});

export default EditProfileScreen;
