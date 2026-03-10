import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Plus, MapPin, Clock } from 'lucide-react';
import { TYPE_CONFIG, COLORS } from './constants';
import { GlowBadge } from './GlowBadge';

interface SlotProps {
  id: number;
  type: string;
  title: string;
  group: string;
  time: string;
  distance?: string;
  feedbackRate?: number;
  location?: string;
  status?: string;
  empty?: boolean;
}

export function SlotCard({
  slot,
  compact = false,
  onClick,
  onEmargeClick,
}: {
  slot: SlotProps;
  compact?: boolean;
  onClick?: () => void;
  onEmargeClick?: (e: React.MouseEvent) => void;
}) {
  const config = TYPE_CONFIG[slot.type] || TYPE_CONFIG.empty;

  // ── Mock avatars for feedback ──
  const mockAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64"
  ];

  // ── Empty slot ───────────────────────────────────────────────────────────────
  if (slot.empty) {
    return (
      <motion.div
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.60)' }}
        whileTap={{ scale: 0.98 }}
        className="rounded-2xl p-4 relative overflow-hidden flex justify-between items-center cursor-pointer border transition-all group"
        style={{
          backgroundColor: 'rgba(255,255,255,0.35)',
          borderColor: 'rgba(0,0,0,0.08)',
          borderStyle: 'dashed',
        }}
      >
        <div>
          <div className="text-[11px] font-medium mb-0.5" style={{ color: COLORS.textMuted }}>
            {slot.time}
          </div>
          <div className="text-sm font-semibold" style={{ color: COLORS.textLight }}>
            Créneau vide
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl border transition-all"
          style={{
            color: COLORS.turquoise,
            backgroundColor: `${COLORS.turquoise}12`,
            borderColor: `${COLORS.turquoise}35`,
          }}
        >
          <Plus size={13} />
          Assigner
        </motion.div>
      </motion.div>
    );
  }

  // ── Compact variant (used in desktop grid columns) ───────────────────────────
  if (compact) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl p-3 relative overflow-hidden backdrop-blur-md cursor-pointer border transition-all group"
        style={{
          backgroundColor: 'rgba(255,255,255,0.60)',
          borderColor: `${config.color}30`,
          boxShadow: `0 2px 10px rgba(0,0,0,0.05)`,
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
          style={{
            background: `linear-gradient(180deg, ${config.color}, ${config.color}40)`,
          }}
        />
        <div className="pl-1">
          <div
            className="text-[10px] font-medium mb-1 flex items-center gap-1"
            style={{ color: COLORS.textMuted }}
          >
            <Clock size={10} />
            {slot.time}
          </div>
          <div className="text-[12px] font-bold mb-1 leading-tight" style={{ color: COLORS.textPrimary }}>
            {config.icon} {slot.title}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div
              className="text-[11px] flex items-center gap-1"
              style={{ color: COLORS.textLight }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              {slot.group}
            </div>
            {slot.distance && (
              <span
                className="text-[11px] font-bold"
                style={{ color: config.color }}
              >
                {slot.distance}
              </span>
            )}
          </div>
          {slot.status === 'emarge' && (
            <div className="mt-2" onClick={onEmargeClick}>
              <GlowBadge color={COLORS.coral} pulse>
                À émarger
              </GlowBadge>
            </div>
          )}
          {slot.feedbackRate !== undefined && (
            <div className="mt-2">
              <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${slot.feedbackRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: slot.feedbackRate > 70 ? COLORS.green : COLORS.yellow,
                  }}
                />
              </div>
              <div className="flex items-center">
                <div className="flex -space-x-1.5">
                  {mockAvatars.slice(0, Math.min(3, Math.round((slot.feedbackRate / 100) * 15))).map((avatar, idx) => (
                    <div key={idx} className="w-4 h-4 rounded-full border border-white overflow-hidden shadow-sm">
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {Math.round((slot.feedbackRate / 100) * 15) > 3 && (
                  <div className="w-4 h-4 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7px] font-bold text-slate-500 shadow-sm -ml-1 relative z-10">
                    +{Math.round((slot.feedbackRate / 100) * 15) - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Full variant (mobile / week list) ────────────────────────────────────────
  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        scale: 1.01,
        backgroundColor: 'rgba(255,255,255,0.75)',
        y: -1,
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer border transition-all"
      style={{
        backgroundColor: COLORS.cardBg,
        borderColor: `${config.color}28`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px ${config.color}12`,
      }}
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${config.color}08, transparent 60%)`,
        }}
      />

      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-[3px]"
        style={{
          background: `linear-gradient(180deg, ${config.color}, ${config.color}35)`,
          boxShadow: `2px 0 10px ${config.color}30`,
        }}
      />

      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-3">
          <div
            className="text-[11px] font-medium mb-1 flex items-center gap-2"
            style={{ color: COLORS.textMuted }}
          >
            <span>{slot.time}</span>
            {slot.location && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} />
                {slot.location}
              </span>
            )}
          </div>
          <div className="text-[14px] font-bold mb-1.5 flex items-center gap-1.5" style={{ color: COLORS.textPrimary }}>
            <span>{config.icon}</span>
            <span className="truncate">{slot.title}</span>
          </div>
          <div
            className="text-[12px] flex items-center gap-1.5"
            style={{ color: COLORS.textLight }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: config.color, boxShadow: `0 0 5px ${config.color}` }}
            />
            {slot.group}
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
          {slot.distance && (
            <div
              className="text-[13px] font-bold tracking-tight"
              style={{ color: config.color, textShadow: `0 0 10px ${config.color}40` }}
            >
              {slot.distance}
            </div>
          )}
          {slot.feedbackRate !== undefined && (
            <GlowBadge
              color={slot.feedbackRate > 70 ? COLORS.green : COLORS.yellow}
            >
              {slot.feedbackRate}% feedback
            </GlowBadge>
          )}
          {slot.status === 'emarge' && (
            <div onClick={onEmargeClick}>
              <GlowBadge color={COLORS.coral} pulse>
                À émarger
              </GlowBadge>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for feedback */}
      {slot.feedbackRate !== undefined && (
        <div
          className="mt-3.5 pt-3 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${slot.feedbackRate}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    slot.feedbackRate > 70 ? COLORS.green : COLORS.yellow,
                  boxShadow: `0 0 6px ${slot.feedbackRate > 70 ? COLORS.green : COLORS.yellow}50`,
                }}
              />
            </div>
            <div
              className="text-[11px] flex items-center gap-1.5 font-medium whitespace-nowrap"
              style={{ color: COLORS.textLight }}
            >
              {Math.round((slot.feedbackRate / 100) * 15)}/15
              {slot.feedbackRate < 70 && (
                <AlertCircle size={11} style={{ color: COLORS.yellow }} />
              )}
            </div>
          </div>
          
          {/* Swimmer Avatars (Feedback given) */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {mockAvatars.slice(0, Math.min(4, Math.round((slot.feedbackRate / 100) * 15))).map((avatar, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm"
                >
                  <img src={avatar} alt="Swimmer" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
            {Math.round((slot.feedbackRate / 100) * 15) > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm -ml-2 relative z-10">
                +{Math.round((slot.feedbackRate / 100) * 15) - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
