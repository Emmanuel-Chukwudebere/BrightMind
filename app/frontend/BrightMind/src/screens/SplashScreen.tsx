// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SPLASH_TIMEOUT = 3000;

export const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, SPLASH_TIMEOUT);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to BrightMind!</Text>
          <Text style={styles.description}>
            Unlock personalized AI lessons, learn offline,{'\n'}
            and track your progress - all in one place.{'\n'}
            Let's get Started!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B45',
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 48,
    paddingHorizontal: 16,
    width: '100%',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SplashScreen;