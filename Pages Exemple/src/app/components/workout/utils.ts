import { BlockType, WorkoutBlock } from "./types";

export interface GroupInfo {
  title?: string;
  notes?: string;
}

export interface WorkoutGroup {
  id: string;
  type: BlockType;
  blocks: WorkoutBlock[];
  info: GroupInfo;
}

/**
 * Groups consecutive blocks of the same type.
 */
export function groupBlocks(blocks: WorkoutBlock[], groupInfos: Record<number, GroupInfo>): WorkoutGroup[] {
  if (blocks.length === 0) return [];

  const groups: WorkoutGroup[] = [];
  let currentGroup: WorkoutGroup | null = null;

  blocks.forEach((block, index) => {
    if (!currentGroup || currentGroup.type !== block.type) {
      const groupIndex = groups.length;
      currentGroup = {
        id: `group-${groupIndex}-${block.type}`,
        type: block.type,
        blocks: [],
        info: groupInfos[groupIndex] || { title: `${block.type} ${groups.filter(g => g.type === block.type).length + 1}` }
      };
      groups.push(currentGroup);
    }
    currentGroup.blocks.push(block);
  });

  return groups;
}
