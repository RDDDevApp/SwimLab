import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import SegmentedToggle from '../../components/SegmentedToggle';
import { aiService, GenerateWorkoutParams } from '../../services/aiService';
import { WORKOUT_TYPE_COLORS, TEXT_COLORS } from '../../config/tokens';

const OBJECTIVES = [
  { key: 'endurance', icon: 'infinite-outline' },
  { key: 'sprint', icon: 'flash-outline' },
  { key: 'technique', icon: 'locate-outline' },
  { key: 'recovery', icon: 'leaf-outline' },
] as const;

const LEVELS = [
  { key: 'debutant', label: 'Débutant' },
  { key: 'intermediaire', label: 'Intermédiaire' },
  { key: 'avance', label: 'Avancé' },
] as const;

const DURATIONS = [30, 45, 60, 90];

/** Generation de seance par IA : formulaire -> Edge Function -> editeur pre-rempli. */
export default function GenerateWorkoutScreen({ navigation }: { navigation: any }) {
  const [objective, setObjective] = useState<GenerateWorkoutParams['objective']>('endurance');
  const [level, setLevel] = useState<GenerateWorkoutParams['level']>('intermediaire');
  const [minutes, setMinutes] = useState(60);
  const [poolIndex, setPoolIndex] = useState(0); // 0 = 25m, 1 = 50m
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const generated = await aiService.generateWorkout({
        objective,
        level,
        minutes,
        poolLength: poolIndex === 0 ? 25 : 50,
        notes: notes.trim() || undefined,
      });
      // La preview EST l'editeur : seance directement modifiable avant sauvegarde
      navigation.replace('CreateWorkout', {
        prefill: {
          title: generated.title,
          description: generated.description,
          content: generated.content,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreen>
      <AnimatedBackground variant="cyan" />
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={22} color="#7C3AED" />
          <Text variant="titleLarge" style={styles.title}>
            Générer une séance
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {loading ? (
          <GlassCard elevated style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingTitle}>Le coach IA réfléchit…</Text>
            <Text style={styles.loadingHint}>
              Structure, volumes et intervalles adaptés à ton niveau : quelques secondes.
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text style={styles.label}>Objectif</Text>
            <View style={styles.chipsRow}>
              {OBJECTIVES.map((o) => {
                const cfg = WORKOUT_TYPE_COLORS[o.key];
                const active = objective === o.key;
                return (
                  <Pressable
                    key={o.key}
                    style={[
                      styles.objectiveChip,
                      { backgroundColor: active ? cfg.color : cfg.bg },
                    ]}
                    onPress={() => setObjective(o.key)}
                  >
                    <Ionicons
                      name={o.icon as any}
                      size={16}
                      color={active ? '#fff' : cfg.color}
                    />
                    <Text style={[styles.objectiveText, { color: active ? '#fff' : cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Niveau</Text>
            <View style={styles.chipsRow}>
              {LEVELS.map((l) => (
                <Pressable
                  key={l.key}
                  style={[styles.pill, level === l.key && styles.pillActive]}
                  onPress={() => setLevel(l.key)}
                >
                  <Text style={[styles.pillText, level === l.key && styles.pillTextActive]}>
                    {l.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Durée dans l'eau</Text>
            <View style={styles.chipsRow}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d}
                  style={[styles.pill, minutes === d && styles.pillActive]}
                  onPress={() => setMinutes(d)}
                >
                  <Text style={[styles.pillText, minutes === d && styles.pillTextActive]}>
                    {d} min
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Bassin</Text>
            <SegmentedToggle
              options={['25 m', '50 m']}
              selectedIndex={poolIndex}
              onChange={setPoolIndex}
            />

            <Text style={styles.label}>Envies ou contraintes (optionnel)</Text>
            <TextInput
              placeholder="Ex. : travailler les virages, pas de matériel, épaule fragile…"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              icon="creation"
              onPress={handleGenerate}
              style={styles.generateBtn}
              buttonColor="#7C3AED"
              contentStyle={{ paddingVertical: 6 }}
            >
              Générer ma séance
            </Button>
            <Text style={styles.editHint}>
              La séance générée s'ouvre dans l'éditeur : modifie-la librement avant de l'enregistrer.
            </Text>
          </>
        )}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  form: {
    padding: 16,
    paddingBottom: 40,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_COLORS.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  objectiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  objectiveText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  pillActive: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_COLORS.secondary,
  },
  pillTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
  },
  generateBtn: {
    marginTop: 24,
    borderRadius: 14,
  },
  editHint: {
    fontSize: 12,
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
    marginTop: 10,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
    marginTop: 40,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLORS.primary,
  },
  loadingHint: {
    fontSize: 13,
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
