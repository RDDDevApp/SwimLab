export type BlockType = 'Échauffement' | 'Série' | 'Récupération';
export type Stroke = 'Nage Libre' | 'Dos' | 'Brasse' | 'Papillon' | '4 Nages' | 'Spécialité' | 'Au Choix';

export interface WorkoutBlock {
  id: number;
  type: BlockType;
  description: string;
  reps?: number;
  distance: number;
  stroke: Stroke;
  rest?: string;
  details?: string;
  equipment?: string[];
}

export const BLOCK_STYLES: Record<BlockType, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  'Échauffement': { 
    bg: 'bg-cyan-50/40',    
    text: 'text-cyan-700',    
    border: 'border-cyan-200/50',   
    dot: 'bg-cyan-500',
    glow: 'shadow-cyan-400/20'
  },
  'Série': { 
    bg: 'bg-blue-50/40',    
    text: 'text-blue-700',    
    border: 'border-blue-200/50',   
    dot: 'bg-blue-500',
    glow: 'shadow-blue-400/20'
  },
  'Récupération': { 
    bg: 'bg-green-50/40',   
    text: 'text-green-700',   
    border: 'border-green-200/50',  
    dot: 'bg-green-500',
    glow: 'shadow-green-400/20'
  },
};

export const BLOCK_TYPES: BlockType[] = ['Échauffement', 'Série', 'Récupération'];
export const STROKES: Stroke[] = ['Nage Libre', 'Dos', 'Brasse', 'Papillon', '4 Nages', 'Spécialité', 'Au Choix'];
export const EQUIPMENT_LIST = ['Plaquettes', 'Pull-buoy', 'Palmes', 'Tuba', 'Planche'];
export const FOCUS_TAGS = ['Endurance', 'Sprint', 'Technique', '4 Nages', 'Respiration', 'Virages', 'Départs', 'Aérobie'];
export const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Elite'];
