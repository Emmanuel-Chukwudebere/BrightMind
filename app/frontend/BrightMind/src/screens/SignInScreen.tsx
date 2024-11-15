// src/screens/SignInScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Keyboard,
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

// Types
import { AuthStackScreenProps } from '../types/navigation';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const SignInScreen: React.FC<AuthStackScreenProps<'SignIn'>> = ({ navigation }) => {
  const theme = useTheme();
  const { signIn, loading } = useAuth();
  const { isConnected } = useNetwork();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected) {
        showSnackbar('You are offline. Please check your internet connection.');
        return;
      }

      const perfMetric = performanceMonitor.start('sign_in_attempt');
      try {
        await signIn(values);
        performanceMonitor.end(perfMetric);
        navigation.replace('Home');
      } catch (error) {
        performanceMonitor.end(perfMetric, { error: true });
        showSnackbar(
          error instanceof Error
            ? error.message
            : 'An error occurred during sign in'
        );
      }
    },
  });

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
            <Text variant="headlineLarge" style={styles.title}>Sign In</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Welcome back! Sign in to continue learning
            </Text>
          </View>

          <View style={styles.formContainer}>
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

            <AuthButton
              onPress={() => formik.handleSubmit()}
              loading={loading}
              disabled={!formik.isValid || loading}
              testID="sign-in-button"
            >
              Sign In
            </AuthButton>

            <AuthButton
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              testID="forgot-password-button"
            >
              Forgot password?
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
              <Text variant="bodyMedium">Don't have an account? </Text>
              <AuthButton
                mode="text"
                onPress={() => navigation.navigate('SignUp')}
                testID="sign-up-link"
              >
                Sign Up
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

export default SignInScreen;