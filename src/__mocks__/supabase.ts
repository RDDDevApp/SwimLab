/**
 * Chainable mock builder for Supabase query methods.
 * Each method returns `this` to allow chaining, except terminal methods
 * (single, maybeSingle) which return the mock result.
 */

type MockResult = { data: any; error: any; count?: number };

export function createMockQueryBuilder(result: MockResult = { data: null, error: null }) {
  const builder: any = {
    _result: result,
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: jest.fn((resolve: any) => resolve(result)),
  };

  // Make builder thenable (so `await supabase.from(...).select(...)` works)
  builder[Symbol.for('jest.asymmetricMatch')] = undefined;

  return builder;
}

export function createMockSupabase() {
  const mockFrom = jest.fn();

  const supabase = {
    from: mockFrom,
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  };

  return { supabase, mockFrom };
}
