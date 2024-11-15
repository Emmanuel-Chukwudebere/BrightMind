// src/constants/styles.ts
import { StyleSheet } from 'react-native';

export const forgotPasswordStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  textContainer: {
    marginTop: 32,
  },
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  supportingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
  },
  inputContainer: {
    marginTop: 32,
  },
  buttonContainer: {
    marginTop: 24,
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  accountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  signUpText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#007AFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifContainer: {
    height: 200,
    marginVertical: 32,
  },
  requirementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
});