// src/screens/ForgotPasswordReset.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { updatePassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { ForgotPasswordStackParamList } from '../types/navigation';
import { forgotPasswordStyles as styles } from '../constants/styles';

export const ForgotPasswordResetScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ForgotPasswordStackParamList>>();
  const route = useRoute<RouteProp<ForgotPasswordStackParamList, 'ForgotPasswordReset'>>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    special: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPassword(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [password]);

  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      
      await axios.post('{url}/api/v1/auth/password/change', {
        token: route.params.token,
        password,
        confirmPassword,
      });

      await updatePassword(auth.currentUser!, password);
      
      navigation.navigate('ForgotPasswordSuccess');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.supportingText}>Time to set a new password</Text>
      </View>

      <View style={styles.inputContainer}>
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
        />
        
        <View style={{ marginTop: 8 }}>
          {Object.entries(requirements).map(([key, met]) => (
            <Text
              key={key}
              style={[
                styles.requirementText,
                { color: met ? '#34C759' : '#666666' },
              ]}
            >
              {key === 'length' && '• Your password must be at least 8 characters'}
              {key === 'uppercase' && '• Must contain an uppercase letter'}
              {key === 'lowercase' && '• Must contain a lowercase letter'}
              {key === 'special' && '• Must contain a special character(!,*,#...)'}
            </Text>
          ))}
        </View>

        <InputField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-Enter your password"
          secureTextEntry={true}
          style={{ marginTop: 16 }}
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleChangePassword}
            loading={loading}
            disabled={!Object.values(requirements).every(Boolean) || 
                     password !== confirmPassword ||
                     loading}
            label="Change Password"
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

export default ForgotPasswordResetScreen;