// src/components/streak/StreakCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
import { StreakIcon } from './StreakIcon';
import { StreakConnector } from './StreakConnector';
import { StreakData } from '../../types/streak';
import { fetchStreakData } from '../../services/streakService';

export const StreakCard: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const data = await fetchStreakData();
      setStreakData(data);
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  if (!streakData) return null;

  return (
    <ImageBackground
      source={require('../../assets/streak-background.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.content}>
        <View style={styles.streakRow}>
          {streakData.streakDays.map((isActive, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <StreakConnector 
                  isActive={isActive && streakData.streakDays[index - 1]} 
                />
              )}
              <StreakIcon isActive={isActive} />
            </React.Fragment>
          ))}
        </View>
        
        <Text style={styles.daysText}>
          {streakData.totalDays} Days
          <Text style={styles.lightningEmoji}>⚡</Text>
        </Text>
        
        <Text style={styles.messageText}>
          {streakData.message}
        </Text>
        
        <Text style={styles.nameText}>
          {streakData.userName} 🎉
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
  },
  backgroundImage: {
    borderRadius: 16,
  },
  content: {
    padding: 20,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  daysText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    color: 'white',
  },
  lightningEmoji: {
    fontSize: 24,
  },
});

export default StreakCard;