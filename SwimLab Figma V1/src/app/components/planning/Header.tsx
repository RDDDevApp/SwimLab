import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Droplets } from 'lucide-react';
import { COLORS } from '../../../constants/colors';

interface HeaderProps {
  activeView: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  desktop?: boolean;
}

export function Header({ activeView, onViewChange, desktop = false }: HeaderProps) {
  // ── Desktop header ──────────────────────────────────────────────────────────
  if (desktop) {
    return (
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          borderColor: COLORS.cardBorder,
        }}
      >
        {/* Left — Title */}
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: '1.25rem', color: COLORS.textPrimary }}
            >
              Planning
            </h1>
            <p className="text-[12px]" style={{ color: COLORS.textMuted }}>
              Saison 2025–2026
            </p>
          </div>
        </div>

        {/* Center — Week navigation */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-white/80"
            style={{ borderColor: COLORS.cardBorder, color: COLORS.textMuted }}
          >
            <ChevronLeft size={16} />
          </motion.button>

          <div
            className="px-5 py-2 rounded-xl border flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.60)',
              borderColor: COLORS.cardBorder,
            }}
          >
            <motion.span
              key={activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold whitespace-nowrap"
              style={{ color: COLORS.textPrimary }}
            >
              {activeView === 'week' ? '27 Jan — 2 Fév 2026' : 'Janvier 2026'}
            </motion.span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-white/80"
            style={{ borderColor: COLORS.cardBorder, color: COLORS.textMuted }}
          >
            <ChevronRight size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="text-[12px] font-semibold px-3.5 py-2 rounded-xl border transition-all"
            style={{
              color: COLORS.turquoise,
              backgroundColor: `${COLORS.turquoise}15`,
              borderColor: `${COLORS.turquoise}35`,
            }}
          >
            Aujourd'hui
          </motion.button>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div
            className="flex gap-1 rounded-xl p-1 relative"
            style={{ backgroundColor: 'rgba(255,255,255,0.50)', border: `1px solid ${COLORS.cardBorder}` }}
          >
            {(['week', 'month'] as const).map((v) => {
              const isActive = activeView === v;
              return (
                <button
                  key={v}
                  onClick={() => onViewChange(v)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10`}
                  style={{ color: isActive ? COLORS.textPrimary : COLORS.textMuted }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-view-highlight"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backgroundColor: `${COLORS.turquoise}20`,
                        boxShadow: `0 0 14px ${COLORS.turquoise}25`,
                        border: `1px solid ${COLORS.turquoise}35`,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {v === 'week' ? 'Semaine' : 'Mois'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors hover:bg-white/80"
            style={{ borderColor: COLORS.cardBorder, color: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.50)' }}
          >
            <Search size={15} />
          </motion.button>

          {/* Filters */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors hover:bg-white/80"
            style={{ borderColor: COLORS.cardBorder, color: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.50)' }}
          >
            <SlidersHorizontal size={15} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Mobile header ───────────────────────────────────────────────────────────
  return (
    <div
      className="sticky top-0 z-50 pt-10 pb-3 px-4 border-b"
      style={{
        backgroundColor: `rgba(255, 255, 255, 0.70)`,
        backdropFilter: 'blur(20px)',
        borderColor: COLORS.cardBorder,
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${COLORS.turquoise}30, ${COLORS.turquoise}10)`,
              border: `1px solid ${COLORS.turquoise}40`,
            }}
          >
            <Droplets size={14} style={{ color: COLORS.turquoise }} />
          </div>
          <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>Planning</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-colors"
          style={{
            color: COLORS.turquoise,
            backgroundColor: `${COLORS.turquoise}15`,
            borderColor: `${COLORS.turquoise}35`,
          }}
        >
          Aujourd'hui
        </motion.button>
      </div>

      {/* Bottom row */}
      <div
        className="flex items-center justify-between rounded-2xl p-2 border"
        style={{
          backgroundColor: `rgba(255, 255, 255, 0.55)`,
          borderColor: COLORS.cardBorder,
        }}
      >
        {/* Nav arrows + date */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors"
            style={{ color: COLORS.textMuted }}
          >
            <ChevronLeft size={15} />
          </motion.button>

          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-center min-w-[130px]"
            style={{ color: COLORS.textPrimary }}
          >
            {activeView === 'week' ? '27 Jan — 2 Fév' : 'Janvier 2026'}
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors"
            style={{ color: COLORS.textMuted }}
          >
            <ChevronRight size={15} />
          </motion.button>
        </div>

        {/* View switcher */}
        <div className="flex gap-0.5 rounded-xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.40)' }}>
          {(['week', 'month'] as const).map((v) => {
            const isActive = activeView === v;
            return (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className="relative px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors z-10"
                style={{ color: isActive ? COLORS.textPrimary : COLORS.textMuted }}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-view-highlight"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: `${COLORS.turquoise}22`,
                      boxShadow: `0 0 12px ${COLORS.turquoise}25`,
                      border: `1px solid ${COLORS.turquoise}35`,
                    }}
                  />
                )}
                <span className="relative z-10">
                  {v === 'week' ? 'Sem' : 'Mois'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
