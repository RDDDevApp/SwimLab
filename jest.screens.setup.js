// Tests d'écrans : Supabase n'est jamais appelé (les services sont simulés dans chaque test).
jest.mock('./src/config/supabase', () => ({ supabase: {} }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// expo 54 + Jest 30 : le registre import.meta d'Expo est chargé paresseusement après la fin
// du test, ce que Jest refuse. On le remplace par une version vide.
jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    },
  },
}));
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

// Bruit connu de React Native Paper en test (icônes non chargées, minuteries internes des champs)
const NOISE = ['none of the required icon libraries are installed', 'not wrapped in act('];
for (const level of ['warn', 'error']) {
  const original = console[level];
  console[level] = (...args) => {
    const text = typeof args[0] === 'string' ? args[0] : '';
    if (NOISE.some((n) => text.includes(n))) return;
    original(...args);
  };
}
