import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { consentService } from '../../services/consentService';

describe('consentService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads only the row of the given account', async () => {
    const row = { user_id: 'u1', birth_date: '2013-05-02', parent_email: null };
    const builder = createMockQueryBuilder({ data: row, error: null });
    mockFrom.mockReturnValue(builder);

    await expect(consentService.getMine('u1')).resolves.toEqual(row);
    expect(mockFrom).toHaveBeenCalledWith('member_consents');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(builder.maybeSingle).toHaveBeenCalled();
  });

  it('returns null when the account has no row yet', async () => {
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: null }));
    await expect(consentService.getMine('u1')).resolves.toBeNull();
  });

  it('saves a minor: normalised parent email and consent date', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await consentService.saveMine('u1', {
      birthDate: '2014-01-10',
      parentEmail: '  Parent@Example.COM ',
      parentalConsent: true,
      termsAccepted: true,
    });

    const [payload, options] = builder.upsert.mock.calls[0];
    expect(options).toEqual({ onConflict: 'user_id' });
    expect(payload).toMatchObject({
      user_id: 'u1',
      birth_date: '2014-01-10',
      parent_email: 'parent@example.com',
    });
    expect(payload.parental_consent_at).toEqual(expect.any(String));
    expect(payload.terms_accepted_at).toEqual(expect.any(String));
  });

  it('saves an adult without parent fields and keeps an earlier terms date', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await consentService.saveMine('u1', { birthDate: '1990-03-03' });

    const [payload] = builder.upsert.mock.calls[0];
    expect(payload.parent_email).toBeNull();
    expect(payload.parental_consent_at).toBeNull();
    expect(payload).not.toHaveProperty('terms_accepted_at');
  });

  it('throws the database error (for example a refused write)', async () => {
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: { message: 'denied' } }));
    await expect(consentService.saveMine('u1', { birthDate: '2000-01-01' })).rejects.toEqual({
      message: 'denied',
    });
  });
});
