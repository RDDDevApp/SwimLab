import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, HelperText, IconButton } from 'react-native-paper';
import Slider from '../../components/RPESlider';
import { workoutSessionService } from '../../services';
import { useSnackbarStore } from '../../stores/snackbarStore';

interface Props {
  navigation: any;
  route: any;
}

export default function FeedbackScreen({ navigation, route }: Props) {
  const { sessionId, workoutTitle } = route.params;

  const showSnackbar = useSnackbarStore((s) => s.show);
  const [rpe, setRpe] = useState(13);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await workoutSessionService.submitFeedback(sessionId, {
        rpe_score: rpe,
        feedback_text: comment.trim() || undefined,
      });
      showSnackbar('Merci pour ton feedback !', 'success');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      {/* Backdrop: tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={handleDismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="titleLarge" style={styles.title}>
                Mon ressenti
              </Text>
              {workoutTitle && (
                <Text variant="bodyMedium" style={styles.subtitle}>
                  {workoutTitle}
                </Text>
              )}
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={handleDismiss}
              style={styles.closeBtn}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Effort percu (RPE)
            </Text>

            <Slider value={rpe} onChange={setRpe} />

            <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 20 }]}>
              Commentaire (optionnel)
            </Text>

            <TextInput
              placeholder="Comment s'est passee la seance ?"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
              contentStyle={styles.submitContent}
            >
              Envoyer mon feedback
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    margin: -4,
  },
  form: {
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 12,
  },
  submitContent: {
    paddingVertical: 6,
  },
});
