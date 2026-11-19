import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { makeNavigation, renderScreen } from './renderScreen';

const mockSubmit = jest.fn();
const mockUpdate = jest.fn();
const mockSnackbar = jest.fn();
jest.mock('../../services', () => ({
  workoutSessionService: {
    submitFeedback: (...a: unknown[]) => mockSubmit(...a),
    updateFeedback: (...a: unknown[]) => mockUpdate(...a),
  },
}));
jest.mock('../../stores/snackbarStore', () => ({
  useSnackbarStore: (select: (s: { show: jest.Mock }) => unknown) => select({ show: mockSnackbar }),
}));

import FeedbackScreen from '../../screens/swimmer/FeedbackScreen';

const route = (params: Record<string, unknown> = {}) => ({
  params: { sessionId: 'sess-1', workoutTitle: 'Pyramide', ...params },
});

describe('Écran de ressenti (nageur)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('affiche la séance et envoie le ressenti avec le commentaire', async () => {
    mockSubmit.mockResolvedValue({});
    const navigation = makeNavigation();
    const { queryClient } = renderScreen(<FeedbackScreen navigation={navigation} route={route()} />);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    expect(screen.getByText('Pyramide')).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("Comment s'est passée la séance ?"), '  Dur sur la fin ');
    fireEvent.press(screen.getByText('Envoyer mon feedback'));

    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
    expect(mockSubmit).toHaveBeenCalledWith('sess-1', {
      rpe_score: 13,
      feedback_text: 'Dur sur la fin',
      fatigue_score: null,
      technique_score: null,
    });
    expect(mockSnackbar).toHaveBeenCalledWith(expect.stringContaining('Merci'), 'success');
    // Accueil, calendrier et statistiques du nageur rechargés
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['swimmer'] });
  });

  it('reste sur l’écran et montre l’erreur si l’envoi échoue', async () => {
    mockSubmit.mockRejectedValue(new Error('Le score RPE doit être entre 6 et 20'));
    const navigation = makeNavigation();
    renderScreen(<FeedbackScreen navigation={navigation} route={route()} />);

    fireEvent.press(screen.getByText('Envoyer mon feedback'));

    expect(await screen.findByText('Le score RPE doit être entre 6 et 20')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('en modification : reprend le ressenti existant et rappelle la limite de 24 h', async () => {
    mockUpdate.mockResolvedValue({});
    const navigation = makeNavigation();
    renderScreen(
      <FeedbackScreen
        navigation={navigation}
        route={route({ editMode: true, existingRpe: 16, existingComment: 'Bien' })}
      />,
    );

    expect(screen.getByDisplayValue('Bien')).toBeTruthy();
    expect(screen.getByText("Modifiable pendant 24 h après l'envoi")).toBeTruthy();
    fireEvent.press(screen.getByText('Modifier mon feedback'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdate.mock.calls[0][1]).toMatchObject({ rpe_score: 16, feedback_text: 'Bien' });
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
