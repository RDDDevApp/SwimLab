import { parseBirthDate, ageOn, needsParentalConsent, formatBirthDate } from '../../utils/age';

const TODAY = new Date(2026, 10, 18); // 18 novembre 2026

describe('parseBirthDate', () => {
  it('reads JJ/MM/AAAA and its usual variants', () => {
    expect(parseBirthDate('01/05/2014', TODAY)).toBe('2014-05-01');
    expect(parseBirthDate('1/5/2014', TODAY)).toBe('2014-05-01');
    expect(parseBirthDate(' 01.05.2014 ', TODAY)).toBe('2014-05-01');
    expect(parseBirthDate('01-05-2014', TODAY)).toBe('2014-05-01');
  });

  it('rejects impossible, future or malformed dates', () => {
    expect(parseBirthDate('31/02/2014', TODAY)).toBeNull();
    expect(parseBirthDate('00/05/2014', TODAY)).toBeNull();
    expect(parseBirthDate('19/11/2026', TODAY)).toBeNull();
    expect(parseBirthDate('01/01/1899', TODAY)).toBeNull();
    expect(parseBirthDate('2014-05-01', TODAY)).toBeNull();
    expect(parseBirthDate('', TODAY)).toBeNull();
  });
});

describe('ageOn', () => {
  it('counts completed years only', () => {
    expect(ageOn('2011-11-18', TODAY)).toBe(15); // anniversaire aujourd'hui
    expect(ageOn('2011-11-19', TODAY)).toBe(14); // anniversaire demain
    expect(ageOn('1990-01-01', TODAY)).toBe(36);
  });
});

describe('needsParentalConsent', () => {
  it('is true under 15, false from the 15th birthday', () => {
    expect(needsParentalConsent('2011-11-19', TODAY)).toBe(true);
    expect(needsParentalConsent('2011-11-18', TODAY)).toBe(false);
    expect(needsParentalConsent('2000-06-15', TODAY)).toBe(false);
  });
});

describe('formatBirthDate', () => {
  it('formats for display', () => {
    expect(formatBirthDate('2014-05-01')).toBe('01/05/2014');
  });
});
