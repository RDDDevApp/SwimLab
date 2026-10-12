jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const mockInvoke = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: any[]) => mockInvoke(...args) },
  },
}));

jest.mock('../../config/features', () => ({ FEATURES: { push: true } }));
jest.mock('expo-notifications', () => ({}), { virtual: true });

import { notificationService } from '../../services/notificationService';

describe('notificationService.requestFeedback', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks the send-push function to notify the swimmers of the session', async () => {
    mockInvoke.mockResolvedValue({ data: { queued: 3, sent: 3 }, error: null });

    await notificationService.requestFeedback('assignment-1');

    expect(mockInvoke).toHaveBeenCalledWith('send-push', {
      body: { type: 'feedback_request', assignment_id: 'assignment-1' },
    });
  });
});
