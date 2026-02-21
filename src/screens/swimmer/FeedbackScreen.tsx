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
  const { sessionId, workoutTitle, editMode, existingRpe, existingComment } = route.params;
  const isEdit = editMode === true;

  const showSnackbar = useSnackbarStore((s) => s.show);
  const [rpe, setRpe] = useState(existingRpe ?? 13);
  const [comment, setComment] = useState(existingComment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await workoutSessionService.updateFeedback(sessionId, {
          rpe_score: rpe,
          feedback_text: comment.trim() || undefined,
        });
        showSnackbar('Feedback modifie !', 'success');
      } else {
        await workoutSessionService.submitFeedback(sessionId, {
          rpe_score: rpe,
          feedback_text: comment.trim() || undefined,
        });
        showSnackbar('Merci pour ton feedback !', 'success');
      }
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
      <Pressable style={styles.backdrop} onPress={handleDismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="titleLarge" style={styles.title}>
                {isEdit ? 'Modifier mon ressenti' : 'Mon ressenti'}
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
              {isEdit ? 'Modifier mon feedback' : 'Envoyer mon feedback'}
            </Button>

            {isEdit && (
              <Text variant="bodySmall" style={styles.editHint}>
                Modification possible dans les 24h suivant l'envoi
              </Text>
            )}
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
    backgroundColor: '#0C2D48',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.30)',
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
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.50)',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 12,
  },
  submitContent: {
    paddingVertical: 6,
  },
  editHint: {
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginTop: 8,
  },
});
