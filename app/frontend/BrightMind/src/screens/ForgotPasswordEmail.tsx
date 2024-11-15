// src/screens/ForgotPasswordEmail.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { ForgotPasswordStackParamList } from '../types/navigation';
import { forgotPasswordStyles as styles } from '../constants/styles';

export const ForgotPasswordEmailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ForgotPasswordStackParamList>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError('');
      
      await axios.post('{url}/api/v1/auth/password/reset-request', { email });
      await sendPasswordResetEmail(auth, email);
      
      navigation.navigate('ForgotPasswordEmailSent');
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.supportingText}>
          Enter the email used in creating your account
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={error}
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            loading={loading}
            disabled={!email || loading}
            label="Continue"
          />
          
          <View style={styles.accountContainer}>
            <Text style={styles.accountText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ForgotPasswordEmailScreen;