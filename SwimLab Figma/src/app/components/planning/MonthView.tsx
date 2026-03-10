import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Droplets } from 'lucide-react';
import { COLORS, TYPE_CONFIG } from './constants';
import { GlowBadge } from './GlowBadge';

// Mock data: day number → sessions
const SESSION_DATA: Record<number, { type: string; title: string; group: string; time: string; distance?: string }[]> = {
  6:  [{ type: 'endurance', title: 'Endurance 3000m', group: 'Compétition', time: '18h00', distance: '3000m' }],
  7:  [{ type: 'sprint', title: 'Sprint Séries', group: 'Compétition', time: '18h00', distance: '2500m' }],
  10: [{ type: 'technique', title: 'Éducatifs', group: 'Loisir', time: '19h30', distance: '1800m' }],
  13: [{ type: 'endurance', title: 'Fondo 2500m', group: 'Avenir', time: '18h00', distance: '2500m' }, { type: 'recovery', title: 'Récup', group: 'Masters', time: '19h30' }],
  14: [{ type: 'sprint', title: 'Vitesse Max', group: 'Compétition', time: '09h00' }],
  17: [{ type: 'technique', title: 'Technique Dos', group: 'Loisir', time: '18h00', distance: '2000m' }],
  20: [{ type: 'endurance', title: 'Endurance 4000m', group: 'Compétition', time: '18h00', distance: '4000m' }],
  21: [{ type: 'recovery', title: 'Récup Active', group: 'Masters', time: '17h30', distance: '1500m' }],
  24: [{ type: 'sprint', title: 'Compétition', group: 'Compétition', time: '09h00', distance: '4000m' }],
  27: [{ type: 'endurance', title: 'Endurance 3000m', group: 'Compétition', time: '18h00', distance: '3000m' }, { type: 'technique', title: 'Papillon', group: 'Loisir', time: '19h30' }],
  28: [{ type: 'sprint', title: 'Sprint Séries', group: 'Compétition', time: '18h00', distance: '2500m' }],
};

const WEEKDAYS_FULL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
// January 2026 starts on Thursday (index 3 in Mon-based week)
const MONTH_START_OFFSET = 3;

interface MonthViewProps {
  desktop?: boolean;
}

