import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, PenTool, ChevronLeft, Waves, Zap, Dumbbell,
  Plus, Save, Play, Trash2, Activity, RefreshCw, Check, 
  ArrowRight, Cpu, Layers, ToggleLeft, ToggleRight, 
  Flame, Wind, Star, Droplets, Sliders, Settings, Map, Lock
} from 'lucide-react';
import { Link } from 'react-router';
import { SplashCoach } from '../coach/SplashCoach';

// Imports from our new components
import { WorkoutBlock, BlockType, Stroke, BLOCK_STYLES, BLOCK_TYPES, STROKES, EQUIPMENT_LIST, FOCUS_TAGS, LEVELS } from './types';
import { groupBlocks, GroupInfo } from './utils';
import { BlockCard } from './BlockCard';
import { WorkoutGroupView } from './WorkoutGroup';

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────
const bgImage = "https://images.unsplash.com/photo-1593935882214-7c9568ad5cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBtaW5pbWFsaXN0JTIwYmx1ZSUyMHdhdGVyJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjYzNTUyOXww&ixlib=rb-4.1.0&q=80&w=1080";

type Mode = 'selection' | 'ai' | 'manual';
type AIStep = 'config' | 'loading' | 'result';

// ─────────────────────────────────────────────────────────
// AI-GENERATED WORKOUT DATA (mock)
// ─────────────────────────────────────────────────────────
const generateMockWorkout = (distance: number, intensity: number, focus: string[]): WorkoutBlock[] => {
  const isHigh = intensity > 65;
  const isMedium = intensity >= 35 && intensity <= 65;
  return [
    { id: 1, type: 'Échauffement',  description: 'Nage souple, respiration tous les 3 temps',   reps: 1,  distance: Math.round(distance * 0.15 / 50) * 50, stroke: 'Nage Libre', rest: '30s' },
    { id: 2, type: 'Série',         description: 'Éducatif : Rattrapé + Ciseaux de jambes',     reps: 6,  distance: 50,                                    stroke: focus.includes('4 Nages') ? '4 Nages' : 'Nage Libre', rest: '20s', equipment: ['Planche'] },
    { id: 3, type: 'Série',         description: isHigh ? 'Sprint départ mur, relâchement sous l\'eau' : 'Aérobie à allure constante, FC cible 75%', reps: isHigh ? 10 : 5, distance: isHigh ? 50 : 100, stroke: 'Nage Libre', rest: isHigh ? '45s' : '30s', details: isHigh ? 'Allure max sur 15m' : 'Régulier' },
    { id: 4, type: 'Série',         description: isMedium ? 'Nage alternée, variation de tempo' : 'Série de spécialité', reps: 4, distance: 100, stroke: focus.includes('4 Nages') ? '4 Nages' : 'Spécialité', rest: '40s', details: '50m Libre / 50m Spécialité, Progressif de 1 à 4' },
    { id: 5, type: 'Récupération',  description: 'Nage libre décontractée, respiration ample',  reps: 1,  distance: 100, stroke: 'Au Choix', rest: '-' },
    { id: 6, type: 'Série',         description: 'Série principale — focus sur la finition',     reps: 8,  distance: 50,  stroke: 'Nage Libre', rest: '30s', equipment: ['Plaquettes', 'Pull-buoy'] },
    { id: 7, type: 'Récupération',  description: 'Nage dos décontractée, respiration profonde',  reps: 1,  distance: Math.round(distance * 0.1 / 50) * 50, stroke: 'Dos', rest: '-' },
  ];
};

// ─────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────
const IntensityZone: React.FC<{ value: number }> = ({ value }) => {
  if (value < 35) return <span className="flex items-center gap-1 text-blue-600"><Wind className="w-4 h-4" /> Récupération</span>;
  if (value < 65) return <span className="flex items-center gap-1 text-green-600"><Activity className="w-4 h-4" /> Aérobie</span>;
  if (value < 85) return <span className="flex items-center gap-1 text-orange-500"><Zap className="w-4 h-4" /> Seuil</span>;
  return <span className="flex items-center gap-1 text-red-600"><Flame className="w-4 h-4" /> VO₂Max</span>;
};

