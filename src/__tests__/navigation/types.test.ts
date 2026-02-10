/**
 * Navigation types tests — Sprint 3-4
 * Ensures type exports and navigation param shapes are correct.
 */

import {
  CoachStackParamList,
  SwimmerStackParamList,
  CoachTabParamList,
  SwimmerTabParamList,
} from '../../types';

describe('CoachStackParamList', () => {
  it('should include Attendance screen with required params', () => {
    const params: CoachStackParamList['Attendance'] = {
      assignmentId: 'a1',
      groupId: 'g1',
      workoutTitle: 'Sprint session',
    };
    expect(params.assignmentId).toBe('a1');
    expect(params.groupId).toBe('g1');
    expect(params.workoutTitle).toBe('Sprint session');
  });

  it('should allow Attendance without workoutTitle', () => {
    const params: CoachStackParamList['Attendance'] = {
      assignmentId: 'a1',
      groupId: 'g1',
    };
    expect(params.workoutTitle).toBeUndefined();
  });

  it('should include AssignWorkout with required params', () => {
    const params: CoachStackParamList['AssignWorkout'] = {
      slotId: 's1',
      slotName: 'Lundi soir',
      date: '2026-02-09',
    };
    expect(params.slotId).toBe('s1');
    expect(params.date).toBe('2026-02-09');
  });

  it('should allow CoachTabs with undefined', () => {
    const params: CoachStackParamList['CoachTabs'] = undefined;
    expect(params).toBeUndefined();
  });
});

describe('SwimmerStackParamList', () => {
  it('should include Feedback screen with required params', () => {
    const params: SwimmerStackParamList['Feedback'] = {
      sessionId: 's1',
      workoutTitle: 'Endurance 2000m',
    };
    expect(params.sessionId).toBe('s1');
    expect(params.workoutTitle).toBe('Endurance 2000m');
  });

  it('should allow Feedback without workoutTitle', () => {
    const params: SwimmerStackParamList['Feedback'] = {
      sessionId: 's1',
    };
    expect(params.workoutTitle).toBeUndefined();
  });

  it('should allow SwimmerTabs with undefined', () => {
    const params: SwimmerStackParamList['SwimmerTabs'] = undefined;
    expect(params).toBeUndefined();
  });
});

describe('CoachTabParamList', () => {
  it('should have all 5 tabs', () => {
    const tabNames: (keyof CoachTabParamList)[] = [
      'Dashboard',
      'Calendar',
      'Workouts',
      'Groups',
      'Profile',
    ];
    expect(tabNames).toHaveLength(5);
  });
});

describe('SwimmerTabParamList', () => {
  it('should have all 3 tabs', () => {
    const tabNames: (keyof SwimmerTabParamList)[] = [
      'Dashboard',
      'Calendar',
      'Profile',
    ];
    expect(tabNames).toHaveLength(3);
  });
});
