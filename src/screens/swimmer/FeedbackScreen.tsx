import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Mon ressenti
        </Text>
        {workoutTitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {workoutTitle}
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Effort percu (RPE)
        </Text>

        <Slider value={rpe} onChange={setRpe} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
          Commentaire (optionnel)
        </Text>

        <TextInput
          placeholder="Comment s'est passe la seance ?"
          value={comment}
          onChangeText={setComment}
          mode="outlined"
          multiline
          numberOfLines={4}
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
        >
          Envoyer mon feedback
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  form: {
    padding: 16,
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
    marginTop: 24,
  },
});