const AILoadingPanel: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = [
    'Analyse de tes performances récentes...',
    'Calcul des zones d\'intensité optimales...',
    'Structuration des blocs d\'entraînement...',
    'Optimisation des temps de repos...',
    'Génération du programme final...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-teal-200 border-t-teal-500 shadow-lg shadow-teal-100"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-teal-500" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">L'IA travaille pour toi</h3>
      <p className="text-slate-400 text-sm mb-8">Génération de ta séance personnalisée</p>

      <div className="w-full max-w-md space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < step ? 'bg-teal-500 shadow-sm' : i === step ? 'bg-teal-200' : 'bg-slate-200'}`}>
              {i < step ? <Check className="w-3 h-3 text-white" /> : <div className={`w-2 h-2 rounded-full ${i === step ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`} />}
            </div>
            <span className={`text-sm transition-all ${i <= step ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SUMMARY SIDEBAR
// ─────────────────────────────────────────────────────────
interface SummaryProps {
  blocks: WorkoutBlock[];
  onSave?: () => void;
  onLaunch?: () => void;
  saved?: boolean;
}

const SummarySidebar: React.FC<SummaryProps> = ({ blocks, onSave, onLaunch, saved }) => {
  const totalDist = blocks.reduce((sum, b) => sum + (b.reps || 1) * b.distance, 0);
  const estimatedMin = Math.round(totalDist / 40);
  const difficulty = totalDist < 1500 ? { label: 'Facile', color: 'bg-green-100 text-green-700' }
    : totalDist < 2500 ? { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700' }
    : totalDist < 3500 ? { label: 'Difficile', color: 'bg-orange-100 text-orange-700' }
    : { label: 'Intense', color: 'bg-red-100 text-red-700' };

  const typeBreakdown = BLOCK_TYPES.map(t => ({
    type: t,
    dist: blocks.filter(b => b.type === t).reduce((s, b) => s + (b.reps || 1) * b.distance, 0),
    style: BLOCK_STYLES[t],
  })).filter(t => t.dist > 0);

  const strokeBreakdown = STROKES.map(s => ({
    stroke: s,
    dist: blocks.filter(b => b.stroke === s).reduce((sum, b) => sum + (b.reps || 1) * b.distance, 0),
  })).filter(s => s.dist > 0);

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-xl shadow-blue-900/5 sticky top-8">
      <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" /> Résumé
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-blue-50/80 rounded-2xl p-4 text-center border border-blue-100/50">
          <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Distance</p>
          <p className="text-3xl font-extrabold text-slate-800">{totalDist >= 1000 ? `${(totalDist / 1000).toFixed(1)}` : totalDist}</p>
          <p className="text-xs font-semibold text-slate-500">{totalDist >= 1000 ? 'km' : 'm'}</p>
        </div>
        <div className="bg-teal-50/80 rounded-2xl p-4 text-center border border-teal-100/50">
          <p className="text-[10px] text-teal-500 font-bold uppercase mb-1">Durée est.</p>
          <p className="text-3xl font-extrabold text-slate-800">{estimatedMin}</p>
          <p className="text-xs font-semibold text-slate-500">min</p>
        </div>
      </div>

      <div className="flex justify-between items-center py-3 border-b border-slate-100/60 mb-3">
        <span className="text-sm font-medium text-slate-500">Difficulté</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${difficulty.color}`}>{difficulty.label}</span>
      </div>

      <div className="flex justify-between items-center py-3 border-b border-slate-100/60 mb-4">
        <span className="text-sm font-medium text-slate-500">Blocs totaux</span>
        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{blocks.length}</span>
      </div>

      {typeBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Par Bloc</p>
          <div className="space-y-3">
            {typeBreakdown.map(({ type, dist, style }) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <span className="text-xs font-semibold text-slate-500 flex-1">{type}</span>
                <span className="text-xs font-bold text-slate-700">{dist}m</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${style.dot} rounded-full`} style={{ width: `${Math.min(100, (dist / totalDist) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {strokeBreakdown.length > 0 && (
        <div className="mb-6 pt-4 border-t border-slate-100/60">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Par Nage</p>
          <div className="space-y-3">
            {strokeBreakdown.map(({ stroke, dist }) => (
              <div key={stroke} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span className="text-xs font-semibold text-slate-500 flex-1">{stroke}</span>
                <span className="text-xs font-bold text-slate-700">{dist}m</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(100, (dist / totalDist) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        className={`w-full py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 mb-3 ${saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'}`}
      >
        {saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Enregistrer</>}
      </button>
      <button
        onClick={onLaunch}
        className="w-full py-3.5 border-2 border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-white/80"
      >
        <Play className="w-4 h-4" /> Lancer maintenant
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ADD BLOCK PALETTE
// ─────────────────────────────────────────────────────────
interface AddBlockPaletteProps {
  onAdd: (type: BlockType) => void;
}
const AddBlockPalette: React.FC<AddBlockPaletteProps> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full py-6 border-2 border-dashed border-blue-200/80 rounded-3xl text-blue-400 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3 bg-white/40 backdrop-blur-sm group"
      >
        <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        Ajouter un bloc à la séance
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full mb-4 left-0 right-0 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl shadow-blue-900/10 z-30"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Quel type de bloc souhaites-tu ajouter ?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BLOCK_TYPES.map(type => {
                const s = BLOCK_STYLES[type];
                return (
                  <button
                    key={type}
                    onClick={() => { onAdd(type); setOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 ${s.bg} ${s.text} ${s.border} hover:opacity-80 transition-all text-sm font-bold shadow-sm hover:scale-[1.02]`}
                  >
                    <div className={`w-3 h-3 rounded-full ${s.dot} shadow-lg`} />
                    {type}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// AI CONFIGURATION PANEL
// ─────────────────────────────────────────────────────────
const AIConfigPanel: React.FC<{ onGenerate: (blocks: WorkoutBlock[]) => void }> = ({ onGenerate }) => {
  const [distance, setDistance] = useState(2500);
  const [intensity, setIntensity] = useState(60);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Endurance']);
  const [level, setLevel] = useState('Intermédiaire');
  const [poolLength, setPoolLength] = useState<25 | 50>(25);
  const [loading, setLoading] = useState(false);

  const toggleFocus = (tag: string) => {
    setSelectedFocus(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onGenerate(generateMockWorkout(distance, intensity, selectedFocus));
    }, 3500);
  };

  if (loading) return <AILoadingPanel />;

  return (
    <motion.div
      key="ai-config"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-8"
    >
      <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl shadow-teal-900/5 space-y-8">
        <div>
          <label className="flex items-center justify-between text-slate-800 font-bold mb-4">
            <span className="flex items-center gap-2"><Waves className="w-5 h-5 text-teal-600" /> Distance cible</span>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-bold">{distance >= 1000 ? `${(distance/1000).toFixed(1)} km` : `${distance} m`}</span>
          </label>
          <input
            type="range" min="1000" max="6000" step="100"
            value={distance} onChange={e => setDistance(parseInt(e.target.value))}
            className="w-full h-2 bg-teal-200 rounded-full appearance-none cursor-pointer accent-teal-600"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-slate-800 font-bold mb-4">
            <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" /> Intensité globale</span>
            <span className="text-sm font-bold bg-white px-3 py-1 rounded-full shadow-sm"><IntensityZone value={intensity} /></span>
          </label>
          <input
            type="range" min="0" max="100"
            value={intensity} onChange={e => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
            style={{ background: `linear-gradient(to right, #60a5fa 0%, #34d399 35%, #fb923c 65%, #ef4444 100%)` }}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-slate-800 font-bold mb-3">
            <Star className="w-5 h-5 text-yellow-500" /> Niveau
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${level === l ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white/50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-slate-800 font-bold mb-3">
            <Dumbbell className="w-5 h-5 text-purple-500" /> Focus Principal
          </label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFocus(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedFocus.includes(tag) ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-white/50 text-slate-600 border-slate-200 hover:border-teal-300'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          Générer ma séance sur-mesure
        </button>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-8 bg-gradient-to-br from-teal-500/10 to-blue-500/10 backdrop-blur-md border border-teal-200/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/60">
             <Cpu className="w-10 h-10 text-teal-600" />
           </div>
           <h3 className="text-xl font-extrabold text-slate-800 mb-2">Algorithme de coaching</h3>
           <p className="text-slate-500 text-sm mb-6 leading-relaxed">
             L'IA va optimiser ton programme de <span className="font-bold text-teal-600">{distance}m</span>.
           </p>
           <div className="w-full space-y-2">
             <div className="flex justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                <span className="text-slate-500 font-bold text-xs uppercase">Niveau</span>
                <span className="text-slate-800 font-extrabold text-xs">{level}</span>
             </div>
             <div className="flex justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                <span className="text-slate-500 font-bold text-xs uppercase">Bassin</span>
                <span className="text-slate-800 font-extrabold text-xs">{poolLength}m</span>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// AI RESULT PANEL
// ─────────────────────────────────────────────────────────
const AIResultPanel: React.FC<{ blocks: WorkoutBlock[]; onRegenerate: () => void; onEdit: () => void }> = ({ blocks, onRegenerate, onEdit }) => {
  const [saved, setSaved] = useState(false);
  const [groupInfos, setGroupInfos] = useState<Record<number, GroupInfo>>({});
  
  const groups = useMemo(() => groupBlocks(blocks, groupInfos), [blocks, groupInfos]);

  const updateGroupInfo = (index: number, info: Partial<GroupInfo>) => {
    setGroupInfos(prev => ({
      ...prev,
      [index]: { ...prev[index], ...info }
    }));
  };

  return (
    <motion.div
      key="ai-result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-sm font-bold text-teal-700 uppercase tracking-widest">Généré par SwimMaster IA</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
              <PenTool className="w-3.5 h-3.5" /> Personnaliser
            </button>
            <button onClick={onRegenerate} className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-100/80 hover:bg-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Regénérer
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {groups.map((group, i) => (
            <WorkoutGroupView 
              key={group.id}
              groupIndex={i}
              type={group.type}
              blocks={group.blocks}
              info={group.info}
              editable={false}
              onUpdateBlock={() => {}}
              onDeleteBlock={() => {}}
              onMoveUpBlock={() => {}}
              onMoveDownBlock={() => {}}
              onUpdateGroupInfo={updateGroupInfo}
            />
          ))}
        </div>
      </div>

      <div>
        <SummarySidebar blocks={blocks} onSave={() => setSaved(true)} saved={saved} onLaunch={() => {}} />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// MANUAL PANEL
// ─────────────────────────────────────────────────────────
const ManualPanel: React.FC = () => {
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([
    { id: 1, type: 'Échauffement',  description: 'Nage Libre souple, respiration 3 temps', reps: 1, distance: 400, stroke: 'Nage Libre', rest: '30s' },
    { id: 2, type: 'Série',         description: 'Série Mixte VMA courte', reps: 10, distance: 100, stroke: 'Spécialité', rest: '20s', details: '5 Crawl, 5 Spécialité, progressif de 1 à 5', equipment: ['Plaquettes'] },
    { id: 3, type: 'Récupération',  description: 'Nage dos décontractée, relâchement', reps: 1, distance: 200, stroke: 'Dos', rest: '-' },
  ]);
  const [groupInfos, setGroupInfos] = useState<Record<number, GroupInfo>>({});
  const [saved, setSaved] = useState(false);

  const groups = useMemo(() => groupBlocks(blocks, groupInfos), [blocks, groupInfos]);

  const updateBlock = (id: number, field: keyof WorkoutBlock, value: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    setSaved(false);
  };

  const deleteBlock = (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSaved(false);
  };

  const moveUp = (id: number) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id);
      if (i === 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (id: number) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id);
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const moveUpGroup = (groupIndex: number) => {
    if (groupIndex <= 0) return;

    const g1 = groups[groupIndex - 1];
    const g2 = groups[groupIndex];

    // Create a map of block[0].id -> groupInfo to preserve info
    const blockIdToInfo = new globalThis.Map<number, GroupInfo>();
    groups.forEach((g, i) => {
      if (groupInfos[i]) {
        blockIdToInfo.set(g.blocks[0].id, groupInfos[i]);
      }
    });

    setBlocks(prev => {
      const g1Start = prev.findIndex(b => b.id === g1.blocks[0].id);
      if (g1Start === -1) return prev;

      const newBlocks = [...prev];
      const g2Blocks = newBlocks.splice(g1Start + g1.blocks.length, g2.blocks.length);
      newBlocks.splice(g1Start, 0, ...g2Blocks);

      // Recompute group infos based on the new array
      const newGroups = [];
      let currentGroup = null;
      const nextInfos: Record<number, GroupInfo> = {};

      newBlocks.forEach(block => {
        if (!currentGroup || currentGroup.type !== block.type) {
          const newIdx = newGroups.length;
          currentGroup = { type: block.type };
          newGroups.push(currentGroup);

          // Find if this new group's first block had info
          if (blockIdToInfo.has(block.id)) {
            nextInfos[newIdx] = blockIdToInfo.get(block.id)!;
          }
        }
      });

      setGroupInfos(nextInfos);
      return newBlocks;
    });
    
    setSaved(false);
  };

  const moveDownGroup = (groupIndex: number) => {
    if (groupIndex >= groups.length - 1) return;

    const g1 = groups[groupIndex];
    const g2 = groups[groupIndex + 1];

    const blockIdToInfo = new globalThis.Map<number, GroupInfo>();
    groups.forEach((g, i) => {
      if (groupInfos[i]) {
        blockIdToInfo.set(g.blocks[0].id, groupInfos[i]);
      }
    });

    setBlocks(prev => {
      const g1Start = prev.findIndex(b => b.id === g1.blocks[0].id);
      if (g1Start === -1) return prev;

      const newBlocks = [...prev];
      const g2Blocks = newBlocks.splice(g1Start + g1.blocks.length, g2.blocks.length);
      newBlocks.splice(g1Start, 0, ...g2Blocks);

      const newGroups = [];
      let currentGroup = null;
      const nextInfos: Record<number, GroupInfo> = {};

      newBlocks.forEach(block => {
        if (!currentGroup || currentGroup.type !== block.type) {
          const newIdx = newGroups.length;
          currentGroup = { type: block.type };
          newGroups.push(currentGroup);

          if (blockIdToInfo.has(block.id)) {
            nextInfos[newIdx] = blockIdToInfo.get(block.id)!;
          }
        }
      });

      setGroupInfos(nextInfos);
      return newBlocks;
    });

    setSaved(false);
  };

  const addBlock = (type: BlockType, insertAfterId?: number) => {
    const newBlock = {
      id: Date.now(), type, description: 'Nouvelle série...', reps: 4, distance: 100, stroke: 'Nage Libre' as Stroke, rest: '30s'
    };
    
    setBlocks(prev => {
      if (insertAfterId) {
        const index = prev.findIndex(b => b.id === insertAfterId);
        if (index !== -1) {
          const newBlocks = [...prev];
          newBlocks.splice(index + 1, 0, newBlock);
          return newBlocks;
        }
      }
      return [...prev, newBlock];
    });
    setSaved(false);
  };

  const updateGroupInfo = (index: number, info: Partial<GroupInfo>) => {
    setGroupInfos(prev => ({
      ...prev,
      [index]: { ...prev[index], ...info }
    }));
  };

  return (
    <motion.div
      key="manual"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-200" />
            <span className="text-sm font-bold text-blue-700 uppercase tracking-widest">Éditeur de séance dynamique</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {groups.map((group, i) => (
              <WorkoutGroupView
                key={group.id}
                groupIndex={i}
                type={group.type}
                blocks={group.blocks}
                info={group.info}
                editable
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                onMoveUpBlock={moveUp}
                onMoveDownBlock={moveDown}
                onUpdateGroupInfo={updateGroupInfo}
                onAddBlock={(type) => addBlock(type, group.blocks[group.blocks.length - 1]?.id)}
                onMoveUpGroup={moveUpGroup}
                onMoveDownGroup={moveDownGroup}
                isFirstGroup={i === 0}
                isLastGroup={i === groups.length - 1}
              />
            ))}
          </AnimatePresence>
          <AddBlockPalette onAdd={addBlock} />
        </div>
      </div>

      <div>
        <SummarySidebar blocks={blocks} onSave={() => setSaved(true)} saved={saved} onLaunch={() => {}} />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export const WorkoutBuilder: React.FC = () => {
  const [mode, setMode] = useState<Mode>('selection');
  const [aiStep, setAiStep] = useState<AIStep>('config');
  const [generatedBlocks, setGeneratedBlocks] = useState<WorkoutBlock[]>([]);

  const handleAIGenerate = (blocks: WorkoutBlock[]) => {
    setGeneratedBlocks(blocks);
    setAiStep('result');
  };

  const handleRegenerate = () => {
    setAiStep('config');
    setGeneratedBlocks([]);
  };

  const handleEditFromAI = () => {
    setMode('manual');
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-teal-500 selection:text-white pb-20">
      
      {/* Background with Aquatic Blur */}
      <div className="fixed inset-0 z-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover opacity-[0.2] scale-105 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/70 via-blue-50/60 to-white/90" />
        <motion.div animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-10 w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 60, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link
              to="/solo"
              className="p-3.5 rounded-2xl bg-white/70 hover:bg-white transition-all border border-white/60 shadow-lg shadow-blue-900/5 group"
            >
              <ChevronLeft className="w-6 h-6 text-slate-500 group-hover:text-slate-800 transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-teal-600 font-extrabold text-[10px] mb-1.5 tracking-widest uppercase">
                <Droplets className="w-3.5 h-3.5" />
                <span>SwimMaster Pro</span>
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                {mode === 'selection' ? 'Éditeur de séance' : mode === 'ai' ? 'Génération IA' : 'Atelier Manuel'}
              </h1>
            </div>
          </div>

          {mode !== 'selection' && (
            <button
              onClick={() => { setMode('selection'); setAiStep('config'); setGeneratedBlocks([]); }}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/60 hover:bg-white px-5 py-3 rounded-2xl border border-white/60 transition-all shadow-md backdrop-blur-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Revenir aux modes
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <motion.button
                  onClick={() => setMode('ai')}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[40px] p-12 text-left bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-[0_30px_60px_-12px_rgba(20,184,166,0.3)] border border-teal-400/30"
                >
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/30 shadow-inner">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Générateur IA</h2>
                    <p className="text-teal-50 text-base leading-relaxed mb-10 font-medium opacity-90">
                      L'IA compose ton entraînement idéal en analysant tes perfs passées et tes objectifs du jour.
                    </p>
                    <div className="flex items-center gap-3 text-sm font-black group-hover:gap-5 transition-all bg-white/20 w-fit px-6 py-3 rounded-2xl border border-white/20">
                      <span>Lancer le générateur</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setMode('manual')}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[40px] p-12 text-left bg-white/80 backdrop-blur-xl text-slate-800 shadow-[0_30px_60px_-12px_rgba(30,58,138,0.1)] border border-white/80 hover:bg-white transition-all"
                >
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 border border-blue-100 shadow-inner">
                      <PenTool className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Atelier Manuel</h2>
                    <p className="text-slate-500 text-base leading-relaxed mb-10 font-medium">
                      Contrôle absolu sur chaque bloc. Assemble ta séance sur-mesure avec une précision d'expert.
                    </p>
                    <div className="flex items-center gap-3 text-sm font-black text-blue-600 group-hover:gap-5 transition-all bg-blue-50 w-fit px-6 py-3 rounded-2xl border border-blue-100">
                      <span>Créer manuellement</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Programmes — coming soon */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-5xl mx-auto mt-6"
              >
                <div className="relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 backdrop-blur-xl border border-indigo-100/80 shadow-lg shadow-indigo-900/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Decorative orb */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-indigo-100 shadow-md flex-shrink-0">
                    <Map className="w-8 h-8 text-indigo-500" />
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-slate-800">Programmes d'entraînement</h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold border border-indigo-200">
                        <Lock className="w-3 h-3" />
                        Bientôt disponible
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Parcours structurés sur plusieurs semaines — générés par IA ou composés manuellement. La fonctionnalité arrive très bientôt.
                    </p>
                  </div>

                  <div className="flex-shrink-0 opacity-40 cursor-not-allowed select-none relative z-10">
                    <div className="flex items-center gap-2 text-sm font-black text-indigo-600 bg-white/80 px-5 py-3 rounded-2xl border border-indigo-100">
                      <span>Explorer</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {mode === 'ai' && (
            <motion.div key="ai-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {aiStep === 'config' && <AIConfigPanel onGenerate={handleAIGenerate} />}
              {aiStep === 'result' && (
                <AIResultPanel
                  blocks={generatedBlocks}
                  onRegenerate={handleRegenerate}
                  onEdit={handleEditFromAI}
                />
              )}
            </motion.div>
          )}

          {mode === 'manual' && (
            <motion.div key="manual-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ManualPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutBuilder;