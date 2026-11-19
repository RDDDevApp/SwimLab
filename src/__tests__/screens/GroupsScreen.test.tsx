import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { makeNavigation, renderScreen } from './renderScreen';

const mockGetByCoach = jest.fn();
jest.mock('../../services', () => ({
  groupService: { getByCoach: (...a: unknown[]) => mockGetByCoach(...a), delete: jest.fn() },
}));
jest.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'thomas' } }),
}));
jest.mock('../../stores/snackbarStore', () => ({
  useSnackbarStore: (select: (s: { show: jest.Mock }) => unknown) => select({ show: jest.fn() }),
}));
// Le rechargement au retour sur l'écran dépend de React Navigation, absent ici
jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));

import GroupsScreen from '../../screens/coach/GroupsScreen';

describe('Écran « Mes groupes » (coach)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('liste les groupes du coach connecté', async () => {
    mockGetByCoach.mockResolvedValue([
      { id: 'g1', name: 'Compétition', level: 'competition', description: 'Interclubs' },
      { id: 'g2', name: 'Loisir adultes', level: 'intermediate', description: null },
    ]);
    renderScreen(<GroupsScreen navigation={makeNavigation()} />);

    expect(await screen.findByText('Loisir adultes')).toBeTruthy();
    expect(screen.getByText('Interclubs')).toBeTruthy();
    expect(mockGetByCoach).toHaveBeenCalledWith('thomas');
  });

  it('« Voir créneaux » ouvre les créneaux du groupe, la carte ouvre le groupe', async () => {
    mockGetByCoach.mockResolvedValue([{ id: 'g1', name: 'Compétition', level: null, description: null }]);
    const navigation = makeNavigation();
    renderScreen(<GroupsScreen navigation={navigation} />);

    fireEvent.press(await screen.findByText('Voir créneaux'));
    expect(navigation.navigate).toHaveBeenCalledWith('Slots', { groupId: 'g1' });

    fireEvent.press(screen.getByText('Compétition'));
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', { groupId: 'g1' });
  });

  it('invite à créer un premier groupe quand il n’y en a aucun', async () => {
    mockGetByCoach.mockResolvedValue([]);
    renderScreen(<GroupsScreen navigation={makeNavigation()} />);
    expect(await screen.findByText('Aucun groupe pour le moment')).toBeTruthy();
  });
});
