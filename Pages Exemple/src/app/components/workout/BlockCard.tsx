import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, ChevronUp, ChevronDown, Sliders, Timer, 
  Dumbbell, Activity, Check, Settings 
} from 'lucide-react';
import { WorkoutBlock, BlockType, BLOCK_STYLES, STROKES, EQUIPMENT_LIST } from './types';

interface BlockCardProps {
  block: WorkoutBlock;
  index: number;
  total: number;
  editable?: boolean;
  onUpdate?: (id: number, field: keyof WorkoutBlock, value: any) => void;
  onDelete?: (id: number) => void;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ 
  block, index, total, editable = false, onUpdate, onDelete, onMoveUp, onMoveDown 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const style = BLOCK_STYLES[block.type];
  const blockDist = (block.reps || 1) * block.distance;

  const toggleEquipment = (eq: string) => {
    if (!editable || !onUpdate) return;
    const current = block.equipment || [];
    const next = current.includes(eq) ? current.filter(e => e !== eq) : [...current, eq];
    onUpdate(block.id, 'equipment', next);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white/60 backdrop-blur-xl border ${style.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:bg-white/80`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.dot}`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Index / Move controls */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <div className={`w-7 h-7 rounded-full ${style.bg} ${style.text} border ${style.border} flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm`}>
              {index + 1}
            </div>
            {editable && (
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onMoveUp?.(block.id)} 
                  disabled={index === 0} 
                  className="p-0.5 hover:bg-white rounded disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button 
                  onClick={() => onMoveDown?.(block.id)} 
                  disabled={index === total - 1} 
                  className="p-0.5 hover:bg-white rounded disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{blockDist > 0 ? `${blockDist}m` : '-'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{block.stroke}</span>
            </div>

            {editable ? (
              <input
                value={block.description}
                onChange={e => onUpdate?.(block.id, 'description', e.target.value)}
                className="w-full text-sm text-slate-800 font-extrabold bg-transparent border-none focus:outline-none focus:ring-0 rounded px-0 py-0.5 placeholder:text-slate-300"
                placeholder="Description du bloc (ex: 400m libre souple)..."
              />
            ) : (
              <p className="text-sm text-slate-800 font-extrabold leading-snug">{block.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Reps */}
              {editable ? (
                <div className="flex items-center gap-2 bg-white/40 border border-white/60 rounded-xl px-2 py-1 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Rép</span>
                  <input
                    type="number" min="1" max="50"
                    value={block.reps || 1}
                    onChange={e => onUpdate?.(block.id, 'reps', parseInt(e.target.value) || 1)}
                    className="w-8 text-xs text-slate-800 font-extrabold bg-transparent border-none p-0 text-center focus:ring-0"
                  />
                </div>
              ) : (
                block.reps && block.reps > 1 && <span className="text-xs font-bold text-slate-600 bg-slate-100/60 px-2 py-1 rounded-lg border border-white/40">{block.reps} × {block.distance}m</span>
              )}

              {/* Distance */}
              {editable && (
                <div className="flex items-center gap-2 bg-white/40 border border-white/60 rounded-xl px-2 py-1 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Dist</span>
                  <input
                    type="number" min="25" max="3000" step="25"
                    value={block.distance}
                    onChange={e => onUpdate?.(block.id, 'distance', parseInt(e.target.value) || 25)}
                    className="w-12 text-xs text-slate-800 font-extrabold bg-transparent border-none p-0 text-center focus:ring-0"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">m</span>
                </div>
              )}

              {/* Stroke Select (Manual Mode) */}
              {editable && (
                <div className="flex items-center gap-2 bg-white/40 border border-white/60 rounded-xl px-2 py-1 shadow-sm">
                  <select
                    value={block.stroke}
                    onChange={e => onUpdate?.(block.id, 'stroke', e.target.value as any)}
                    className="text-[10px] text-slate-600 font-bold bg-transparent border-none p-0 focus:ring-0 appearance-none cursor-pointer uppercase tracking-wider"
                  >
                    {STROKES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Rest */}
              {editable ? (
                <div className="flex items-center gap-2 bg-white/40 border border-white/60 rounded-xl px-2 py-1 shadow-sm">
                   <Timer className="w-3.5 h-3.5 text-slate-400" />
                   <input
                    placeholder="Repos"
                    value={block.rest || ''}
                    onChange={e => onUpdate?.(block.id, 'rest', e.target.value)}
                    className="w-12 text-xs text-slate-800 font-extrabold bg-transparent border-none p-0 text-center focus:ring-0 placeholder:text-slate-300"
                  />
                </div>
              ) : (
                block.rest && block.rest !== '-' && (
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1 bg-slate-50/60 px-2 py-1 rounded-lg border border-white/40">
                    <Timer className="w-3.5 h-3.5 text-slate-400" /> {block.rest}
                  </span>
                )
              )}
            </div>

            {/* Minimalist Details view */}
            {block.details && (!editable || !showAdvanced) && (
              <div className="mt-3 text-[11px] text-slate-600 font-medium bg-blue-50/30 px-3 py-2 rounded-xl border border-blue-100/50 flex items-start gap-2">
                <span className="text-blue-400 font-bold">↳</span>
                <span className="line-clamp-2">{block.details}</span>
              </div>
            )}

            {/* Advanced Toggle */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/40">
              <div className="flex flex-wrap gap-1.5">
                {(block.equipment || []).map(eq => (
                  <span key={eq} className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-0.5 rounded-full border border-white/60 shadow-sm">{eq}</span>
                ))}
              </div>
              
              {editable && (
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${showAdvanced ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'}`}
                >
                  <Settings className="w-3.5 h-3.5" /> 
                  Détails
                </button>
              )}
            </div>

            {/* Advanced Editor */}
            <AnimatePresence>
              {editable && showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/40 rounded-2xl p-4 mt-3 space-y-4 border border-white/60 shadow-inner">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Structure détaillée</label>
                      <textarea
                        value={block.details || ''}
                        onChange={e => onUpdate?.(block.id, 'details', e.target.value)}
                        className="w-full text-xs text-slate-700 bg-white/60 border border-white/80 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 resize-none font-medium"
                        placeholder="Ex: 50 éducatif, 50 nage complète, progressif 1 à 4..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Matériel spécifique</label>
                      <div className="flex flex-wrap gap-1.5">
                        {EQUIPMENT_LIST.map(eq => {
                          const active = (block.equipment || []).includes(eq);
                          return (
                            <button
                              key={eq}
                              onClick={() => toggleEquipment(eq)}
                              className={`text-[10px] px-3 py-1.5 rounded-xl font-bold transition-all border ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white/60 text-slate-500 border-white hover:border-blue-200 hover:bg-white'}`}
                            >
                              {eq}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Delete Action */}
          {editable && (
            <button
              onClick={() => onDelete?.(block.id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
