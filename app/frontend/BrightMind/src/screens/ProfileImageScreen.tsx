// src/screens/ProfileImageScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { AuthButton } from '../components/AuthButton';
import { ImageUpload } from '../components/ImageUpload';

export const ProfileImageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { uploadProfileImage, loading } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleImageUpload = async () => {
    try {
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const imageData = {
          uri: imageUri,
          type,
          name: filename,
        };

        await uploadProfileImage(imageData);
      }
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineLarge" style={styles.title}>Profile Image</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Time to set up your profile image! Upload any image you like
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <ImageUpload
          imageUri={imageUri}
          onImageSelect={setImageUri}
        />

        <AuthButton onPress={handleImageUpload} loading={loading}>
          Use Image
        </AuthButton>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.accountContainer}>
          <Text variant="bodyMedium">Already have an account? </Text>
          <AuthButton
            mode="text"
            onPress={() => navigation.replace('SignIn')}
          >
            Sign In
          </AuthButton>
        </View>

        <View style={styles.termsContainer}>
          <Text variant="bodySmall">
            By signing up, you agree to our{' '}
          </Text>
          <AuthButton
            mode="text"
            onPress={() => {/* Navigate to T&Cs */}}
          >
            T&Cs
          </AuthButton>
          <Text variant="bodySmall"> and </Text>
          <AuthButton
            mode="text"
            onPress={() => {/* Navigate to Privacy Policy */}}
          >
            Privacy Policy
          </AuthButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 24,
  },
  footerContainer: {
    marginBottom: 24,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});

export default ProfileImageScreen;