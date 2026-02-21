import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { GROUP_LEVELS, GroupLevel } from '../../types';
import { groupService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import PickerSelect from '../../components/PickerSelect';

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateGroupScreen({ navigation, route }: Props) {
  const { user, clubId: storeClubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<string>('beginner');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clubId = route?.params?.clubId || storeClubId;

  const levelOptions = Object.entries(GROUP_LEVELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await groupService.create({
        club_id: clubId,
        coach_id: user.id,
        name: name.trim(),
        level: level as GroupLevel,
        description: description.trim() || null,
      });
      showSnackbar('Groupe cree', 'success');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Nouveau groupe
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          label="Nom du groupe"
          placeholder="Ex: Poussins, Competition"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <PickerSelect
          label="Niveau"
          value={level}
          options={levelOptions}
          onChange={setLevel}
        />

        <TextInput
          label="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { marginTop: 12 }]}
        />

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          Creer le groupe
        </Button>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  form: {
    padding: 16,
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  saveButton: {
    marginTop: 16,
  },
});
