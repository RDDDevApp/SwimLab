import React from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useSnackbarStore } from '../stores/snackbarStore';
import { C } from '../config/tokens';

const COLORS = {
  success: C.success,
  error: C.danger,
  info: C.primary,
};

export default function GlobalSnackbar() {
  const { visible, message, type, hide } = useSnackbarStore();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={3000}
      style={[styles.snackbar, { backgroundColor: COLORS[type] }]}
      action={{ label: 'OK', onPress: hide, textColor: C.onPrimary }}
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
