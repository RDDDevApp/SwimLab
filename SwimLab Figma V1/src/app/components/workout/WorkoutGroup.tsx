import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Layers, PenTool, Trash2, Info, Plus } from 'lucide-react';
import { WorkoutBlock, BlockType, BLOCK_STYLES } from './types';
import { GroupInfo } from './utils';
import { BlockCard } from './BlockCard';

interface WorkoutGroupProps {
  groupIndex: number;
  type: BlockType;
  blocks: WorkoutBlock[];
  info: GroupInfo;
  editable: boolean;
  onUpdateBlock: (id: number, field: keyof WorkoutBlock, value: any) => void;
  onDeleteBlock: (id: number) => void;
  onMoveUpBlock: (id: number) => void;
  onMoveDownBlock: (id: number) => void;
  onUpdateGroupInfo: (index: number, info: Partial<GroupInfo>) => void;
  onAddBlock?: (type: BlockType) => void;
  onMoveUpGroup?: (index: number) => void;
  onMoveDownGroup?: (index: number) => void;
  isFirstGroup?: boolean;
  isLastGroup?: boolean;
}

export const WorkoutGroupView: React.FC<WorkoutGroupProps> = ({
  groupIndex,
  type,
  blocks,
  info,
  editable,
  onUpdateBlock,
  onDeleteBlock,
  onMoveUpBlock,
  onMoveDownBlock,
  onUpdateGroupInfo,
  onAddBlock,
  onMoveUpGroup,
  onMoveDownGroup,
  isFirstGroup,
  isLastGroup,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const style = BLOCK_STYLES[type];
  const totalDist = blocks.reduce((sum, b) => sum + (b.reps || 1) * b.distance, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative mb-8 rounded-3xl overflow-hidden backdrop-blur-md border border-white/40 shadow-xl ${style.glow}`}
    >
      {/* Background glass layer */}
      <div className={`absolute inset-0 opacity-10 ${style.bg}`} />
      
      {/* Header */}
      <div className="relative z-10 p-5 bg-white/30 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-10 h-10 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center shadow-inner border border-white/50`}>
              <Layers className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {editable && isEditingTitle ? (
                  <input
                    autoFocus
                    value={info.title || ''}
                    onChange={(e) => onUpdateGroupInfo(groupIndex, { title: e.target.value })}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="text-lg font-extrabold text-slate-800 bg-white/50 border-none px-2 py-0.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none w-full max-w-xs"
                  />
                ) : (
                  <h3 
                    className="text-lg font-extrabold text-slate-800 cursor-pointer flex items-center gap-2 group"
                    onClick={() => editable && setIsEditingTitle(true)}
                  >
                    {info.title || `${type} ${groupIndex + 1}`}
                    {editable && <PenTool className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </h3>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${style.bg} ${style.text} border border-white/60`}>
                  {type}
                </span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded-full">{totalDist}m</span>
              </div>
              
              {editable && !showNotes && !info.notes && (
                <button 
                  onClick={() => setShowNotes(true)}
                  className="text-[11px] font-medium text-slate-400 hover:text-blue-500 mt-1 transition-colors"
                >
                  + Ajouter des consignes globales
                </button>
              )}
              
              {(showNotes || info.notes) && (
                <div className="mt-2">
                  <textarea
                    placeholder="Consignes générales pour ce groupe..."
                    value={info.notes || ''}
                    onChange={(e) => onUpdateGroupInfo(groupIndex, { notes: e.target.value })}
                    className="w-full text-xs text-slate-600 bg-white/40 border border-white/40 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    rows={1}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {editable && (onMoveUpGroup || onMoveDownGroup) && (
              <div className="flex flex-col mr-2">
                <button 
                  onClick={() => onMoveUpGroup?.(groupIndex)}
                  disabled={isFirstGroup}
                  className="p-1 hover:bg-white/40 rounded-t-lg transition-all text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Monter le groupe"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onMoveDownGroup?.(groupIndex)}
                  disabled={isLastGroup}
                  className="p-1 hover:bg-white/40 rounded-b-lg transition-all text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Descendre le groupe"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/40 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 p-4 space-y-3 bg-white/10"
          >
            {blocks.map((block, i) => (
              <BlockCard
                key={block.id}
                block={block}
                index={i}
                total={blocks.length}
                editable={editable}
                onUpdate={onUpdateBlock}
                onDelete={onDeleteBlock}
                onMoveUp={onMoveUpBlock}
                onMoveDown={onMoveDownBlock}
              />
            ))}
            
            {editable && onAddBlock && (
              <button
                onClick={() => onAddBlock(type)}
                className={`w-full py-3 rounded-2xl border border-dashed flex items-center justify-center gap-2 text-sm font-bold transition-all ${style.text} hover:${style.bg} hover:border-transparent group`}
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors group-hover:bg-white/50 border-current`}>
                  <Plus className="w-3.5 h-3.5" />
                </div>
                Ajouter un sous-bloc
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
