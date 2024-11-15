// src/components/navigation/TabBar.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Home24Regular,
  Home24Filled,
  Search24Regular,
  Search24Filled,
  Book24Regular,
  Book24Filled,
  Person24Regular,
  Person24Filled,
} from '@fluentui/react-native-icons';
import { RootStackParamList } from '../../types/navigation';

/**
 * Custom TabBar Component
 * 
 * Provides navigation between main app screens with custom styling
 * and animated icons.
 */
export const TabBar: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const tabs = [
    {
      name: 'Home',
      icon: Home24Regular,
      activeIcon: Home24Filled,
      label: 'Home',
    },
    {
      name: 'Explore',
      icon: Search24Regular,
      activeIcon: Search24Filled,
      label: 'Explore',
    },
    {
      name: 'Learn',
      icon: Book24Regular,
      activeIcon: Book24Filled,
      label: 'Learn',
    },
    {
      name: 'Profile',
      icon: Person24Regular,
      activeIcon: Person24Filled,
      label: 'Profile',
    },
  ] as const;

  const isActive = (tabName: string) => route.name === tabName;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = isActive(tab.name);
        const Icon = active ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Icon color={active ? '#247EBF' : '#666666'} />
            <Text
              variant="labelSmall"
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FDFDFD',
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
    height: 64,
    paddingBottom: 8,
    elevation: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    color: '#666666',
    fontSize: 12,
  },
  activeLabel: {
    color: '#247EBF',
    fontWeight: '600',
  },
});