// src/screens/ForgotPasswordSuccess.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ForgotPasswordStackParamList } from '../types/navigation';
import { forgotPasswordStyles as styles } from '../constants/styles';

export const ForgotPasswordSuccessScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ForgotPasswordStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.supportingText}>Password changed successfully</Text>
      </View>

      <View style={styles.gifContainer}>
        <Image
          source={require('../assets/images/success.gif')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <View>
        <Text style={[styles.supportingText, { textAlign: 'center', marginBottom: 24 }]}>
          You've successfully changed your password. Go back to the sign in screen and sign in with your new password
        </Text>

        <PrimaryButton
          onPress={() => navigation.navigate('SignIn')}
          label="Sign In"
        />
      </View>
    </View>
  );
};

export default ForgotPasswordSuccessScreen;