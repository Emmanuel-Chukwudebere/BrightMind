// src/screens/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { RootStackParamList } from '../navigation/RootNavigator';
import { OnboardingDots } from '../components/onboarding/OnboardingDots';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    image: require('../assets/images/onboarding-1.png'),
    title: 'How to Interact with\nBrightMind',
    description: 'Interact with BrightMind with text inputs or using voice commands by speaking your questions out loud.',
    buttonText: 'Next',
  },
  {
    image: require('../assets/images/onboarding-2.png'),
    title: 'BrightMind is here to assist\nyou with your learning!',
    description: 'While online, BrightMind can answer your questions and help you understand difficult concepts.',
    buttonText: 'Get Started',
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handleButtonPress = () => {
    if (currentPage < onboardingData.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      navigation.navigate('SignUp');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={e => handlePageChange(e.nativeEvent.position)}
        >
          {onboardingData.map((page, index) => (
            <View key={index} style={styles.pageContainer}>
              <Image
                source={page.image}
                style={styles.image}
                resizeMode="contain"
              />
              
              <View style={styles.textContainer}>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.description}>{page.description}</Text>
              </View>

              <View style={styles.bottomContainer}>
                <OnboardingDots
                  total={onboardingData.length}
                  current={currentPage}
                  style={styles.dots}
                />
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleButtonPress}
                >
                  <Text style={styles.buttonText}>{page.buttonText}</Text>
                </TouchableOpacity>

                {currentPage === 0 && (
                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                    <TouchableOpacity onPress={handleSignIn}>
                      <Text style={styles.signInButton}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </PagerView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  image: {
    width: width - 32,
    height: width - 32,
    alignSelf: 'center',
    marginTop: 48,
  },
  textContainer: {
    marginTop: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    color: '#000000',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
  },
  dots: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  signInButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#007AFF',
  },
});

export default OnboardingScreen;