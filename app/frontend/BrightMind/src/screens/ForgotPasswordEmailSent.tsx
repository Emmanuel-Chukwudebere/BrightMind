// src/screens/ForgotPasswordEmailSent.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ForgotPasswordStackParamList } from '../types/navigation';
import { forgotPasswordStyles as styles } from '../constants/styles';

export const ForgotPasswordEmailSentScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ForgotPasswordStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.supportingText}>
          We've sent a link to you email. Please click the link to continue
        </Text>
      </View>

      <View style={styles.gifContainer}>
        <Image
          source={require('../assets/images/email-sent.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.supportingText, { textAlign: 'center' }]}>
        You've got a mail from BrightMind! Check your mailbox
      </Text>

      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordEmailSentScreen;