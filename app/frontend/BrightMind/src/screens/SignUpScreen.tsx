// src/screens/SignUpScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Keyboard,
  Linking,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Yup from 'yup';
import { useFormik } from 'formik';

// Custom Hooks and Utils
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../hooks/useNetwork';
import { useSnackbar } from '../hooks/useSnackbar';
import { performanceMonitor } from '../utils/performance';

// Components
import { InputField } from '../components/InputField';
import { AuthButton } from '../components/AuthButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';

// Types
import { AuthStackScreenProps } from '../types/navigation';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export const SignUpScreen: React.FC<AuthStackScreenProps<'SignUp'>> = ({ navigation }) => {
  const theme = useTheme();
  const { signUp, loading } = useAuth();
  const { isConnected } = useNetwork();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected) {
        showSnackbar('You are offline. Please check your internet connection.');
        return;
      }

      const perfMetric = performanceMonitor.start('sign_up_attempt');
      try {
        await signUp(values);
        performanceMonitor.end(perfMetric);
        navigation.navigate('ProfileImage');
      } catch (error) {
        performanceMonitor.end(perfMetric, { error: true });
        showSnackbar(
          error instanceof Error
            ? error.message
            : 'An error occurred during sign up'
        );
      }
    },
  });

  // Calculate password strength
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  // Keyboard handling
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Back handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (keyboardVisible) {
          Keyboard.dismiss();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [keyboardVisible]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text variant="headlineLarge" style={styles.title}>Sign Up</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Hey there 👋,{'\n'}Welcome to BrightMind! Sign up to get started
            </Text>
          </View>

          <View style={styles.formContainer}>
            <InputField
              label="First Name"
              value={formik.values.firstName}
              onChangeText={formik.handleChange('firstName')}
              onBlur={formik.handleBlur('firstName')}
              error={formik.touched.firstName && formik.errors.firstName}
              autoCapitalize="words"
              testID="first-name-input"
            />

            <InputField
              label="Email"
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              error={formik.touched.email && formik.errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="email-input"
            />

            <InputField
              label="Password"
              value={formik.values.password}
              onChangeText={formik.handleChange('password')}
              onBlur={formik.handleBlur('password')}
              error={formik.touched.password && formik.errors.password}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              testID="password-input"
            />

            <PasswordStrengthIndicator
              strength={getPasswordStrength(formik.values.password)}
            />

            <InputField
              label="Confirm Password"
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              secureTextEntry={!showPassword}
              testID="confirm-password-input"
            />

            <View style={styles.termsContainer}>
              <Text variant="bodySmall" style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL('https://docs.google.com/document/d/1K9TeUVP10IHt9Ie6FWBUy8L6LeVgbUZBkj6HG5FYw50/edit?usp=sharing')}
                >
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL('https://docs.google.com/document/d/1aMmADGFks9YNzOfkd6VaiNQAfht7wwoG69sMqfE57xA/edit?usp=sharing')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <AuthButton
              onPress={() => formik.handleSubmit()}
              loading={loading}
              disabled={!formik.isValid || loading}
              testID="sign-up-button"
            >
              Sign Up
            </AuthButton>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <SocialAuthButtons />
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.accountContainer}>
              <Text variant="bodyMedium">Already have an account? </Text>
              <AuthButton
                mode="text"
                onPress={() => navigation.navigate('SignIn')}
                testID="sign-in-link"
              >
                Sign In
              </AuthButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
    gap: 16,
  },
  termsContainer: {
    marginTop: 8,
  },
  termsText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SignUpScreen;