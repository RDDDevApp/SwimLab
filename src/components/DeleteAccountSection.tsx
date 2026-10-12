import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, HelperText } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { useSnackbarStore } from '../stores/snackbarStore';

const CONFIRM_WORD = 'SUPPRIMER';

/** Suppression définitive du compte, avec confirmation saisie (exigée par les stores et le RGPD). */
export default function DeleteAccountSection() {
  const { deleteAccount, profile } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setTyped('');
    setError('');
  };

  const confirm = async () => {
    setDeleting(true);
    setError('');
    const { error: deleteError } = await deleteAccount();
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    showSnackbar('Ton compte a été supprimé.', 'success');
  };

  const isCoach = profile?.role === 'coach';

  return (
    <>
      <Button mode="text" textColor="#B91C1C" icon="delete-outline" onPress={() => setOpen(true)} style={styles.trigger}>
        Supprimer mon compte
      </Button>

      <Portal>
        <Dialog visible={open} onDismiss={close}>
          <Dialog.Title>Supprimer ton compte ?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.text}>
              {isCoach
                ? "Ton compte et tes données personnelles seront supprimés définitivement. Les séances que tu as créées pour le club restent disponibles pour le club. Si tu es responsable d'un club qui a encore des membres, la suppression sera refusée."
                : 'Ton compte, ton historique, tes feedbacks et tes séances perso seront supprimés définitivement.'}
            </Text>
            <Text style={styles.text}>Cette action est irréversible. Pour confirmer, tape {CONFIRM_WORD} :</Text>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              mode="outlined"
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={CONFIRM_WORD}
            />
            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close} disabled={deleting}>
              Annuler
            </Button>
            <Button
              mode="contained"
              buttonColor="#B91C1C"
              onPress={confirm}
              loading={deleting}
              disabled={deleting || typed.trim().toUpperCase() !== CONFIRM_WORD}
            >
              Supprimer définitivement
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    marginTop: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 10,
  },
});
