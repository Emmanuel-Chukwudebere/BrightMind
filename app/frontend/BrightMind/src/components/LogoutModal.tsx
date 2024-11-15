// src/components/LogoutModal.tsx
import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';

/**
 * LogoutModal Component
 * 
 * A modal dialog that confirms user logout action.
 * Features primary and secondary action buttons.
 */
interface LogoutModalProps {
  visible: boolean;
  onDismiss: () => void;
  onLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onDismiss,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Text variant="titleMedium" style={styles.title}>
              Confirm Logout
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              Are you sure you want to log out of BrightMind?
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={onLogout}
                style={styles.logoutButton}
                labelStyle={styles.buttonLabel}
                theme={{
                  roundness: 100,
                  colors: {
                    primary: '#EC221F',
                  },
                }}
              >
                Log Out
              </Button>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.cancelButton}
                labelStyle={[styles.buttonLabel, styles.cancelButtonLabel]}
                theme={{
                  roundness: 100,
                  colors: {
                    primary: '#247EBF',
                  },
                }}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: '#186AA4',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#186AA4',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  logoutButton: {
    borderRadius: 100,
  },
  cancelButton: {
    borderRadius: 100,
    borderColor: '#247EBF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonLabel: {
    color: '#247EBF',
  },
});
