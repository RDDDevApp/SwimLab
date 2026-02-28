import { WorkoutContent, WorkoutBlock, SubBlock } from '../types';

/**
 * Migrates old workout content formats to the current SubBlock format.
 *
 * Old format (3 levels): Block > SubBlock > Exercise[]
 *   - sub_blocks[].exercises: Array<{ name, distance, duration, ... }>
 *   - sub_blocks[].title, sub_blocks[].series
 *
 * New format (2 levels): Block > SubBlock[]
 *   - sub_blocks[]: { id, distance, repetitions, description?, departure? }
 *
 * If the content is already in the new format, it is returned as-is.
 */
export function migrateWorkoutContent(content: any): WorkoutContent {
  if (!content || !content.blocks) {
    return { blocks: [] };
  }

  const blocks: WorkoutBlock[] = (content.blocks as any[]).map((block) =>
    migrateBlock(block),
  );

  return { blocks };
}

function migrateBlock(block: any): WorkoutBlock {
  const subBlocks: SubBlock[] = (block.sub_blocks || []).map((sb: any) =>
    migrateSubBlock(sb),
  );

  // Map old block types to new ones
  const type = normalizeBlockType(block.type);

  return {
    id: block.id || generateId(),
    type,
    name: block.name || block.title || '',
    sub_blocks: subBlocks,
  };
}

function migrateSubBlock(sb: any): SubBlock {
  // Already in new format: has distance and repetitions as numbers, no exercises
  if (
    typeof sb.distance === 'number' &&
    typeof sb.repetitions === 'number' &&
    !sb.exercises
  ) {
    return {
      id: sb.id || generateId(),
      distance: sb.distance,
      repetitions: sb.repetitions,
      description: sb.description,
      departure: sb.departure,
    };
  }

  // Old format: has exercises[] array
  if (Array.isArray(sb.exercises) && sb.exercises.length > 0) {
    const totalDistance = sb.exercises.reduce(
      (sum: number, ex: any) => sum + (ex.distance || 0),
      0,
    );
    const descriptions = sb.exercises
      .map((ex: any) => ex.name || ex.description)
      .filter(Boolean);

    return {
      id: sb.id || generateId(),
      distance: totalDistance,
      repetitions: sb.series || 1,
      description:
        descriptions.length > 0 ? descriptions.join(', ') : sb.title || undefined,
      departure: sb.departure || undefined,
    };
  }

  // Old format without exercises but with title/series
  if (sb.title || sb.series) {
    return {
      id: sb.id || generateId(),
      distance: sb.distance || 0,
      repetitions: sb.series || sb.repetitions || 1,
      description: sb.title || sb.description || undefined,
      departure: sb.departure || undefined,
    };
  }

  // Fallback: return as-is with defaults
  return {
    id: sb.id || generateId(),
    distance: sb.distance || 0,
    repetitions: sb.repetitions || 1,
    description: sb.description,
    departure: sb.departure,
  };
}

function normalizeBlockType(
  type: string | undefined,
): 'warmup' | 'main' | 'cooldown' | 'other' {
  if (!type) return 'other';
  const t = type.toLowerCase();
  if (t === 'warmup' || t === 'echauffement') return 'warmup';
  if (t === 'main' || t === 'corps' || t === 'principal') return 'main';
  if (t === 'cooldown' || t === 'recuperation' || t === 'retour_au_calme')
    return 'cooldown';
  if (['warmup', 'main', 'cooldown', 'other'].includes(t))
    return t as 'warmup' | 'main' | 'cooldown' | 'other';
  return 'other';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
