import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router';
import {
  Droplets, BarChart2, Home, Users, Zap, TrendingUp,
  Calendar, ChevronLeft, Settings, Waves, Activity, Clock
} from 'lucide-react';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { FAB } from './FAB';
import { COLORS, GROUPS } from '../../../constants/colors';



// ── Desktop Sidebar ────────────────────────────────────────────────────────────
function DesktopSidebar({
  activeFilters,
  onFilterChange,
}: {
  activeFilters: string[];
  onFilterChange: (f: string[]) => void;
}) {
  const toggleFilter = (id: string) => {
    if (activeFilters.length === 0) onFilterChange([id]);
    else if (activeFilters.includes(id))
      onFilterChange(activeFilters.filter((f) => f !== id));
    else onFilterChange([...activeFilters, id]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters (Groupes) */}
      <div className="p-3 border-b" style={{ borderColor: COLORS.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            Groupes
          </div>
          {activeFilters.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onFilterChange([])}
              className="text-[10px] font-semibold transition-colors hover:opacity-80"
              style={{ color: COLORS.turquoise }}
            >
              Tous
            </motion.button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {GROUPS.map((g) => {
            const isActive =
              activeFilters.length === 0 || activeFilters.includes(g.id);
            return (
              <motion.button
                key={g.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleFilter(g.id)}
                className="flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium transition-all text-left border"
                style={{
                  backgroundColor: isActive ? `${g.color}12` : 'transparent',
                  borderColor: isActive ? `${g.color}25` : 'transparent',
                  color: isActive ? COLORS.textPrimary : COLORS.textMuted,
                  opacity: isActive ? 1 : 0.55,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: g.color,
                    boxShadow: isActive ? `0 0 8px ${g.color}80` : 'none',
                  }}
                />
                <span className="flex-1 truncate">{g.name}</span>
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: COLORS.textMuted }}
                >
                  {g.id === 'comp' ? '5' : g.id === 'loisir' ? '2' : '3'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
        <div
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: COLORS.textMuted }}
        >
          Stats
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {[
            { label: 'Séances', value: '8', icon: Zap, color: COLORS.turquoise },
            {
              label: 'Km total',
              value: '24.5',
              icon: TrendingUp,
              color: COLORS.yellow,
            },
            {
              label: 'Participation',
              value: '85%',
              icon: Users,
              color: COLORS.pink,
            },
            {
              label: 'RPE Moyen',
              value: '6.8',
              icon: Activity,
              color: COLORS.orange || '#F97316',
            },
            {
              label: 'Temps (eau)',
              value: '9h30',
              icon: Clock,
              color: COLORS.purple,
            },
            {
              label: 'Charge TRIMP',
              value: '450',
              icon: BarChart2,
              color: COLORS.coral,
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ x: 2 }}
              className="rounded-xl p-2.5 border flex items-center gap-3"
              style={{
                backgroundColor: `${COLORS.mediumBlue}50`,
                borderColor: COLORS.cardBorder,
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <div
                  className="font-bold text-sm leading-tight"
                  style={{ color: COLORS.textPrimary }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] break-words leading-tight" style={{ color: COLORS.textMuted }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings button at bottom - REMOVED */}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function DreamPlanning() {
  const [activeView, setActiveView] = useState<'week' | 'month'>('week');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white" style={{ color: COLORS.textPrimary }}>
        
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">

          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />
          
          {/* Animated Orbs */}
          <motion.div 
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div
          className="md:hidden relative z-10 max-w-md mx-auto h-screen flex flex-col overflow-hidden bg-white/40 backdrop-blur-2xl"
        >
          <Header activeView={activeView} onViewChange={setActiveView} />

          <AnimatePresence>
            {activeView === 'week' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <FilterBar
                  activeFilters={activeFilters}
                  onFilterChange={setActiveFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: activeView === 'week' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeView === 'week' ? 20 : -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {activeView === 'week' ? (
                  <WeekView activeFilters={activeFilters} />
                ) : (
                  <MonthView />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile FAB */}
          <div className="absolute bottom-6 right-6 z-50">
            <FAB />
          </div>
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:flex relative z-10 h-screen w-full">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-32 lg:w-36 flex-shrink-0 h-full overflow-y-auto no-scrollbar border-r border-white/80 bg-white/40 backdrop-blur-xl"
          >
            <DesktopSidebar
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />
          </motion.aside>

          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header activeView={activeView} onViewChange={setActiveView} desktop />
            <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeView === 'week' ? (
                    <WeekView activeFilters={activeFilters} desktop />
                  ) : (
                    <MonthView desktop />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Desktop FAB */}
          <div className="fixed bottom-8 right-8 z-50">
            <FAB />
          </div>
        </div>
      </div>
    </>
  );
}