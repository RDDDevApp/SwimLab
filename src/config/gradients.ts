export const OCEAN_GRADIENT = {
  colors: ['#82C8D1', '#A4D4CC', '#C2E0C7', '#DEEDC2', '#F8F9BC'] as const,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

export const ACCENT_GRADIENTS = {
  cta: {
    colors: ['#0891B2', '#0E7490'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  hot: {
    colors: ['#DB2777', '#EA580C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  achievement: {
    colors: ['#0891B2', '#DB2777'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  endurance: {
    colors: ['#0E7490', '#0891B2'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  sprint: {
    colors: ['#DC2626', '#EA580C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  technique: {
    colors: ['#7C3AED', '#8B5CF6'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  recovery: {
    colors: ['#059669', '#10B981'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
