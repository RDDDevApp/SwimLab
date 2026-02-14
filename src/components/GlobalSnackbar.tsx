import React from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useSnackbarStore } from '../stores/snackbarStore';

const COLORS = {
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
};

export default function GlobalSnackbar() {
  const { visible, message, type, hide } = useSnackbarStore();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={3000}
      style={[styles.snackbar, { backgroundColor: COLORS[type] }]}
      action={{ label: 'OK', onPress: hide, textColor: '#FFFFFF' }}
    >
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 16,
  },
});
