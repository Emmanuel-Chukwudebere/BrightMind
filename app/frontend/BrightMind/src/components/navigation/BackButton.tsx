// src/components/navigation/BackButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@fluentui/react-native-icons';
import { useNavigation } from '@react-navigation/native';

export const BackButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.goBack()}
    >
      <FluentIcon
        name="arrow-left"
        size={24}
        color="#666666"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    bottom: 10,
  },
});