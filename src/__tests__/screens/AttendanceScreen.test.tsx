import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { makeNavigation, renderScreen } from './renderScreen';

const mocks = {
  getMembers: jest.fn(),
  getCoachProfiles: jest.fn(),
  getByAssignment: jest.fn(),
  bulkCreateAttendance: jest.fn(),
  markAttendance: jest.fn(),
  requestFeedback: jest.fn(),
  getSwimmersByClub: jest.fn(),
  snackbar: jest.fn(),
};

jest.mock('../../services', () => ({
  groupService: { getMembers: (...a: unknown[]) => mocks.getMembers(...a) },
  groupCoachService: { getCoachProfiles: (...a: unknown[]) => mocks.getCoachProfiles(...a) },
  workoutSessionService: { bulkCreateAttendance: (...a: unknown[]) => mocks.bulkCreateAttendance(...a) },
  workoutAssignmentService: { markAttendance: (...a: unknown[]) => mocks.markAttendance(...a) },
  notificationService: { requestFeedback: (...a: unknown[]) => mocks.requestFeedback(...a) },
  profileService: { getSwimmersByClub: (...a: unknown[]) => mocks.getSwimmersByClub(...a) },
}));
jest.mock('../../services/presenceService', () => ({
  presenceService: { getByAssignment: (...a: unknown[]) => mocks.getByAssignment(...a) },
}));
jest.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'thomas' }, clubId: 'club-1' }),
}));
jest.mock('../../stores/snackbarStore', () => ({
  useSnackbarStore: (select: (s: { show: jest.Mock }) => unknown) => select({ show: mocks.snackbar }),
}));

import AttendanceScreen from '../../screens/coach/AttendanceScreen';

const swimmer = (id: string, first_name: string) => ({ id, first_name, last_name: 'Démo' });
const route = { params: { assignmentId: 'assign-1', groupId: 'group-1', workoutTitle: 'Pyramide' } };

describe("Écran d'émargement (coach)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.getMembers.mockResolvedValue([swimmer('sophie', 'Sophie'), swimmer('lucas', 'Lucas'), swimmer('emma', 'Emma')]);
    mocks.getCoachProfiles.mockResolvedValue([
      { ...swimmer('thomas', 'Thomas'), is_creator: true },
      { ...swimmer('julie', 'Julie'), is_creator: false },
    ]);
    mocks.getByAssignment.mockResolvedValue([
      { swimmer_id: 'lucas', status: 'absent', reason: 'Malade' },
      { swimmer_id: 'emma', status: 'present', reason: null },
    ]);
    mocks.bulkCreateAttendance.mockResolvedValue([]);
    mocks.markAttendance.mockResolvedValue({});
    mocks.requestFeedback.mockResolvedValue({});
  });

  it('pré-coche le groupe sauf les absences signalées, et montre les déclarations', async () => {
    renderScreen(<AttendanceScreen navigation={makeNavigation()} route={route} />);

    expect(await screen.findByText('2/3 présents')).toBeTruthy();
    expect(screen.getByText('Absent · Malade')).toBeTruthy();
    expect(screen.getByText('Confirmé')).toBeTruthy();
    // Plusieurs coachs : on choisit qui a donné la séance
    expect(screen.getByText('Coach qui a donné la séance')).toBeTruthy();
  });

  it('valide l’appel, prévient les nageurs et revient en arrière', async () => {
    const navigation = makeNavigation();
    const { queryClient } = renderScreen(<AttendanceScreen navigation={navigation} route={route} />);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    await screen.findByText('2/3 présents');

    // Lucas finalement présent : un appui sur sa carte le coche
    fireEvent.press(screen.getByText('Lucas Démo'));
    expect(screen.getByText('3/3 présents')).toBeTruthy();
    fireEvent.press(screen.getByText("Valider l'émargement (3/3)"));

    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
    const [assignmentId, all, attended, guests] = mocks.bulkCreateAttendance.mock.calls[0];
    expect(assignmentId).toBe('assign-1');
    expect(all).toEqual(['sophie', 'lucas', 'emma']);
    expect([...attended].sort()).toEqual(['emma', 'lucas', 'sophie']);
    expect(guests).toEqual([]);
    // Le coach connecté encadre le groupe : il est noté comme coach de la séance
    expect(mocks.markAttendance).toHaveBeenCalledWith('assign-1', 'thomas');
    expect(mocks.requestFeedback).toHaveBeenCalledWith('assign-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['coach'] });
  });

  it('« Aucun » décoche tout le monde', async () => {
    renderScreen(<AttendanceScreen navigation={makeNavigation()} route={route} />);
    await screen.findByText('2/3 présents');
    fireEvent.press(screen.getByText('Aucun'));
    expect(screen.getByText('0/3 présents')).toBeTruthy();
  });

  it('montre l’erreur et reste sur l’écran si l’enregistrement échoue', async () => {
    mocks.bulkCreateAttendance.mockRejectedValue(new Error('Réessaie dans quelques minutes.'));
    const navigation = makeNavigation();
    renderScreen(<AttendanceScreen navigation={navigation} route={route} />);
    await screen.findByText('2/3 présents');

    fireEvent.press(screen.getByText("Valider l'émargement (2/3)"));

    expect(await screen.findByText('Réessaie dans quelques minutes.')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(mocks.markAttendance).not.toHaveBeenCalled();
  });
});