export function MonthView({ desktop = false }: MonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(28);
  const totalCells = MONTH_START_OFFSET + 31;

  const selectedSessions = selectedDay ? SESSION_DATA[selectedDay] ?? [] : [];

  const CalendarGrid = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden border"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderColor: COLORS.cardBorder,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
      }}
    >
      {/* Weekday headers */}
      <div
        className="grid grid-cols-7 border-b"
        style={{ borderColor: COLORS.cardBorder }}
      >
        {WEEKDAYS_FULL.map((d, i) => (
          <div
            key={d}
            className="py-3 text-center text-[11px] font-bold uppercase tracking-wider"
            style={{ color: i >= 5 ? COLORS.turquoise : COLORS.textMuted }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - MONTH_START_OFFSET + 1;
          const isValid = dayNum >= 1 && dayNum <= 31;
          const isToday = dayNum === 28;
          const isSelected = dayNum === selectedDay;
          const sessions = SESSION_DATA[dayNum] ?? [];
          const hasSessions = sessions.length > 0;
          const dotColors = sessions.slice(0, 3).map((s) => TYPE_CONFIG[s.type]?.color ?? COLORS.textMuted);
          const isWeekend = idx % 7 >= 5;

          return (
            <motion.div
              key={idx}
              initial={isValid ? { opacity: 0, scale: 0.85 } : {}}
              animate={isValid ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: isValid ? (dayNum - 1) * 0.008 : 0 }}
              onClick={() => isValid && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
              className={`relative flex flex-col items-center border-b border-r ${isValid ? 'cursor-pointer' : ''}`}
              style={{
                borderColor: 'rgba(0,0,0,0.05)',
                paddingTop: desktop ? '10px' : '8px',
                paddingBottom: desktop ? '10px' : '6px',
                minHeight: desktop ? '72px' : '52px',
                backgroundColor: isSelected
                  ? `${COLORS.turquoise}12`
                  : isToday
                  ? `${COLORS.turquoise}08`
                  : isWeekend && isValid
                  ? 'rgba(241,245,249,0.60)'
                  : 'transparent',
              }}
            >
              {isValid && (
                <>
                  {/* Today / selected ring */}
                  {(isToday || isSelected) && (
                    <motion.div
                      layoutId="month-day-ring"
                      className="absolute inset-1 rounded-xl pointer-events-none"
                      style={{
                        border: `1px solid ${COLORS.turquoise}${isSelected ? '55' : '35'}`,
                        boxShadow: isSelected ? `0 0 14px ${COLORS.turquoise}20` : 'none',
                      }}
                    />
                  )}

                  {/* Day number */}
                  <span
                    className="text-xs font-semibold relative z-10"
                    style={{
                      color: isToday || isSelected
                        ? COLORS.turquoise
                        : isWeekend
                        ? COLORS.textMuted
                        : COLORS.textPrimary,
                      fontWeight: isToday ? 700 : 500,
                    }}
                  >
                    {dayNum}
                  </span>

                  {/* Dot indicators */}
                  {hasSessions && (
                    <div className="flex gap-[3px] mt-1.5 relative z-10">
                      {dotColors.map((color, di) => (
                        <div
                          key={di}
                          className="rounded-full"
                          style={{
                            width: desktop ? '6px' : '5px',
                            height: desktop ? '6px' : '5px',
                            backgroundColor: color,
                            boxShadow: `0 0 4px ${color}70`,
                          }}
                        />
                      ))}
                      {sessions.length > 3 && (
                        <div
                          className="rounded-full"
                          style={{ width: '5px', height: '5px', backgroundColor: COLORS.textMuted }}
                        />
                      )}
                    </div>
                  )}

                  {/* Session count on desktop */}
                  {desktop && hasSessions && (
                    <span
                      className="text-[9px] mt-1 font-medium"
                      style={{ color: COLORS.textMuted }}
                    >
                      {sessions.length} séance{sessions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // ── Desktop layout ───────────────────────────────────────────────────────────
  if (desktop) {
    return (
      <div className="p-6 flex gap-6 h-full min-h-[calc(100vh-130px)]">
        {/* Calendar - takes most of the space */}
        <div className="flex-1 min-w-0">
          {/* Month stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Séances planifiées', value: '18', color: COLORS.turquoise },
              { label: 'Km totaux',          value: '54', color: COLORS.yellow   },
              { label: 'Groupes actifs',     value: '4',  color: COLORS.purple   },
              { label: 'Taux présence',      value: '91%', color: COLORS.green   },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="rounded-xl p-4 border flex flex-col gap-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.55)',
                  borderColor: `${stat.color}28`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: `0 2px 12px rgba(0,0,0,0.04)`,
                }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: stat.color, textShadow: `0 0 12px ${stat.color}40` }}
                >
                  {stat.value}
                </span>
                <span className="text-[11px]" style={{ color: COLORS.textMuted }}>
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

          <CalendarGrid />
        </div>

        {/* Sidebar — selected day detail */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.60)',
                  borderColor: `${COLORS.turquoise}30`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* Day header */}
                <div
                  className="p-4 border-b"
                  style={{
                    borderColor: COLORS.cardBorder,
                    background: `linear-gradient(135deg, ${COLORS.turquoise}12, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.turquoise }}>
                        Sélectionné
                      </div>
                      <div className="text-2xl font-bold mt-0.5" style={{ color: COLORS.textPrimary }}>
                        {selectedDay} Janvier
                      </div>
                    </div>
                    {selectedDay === 28 && (
                      <GlowBadge color={COLORS.turquoise}>Aujourd'hui</GlowBadge>
                    )}
                  </div>
                </div>

                {/* Sessions list */}
                <div className="p-3 flex flex-col gap-2.5">
                  {selectedSessions.length > 0 ? (
                    selectedSessions.map((session, i) => {
                      const config = TYPE_CONFIG[session.type] ?? TYPE_CONFIG.empty;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="rounded-xl p-3 border cursor-pointer"
                          style={{
                            backgroundColor: `${config.color}0D`,
                            borderColor: `${config.color}28`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[11px] mb-1" style={{ color: COLORS.textMuted }}>
                                {session.time}
                              </div>
                              <div className="text-sm font-bold flex items-center gap-1" style={{ color: COLORS.textPrimary }}>
                                <span>{config.icon}</span>
                                {session.title}
                              </div>
                              <div className="text-[11px] mt-1 flex items-center gap-1.5" style={{ color: COLORS.textLight }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                                {session.group}
                              </div>
                            </div>
                            {session.distance && (
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: config.color }}>
                                {session.distance}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-2">
                      <Droplets size={22} style={{ color: `${COLORS.textMuted}70` }} />
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>
                        Aucune séance
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border p-6 flex flex-col items-center justify-center gap-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.40)',
                  borderColor: COLORS.cardBorder,
                  borderStyle: 'dashed',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Droplets size={28} style={{ color: `${COLORS.textMuted}70` }} />
                <p className="text-xs text-center" style={{ color: COLORS.textMuted }}>
                  Sélectionnez un jour pour voir les séances
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming sessions summary */}
          <div
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.55)',
              borderColor: COLORS.cardBorder,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.textMuted }}>
              Prochaines séances
            </div>
            <div className="flex flex-col gap-2">
              {[
                { day: 28, type: 'sprint',    label: 'Sprint Séries', time: '18h00' },
                { day: 31, type: 'recovery',  label: 'Récup Active',  time: '17h30' },
                { day: 1,  type: 'sprint',    label: 'Compétition',   time: '09h00' },
              ].map((item, i) => {
                const color = TYPE_CONFIG[item.type]?.color ?? COLORS.textMuted;
                const icon  = TYPE_CONFIG[item.type]?.icon  ?? '📦';
                return (
                  <motion.div
                    key={i}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-colors hover:bg-white/60"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: COLORS.textPrimary }}>{item.label}</div>
                      <div className="text-[10px]" style={{ color: COLORS.textMuted }}>{item.time} · {item.day} Jan</div>
                    </div>
                    <ChevronRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: COLORS.textMuted }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile layout ────────────────────────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col gap-4">
      <CalendarGrid />

      {/* Selected day sessions */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.60)',
                borderColor: `${COLORS.turquoise}30`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{
                  borderColor: COLORS.cardBorder,
                  background: `linear-gradient(90deg, ${COLORS.turquoise}12, transparent)`,
                }}
              >
                <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  {selectedDay} Janvier
                </span>
                {selectedDay === 28 && (
                  <GlowBadge color={COLORS.turquoise}>Aujourd'hui</GlowBadge>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                {selectedSessions.length > 0 ? (
                  selectedSessions.map((session, i) => {
                    const config = TYPE_CONFIG[session.type] ?? TYPE_CONFIG.empty;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-xl p-3 border flex items-center justify-between"
                        style={{
                          backgroundColor: `${config.color}0D`,
                          borderColor: `${config.color}28`,
                        }}
                      >
                        <div>
                          <div className="text-[10px] mb-0.5" style={{ color: COLORS.textMuted }}>{session.time}</div>
                          <div className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{config.icon} {session.title}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: COLORS.textLight }}>{session.group}</div>
                        </div>
                        {session.distance && (
                          <span className="text-sm font-bold" style={{ color: config.color }}>{session.distance}</span>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <Droplets size={20} style={{ color: `${COLORS.textMuted}70` }} />
                    <span className="text-xs" style={{ color: COLORS.textMuted }}>Aucune séance</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs font-medium py-4"
          style={{ color: COLORS.textMuted }}
        >
          Appuyez sur un jour pour voir les séances
        </motion.div>
      )}
    </div>
  );
}
