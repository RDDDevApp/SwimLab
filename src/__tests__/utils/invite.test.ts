jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, Share: { share: jest.fn() } }));

import { buildInviteLink, getInviteCodeFromUrl, normalizeInviteCode } from '../../utils/invite';

describe('invite utils', () => {
  it('normalizes codes typed with spaces or capitals', () => {
    expect(normalizeInviteCode('  DauPHINS ')).toBe('dauphins');
  });

  it('builds a link to the public web app with the club parameter', () => {
    const link = buildInviteLink('DAUPHINS');
    expect(link).toBe('https://rdddevapp.github.io/SwimLab/?club=dauphins');
  });

  it('reads no code from the URL outside the web', () => {
    expect(getInviteCodeFromUrl()).toBeNull();
  });
});
