export const OCEAN_GRADIENT = {
  colors: ['#0B1426', '#0C2D48', '#0A4A6B', '#0891B2'] as const,
  start: { x: 0, y: 0 },
  end: { x: 0.3, y: 1 },
};

export const ACCENT_GRADIENTS = {
  cta: {
    colors: ['#00C9DB', '#0891B2'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  hot: {
    colors: ['#F43F8E', '#FB923C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  achievement: {
    colors: ['#00C9DB', '#F43F8E'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  endurance: {
    colors: ['#0891B2', '#00C9DB'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  sprint: {
    colors: ['#EF4444', '#FB923C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  technique: {
    colors: ['#8B5CF6', '#A78BFA'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  recovery: {
    colors: ['#10B981', '#34D399'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
