import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useSnackbarStore } from '../stores/snackbarStore';
import { buildInviteLink, shareInviteLink } from '../utils/invite';

interface Props {
  clubName: string;
  swimmerCode: string;
  coachCode: string;
}

/** Boutons de partage des liens d'invitation nageur et coach d'un club. */
export default function InviteLinkActions({ clubName, swimmerCode, coachCode }: Props) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const verb = Platform.OS === 'web' ? 'Copier' : 'Partager';

  const share = async (code: string, audience: 'nageur' | 'coach') => {
    const result = await shareInviteLink(code, clubName, audience);
    if (result === 'copied') {
      showSnackbar(`Lien ${audience} copié : envoie-le sur le groupe du club`, 'success');
    } else if (result === 'failed') {
      // Copie refusée par le navigateur : on affiche le lien pour une copie manuelle
      showSnackbar(buildInviteLink(code), 'info');
    }
  };

  return (
    <View style={styles.row}>
      <Button mode="contained-tonal" icon="link-variant" onPress={() => share(swimmerCode, 'nageur')} style={styles.button}>
        {verb} le lien nageur
      </Button>
      <Button mode="outlined" icon="link-variant" onPress={() => share(coachCode, 'coach')} style={styles.button}>
        {verb} le lien coach
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flexGrow: 1,
  },
});
