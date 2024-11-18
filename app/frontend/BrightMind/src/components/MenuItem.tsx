// src/components/MenuItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@fluentui/react-native-icons';

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Icon name={icon} size={24} color="#000" />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
});

export default MenuItem;
