// src/components/ImageUpload.tsx
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera24Regular } from '@fluentui/react-native-icons';
import * as ImagePicker from 'expo-image-picker';

/**
 * ImageUpload Component
 * 
 * Allows users to select and upload profile images.
 * Displays a default avatar when no image is selected.
 */
interface ImageUploadProps {
  imageUri: string | null;
  onImageSelect: (imageUri: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ imageUri, onImageSelect }) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      onImageSelect(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../assets/default-avatar.png')}
          style={styles.image}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Camera24Regular color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#247EBF',
    borderRadius: 100,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});