import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Bell, ChevronLeft, ChevronRight, Check, MapPin, User, ArrowRight, Home, Calendar, Activity, Medal, Trophy } from 'lucide-react';

const typeColors = {
  endurance: { main: 'text-cyan-600', bg: 'bg-cyan-500', dim: 'bg-cyan-500/20', border: 'border-cyan-500/30', emoji: "🏊", label: "Endurance" },
  sprint: { main: 'text-amber-600', bg: 'bg-amber-500', dim: 'bg-amber-500/20', border: 'border-amber-500/30', emoji: "⚡", label: "Sprint" },
  technique: { main: 'text-purple-600', bg: 'bg-purple-500', dim: 'bg-purple-500/20', border: 'border-purple-500/30', emoji: "🎯", label: "Technique" },
  recovery: { main: 'text-emerald-600', bg: 'bg-emerald-500', dim: 'bg-emerald-500/20', border: 'border-emerald-500/30', emoji: "🧘", label: "Récup" },
  other: { main: 'text-rose-600', bg: 'bg-rose-500', dim: 'bg-rose-500/20', border: 'border-rose-500/30', emoji: "🌊", label: "Mixte" },
};

// ─── MOCK DATA ───
const swimmer = {
  name: "Sophie", level: 24, xp: 7420, xpNext: 8500,
  streak: 12, streakRank: 2, title: "La Machine",
  nextBadge: { name: "Courant Marin", icon: "🐬", current: 47.7, target: 50, unit: "km" },
  challenge: { name: "Mois du Papillon", icon: "🦋", current: 6.3, target: 10, unit: "km", color: 'bg-pink-500', text: 'text-pink-600', dim: 'bg-pink-500/20' },
};

const today = { day: 10, dow: 0, month: "Mars" };
const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthDays = ["L", "M", "M", "J", "V", "S", "D"];

function makeWeekData(weekOffset: number) {
  const slots = [
    { dayOffset: 0, type: "endurance", time: "18:00", duration: 90, distance: 3200, location: "Piscine Municipale", group: "Compétition A", coach: "Thomas M.", rpe: 14, feedbackText: "Bonne séance, fatiguée sur la fin", socialReactions: 8 },
    { dayOffset: 2, type: "sprint", time: "18:00", duration: 75, distance: 2800, location: "Piscine Municipale", group: "Compétition A", coach: "Thomas M.", rpe: null },
    { dayOffset: 3, type: "technique", time: "19:30", duration: 60, distance: 2000, location: "Centre Aquatique", group: "Technique", coach: "Marie L.", rpe: 11, feedbackText: "Focus éducatifs, très bien" },
    { dayOffset: 4, type: "endurance", time: "18:00", duration: 90, distance: 3500, location: "Piscine Municipale", group: "Compétition A", coach: "Thomas M.", rpe: null },
  ];
  return slots.map(s => {
    let state;
    if (weekOffset < 0) {
      state = s.dayOffset === 4 ? "absent" : s.dayOffset === 2 ? "feedback_pending" : "feedback_done";
    } else if (weekOffset === 0) {
      state = s.dayOffset === 0 ? "today" : "future";
    } else {
      state = "future";
    }
    return { ...s, state };
  });
}

const monthData = (() => {
  const d = [];
  for (let i = 1; i <= 31; i++) {
    const dow = (i + 5) % 7;
    let types = [];
    if (dow === 1 || dow === 5) types.push("endurance");
    if (dow === 3) types.push("sprint");
    if (dow === 4) types.push("technique");
    const isPast = i < today.day;
    const hasFeedback = isPast && types.length > 0 && Math.random() > 0.15;
    const wasAbsent = isPast && types.length > 0 && !hasFeedback && Math.random() > 0.5;
    d.push({ day: i, dow, types, isPast, isToday: i === today.day, hasFeedback, wasAbsent });
  }
  return d;
})();

// ─── COMPONENTS ───

const Pulse = ({ colorClass = "bg-cyan-500" }) => (
  <span className="relative flex items-center justify-center h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}></span>
    <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}></span>
  </span>
);

const XPMini = ({ current, next, level }: { current: number, next: number, level: number }) => {
  const pct = (current / next) * 100;
  return (
    <div className="flex items-center gap-2 w-full mt-2">
      <span className="text-[10px] font-bold text-slate-500">Niv.{level}</span>
      <div className="flex-1 h-1.5 bg-white/40 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1 }}
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500">Niv.{level + 1}</span>
    </div>
  );
};

const CountdownTimer = () => {
  const [s, setS] = useState(0);
  useEffect(() => { const iv = setInterval(() => setS(x => x + 1), 1000); return () => clearInterval(iv); }, []);
  const total = 3 * 3600 + 42 * 60 - s;
  const h = Math.floor(Math.max(0, total) / 3600);
  const m = Math.floor((Math.max(0, total) % 3600) / 60);
  const sec = Math.max(0, total) % 60;
  
  return (
    <div className="flex items-center gap-2">
      <Pulse colorClass="bg-cyan-500" />
      <span className="text-sm font-black text-cyan-700 tracking-wider font-mono tabular-nums">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
      </span>
      <span className="text-xs text-cyan-700/70 font-medium">avant ta séance</span>
    </div>
  );
};

const TrainingCard = ({ slot }: { slot: any }) => {
  const tc = typeColors[slot.type as keyof typeof typeColors];
  const [expanded, setExpanded] = useState(false);
  
  const isAbsent = slot.state === "absent";
  const isFuture = slot.state === "future";

  const teasers: Record<string, string> = {
    sprint: "Prête à exploser tes chronos ?",
    technique: "Éducatifs et finesse au programme",
    recovery: "Ton corps va te remercier",
    endurance: "Chaque mètre compte vers tes objectifs",
  };

  const getBorderClass = () => {
    if (isAbsent) return "border-slate-200/50 opacity-50 bg-slate-50/50";
    if (slot.state === "today") return "border-cyan-400 bg-white/80 shadow-lg shadow-cyan-900/10";
    if (slot.state === "feedback_pending") return "border-amber-400 bg-white/60 shadow-md shadow-amber-900/5";
    if (slot.state === "feedback_done") return "border-emerald-200 bg-white/60";
    return "border-white/60 bg-white/40";
  };

  return (
    <motion.div 
      whileHover={!isFuture && !isAbsent ? { scale: 1.02 } : {}}
      onClick={() => !isFuture && !isAbsent && setExpanded(!expanded)}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md border ${getBorderClass()} cursor-${isFuture || isAbsent ? 'default' : 'pointer'} transition-all`}
    >
      <div className={`h-1 w-full ${isAbsent ? 'bg-slate-200' : 'bg-gradient-to-r from-transparent via-' + tc.bg.replace('bg-', '') + ' to-transparent opacity-50'}`} />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border ${isAbsent ? 'bg-slate-100 border-slate-200' : tc.dim + ' ' + tc.border}`}>
            {tc.emoji}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-extrabold ${isAbsent ? 'text-slate-400' : 'text-slate-800'}`}>
              {tc.label} — {slot.distance}m
            </div>
            <div className="text-xs font-medium text-slate-500">
              {slot.time} · {slot.duration}min · {slot.group}
            </div>
          </div>
          {slot.state === "future" && <span className="text-slate-300">🔒</span>}
          {slot.state === "absent" && <span className="text-slate-400 text-xs font-bold bg-slate-200/50 px-2 py-1 rounded-md">Absent</span>}
          {slot.state === "feedback_done" && <span className="text-emerald-500 bg-emerald-50 p-1 rounded-full"><Check size={14} /></span>}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-3">
          <MapPin size={12} className="text-slate-400" /> {slot.location}
          <span className="mx-1 opacity-50">•</span>
          <User size={12} className="text-slate-400" /> {slot.coach}
        </div>

        {slot.state === "today" && (
          <div className="mt-3 bg-cyan-50/80 border border-cyan-100 rounded-xl p-3 shadow-inner">
            <CountdownTimer />
          </div>
        )}

        {slot.state === "feedback_pending" && (
          <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center gap-3 shadow-inner animate-pulse">
            <Pulse colorClass="bg-amber-500" />
            <span className="text-xs font-bold text-amber-700">Donne ton feedback</span>
            <ArrowRight size={14} className="ml-auto text-amber-600" />
          </div>
        )}

        {slot.state === "feedback_done" && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm text-xs font-bold ${
                slot.rpe <= 12 ? 'bg-emerald-100 text-emerald-700' : 
                slot.rpe <= 15 ? 'bg-amber-100 text-amber-700' : 
                'bg-pink-100 text-pink-700'
              }`}>
                💪 RPE {slot.rpe}
              </div>
              {slot.socialReactions > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100/50 px-2 py-1 rounded-lg">
                  <span>💦🔥</span> {slot.socialReactions} réactions
                </div>
              )}
            </div>
            <AnimatePresence>
              {expanded && slot.feedbackText && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs italic text-slate-600 bg-white/50 p-2.5 rounded-lg border border-slate-100"
                >
                  "{slot.feedbackText}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {isFuture && (
          <div className="mt-3 text-xs italic text-slate-400 font-medium">
            {teasers[slot.type] || teasers.endurance}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MotivWidget = ({ type }: { type: string }) => {
  if (type === "badge") {
    const b = swimmer.nextBadge;
    const pct = (b.current / b.target) * 100;
    return (
      <div className="bg-cyan-50/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-100 flex items-center gap-4 shadow-sm">
        <span className="text-3xl filter drop-shadow-sm">{b.icon}</span>
        <div className="flex-1">
          <div className="text-xs text-slate-600 font-medium">
            Plus que <span className="font-bold text-cyan-600">{(b.target - b.current).toFixed(1)} {b.unit}</span> pour <span className="font-bold text-slate-800">{b.name}</span>
          </div>
          <div className="h-1.5 bg-white rounded-full mt-2 shadow-inner overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }
  if (type === "streak") {
    return (
      <div className="bg-amber-50/60 backdrop-blur-md rounded-2xl p-4 border border-amber-100 flex items-center gap-3 shadow-sm">
        <span className="text-3xl filter drop-shadow-sm">🔥</span>
        <div className="text-xs text-slate-600 font-medium leading-relaxed">
          <span className="font-black text-amber-600">{swimmer.streak} semaines</span> de streak<br/>tu es <span className="font-bold text-amber-600">{swimmer.streakRank}ème</span> du club !
        </div>
      </div>
    );
  }
  if (type === "challenge") {
    const ch = swimmer.challenge;
    return (
      <div className="bg-pink-50/60 backdrop-blur-md rounded-2xl p-4 border border-pink-100 flex items-center gap-3 shadow-sm">
        <span className="text-3xl filter drop-shadow-sm">{ch.icon}</span>
        <div className="flex-1">
          <div className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-slate-800">{ch.name}</span> — <span className={`font-black ${ch.text}`}>{ch.current}/{ch.target} {ch.unit}</span>
          </div>
          <div className="h-1.5 bg-white rounded-full mt-2 shadow-inner overflow-hidden">
            <div className={`h-full ${ch.color} rounded-full`} style={{ width: `${(ch.current / ch.target) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const WeekView = ({ weekOffset }: { weekOffset: number }) => {
  const slots = useMemo(() => makeWeekData(weekOffset), [weekOffset]);
  const baseDay = today.day + weekOffset * 7;
  const widgets = ["badge", "streak", "challenge"];
  let wi = 0;
  const byDay: Record<number, any[]> = {};
  slots.forEach(s => { if (!byDay[s.dayOffset]) byDay[s.dayOffset] = []; byDay[s.dayOffset].push(s); });

  const items = [];
  for (let d = 0; d < 7; d++) {
    const dayNum = baseDay + d;
    if (dayNum < 1 || dayNum > 31) continue;
    const isToday = weekOffset === 0 && d === 0;
    const hasSlots = byDay[d]?.length > 0;

    items.push(
      <motion.div 
        key={d}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: d * 0.05 }}
      >
        <div className={`flex items-center gap-3 mb-3 ${d > 0 ? 'mt-4' : ''}`}>
          <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shadow-sm border ${
            isToday 
              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white border-transparent shadow-cyan-400/40 shadow-lg' 
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-md'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? 'text-cyan-50' : 'text-slate-400'}`}>{weekDays[d]}</span>
            <span className={`text-base font-black leading-none ${isToday ? 'text-white' : 'text-slate-800'}`}>{dayNum}</span>
          </div>
          {isToday && <span className="text-xs font-black text-cyan-600 bg-cyan-100/50 px-2 py-0.5 rounded-md">Aujourd'hui</span>}
          <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
        </div>
        
        {hasSlots ? (
          <div className="flex flex-col gap-3 pl-2 sm:pl-4 border-l-2 border-slate-100/50 ml-5 sm:ml-5">
            {byDay[d].map((slot, si) => <TrainingCard key={si} slot={slot} />)}
          </div>
        ) : (
          <div className="pl-2 sm:pl-4 border-l-2 border-slate-100/50 ml-5 sm:ml-5">
            <div className="bg-white/30 backdrop-blur-sm border border-dashed border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-400 text-center">
              Repos 😴
            </div>
          </div>
        )}
        
        {hasSlots && wi < widgets.length && d % 2 === 0 && (
          <div className="mt-3 pl-2 sm:pl-4 border-l-2 border-slate-100/50 ml-5 sm:ml-5">
            <MotivWidget type={widgets[wi++]} />
          </div>
        )}
      </motion.div>
    );
  }
  return <div className="flex flex-col gap-2">{items}</div>;
};

const MonthView = () => {
  const startDow = 6;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  monthData.forEach(d => cells.push(d));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {monthDays.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const hasDots = cell.types.length > 0;
          return (
            <div key={i} className={`
              aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer
              transition-all hover:scale-105 border shadow-sm backdrop-blur-md
              ${cell.isToday 
                ? 'bg-gradient-to-br from-cyan-400 to-blue-500 border-transparent shadow-cyan-400/40 text-white' 
                : cell.isPast && hasDots 
                  ? 'bg-white/60 border-white/60 text-slate-700' 
                  : 'bg-white/30 border-white/40 text-slate-500'
              }
            `}>
              <span className={`text-xs ${cell.isToday ? 'font-black' : 'font-bold'} ${cell.wasAbsent ? 'opacity-40' : ''}`}>
                {cell.day}
              </span>
              
              {hasDots && !cell.isToday && (
                <div className="flex gap-0.5 absolute bottom-1.5">
                  {cell.types.map((t: string, ti: number) => {
                    const tc = typeColors[t as keyof typeof typeColors];
                    const bg = cell.isPast ? (cell.hasFeedback ? 'bg-emerald-500' : cell.wasAbsent ? 'bg-slate-300' : 'bg-amber-400') : tc.bg;
                    return (
                      <div key={ti} className={`w-1.5 h-1.5 rounded-full ${bg} ${cell.isPast && cell.wasAbsent ? 'opacity-40' : 'opacity-80'}`} />
                    );
                  })}
                </div>
              )}
              {cell.isPast && cell.hasFeedback && !cell.isToday && (
                <div className="absolute top-1 right-1 text-emerald-500">
                  <Check size={10} strokeWidth={4} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-6 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
        {Object.entries(typeColors).slice(0, 4).map(([k, tc]) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${tc.bg} opacity-80`} />{tc.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />Feedback ✓
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-amber-400" />En attente
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "Séances", value: "12/16", color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Distance", value: "38.4k", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Assiduité", value: "92%", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl p-3 text-center border border-white/60 shadow-sm">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <MotivWidget type="challenge" />
        <MotivWidget type="badge" />
      </div>
    </motion.div>
  );
};

export const SwimmerPlanning: React.FC = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [compact, setCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekLabel = weekOffset === 0 ? "Cette semaine" : weekOffset === -1 ? "Sem. dernière" : weekOffset === 1 ? "Sem. prochaine" : `Sem. du ${today.day + weekOffset * 7}`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fn = () => setCompact(el.scrollTop > 50);
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* ═══ LIVING HEADER ═══ */}
      <div className={`
        bg-white/80 backdrop-blur-xl border-b border-white/80 shadow-sm transition-all duration-300 flex-shrink-0 z-20
        ${compact ? 'py-3 px-4 sm:px-6' : 'py-5 px-4 sm:px-6'}
      `}>
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className={`
              rounded-full bg-gradient-to-br from-cyan-100 to-blue-50 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 font-black text-cyan-600
              transition-all duration-300 ${compact ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}
            `}>
              {swimmer.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className={`font-black text-slate-800 transition-all ${compact ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>
                {compact ? swimmer.name : `Hey ${swimmer.name} 👋`}
              </div>
              {!compact && <div className="text-xs sm:text-sm font-bold text-amber-500 mt-0.5 uppercase tracking-wider">⚡ {swimmer.title}</div>}
            </div>
            
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <Pulse colorClass="bg-amber-500" />
              <span className="text-sm font-black text-amber-600">{swimmer.streak}</span>
              <span className="text-xs">🔥</span>
            </div>
            
            <div className="relative w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
            </div>
          </div>

          {!compact && (
            <div className="mb-5 bg-white/60 p-3 rounded-2xl border border-slate-200 shadow-inner">
              <XPMini current={swimmer.xp} next={swimmer.xpNext} level={swimmer.level} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60">
              {[{ id: "week", l: "Sem." }, { id: "month", l: "Mois" }].map(v => (
                <button 
                  key={v.id} 
                  onClick={() => setView(v.id as any)}
                  className={`
                    px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all
                    ${view === v.id ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}
                  `}
                >
                  {v.l}
                </button>
              ))}
            </div>
            
            {view === "week" && (
              <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2">
                <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setWeekOffset(0)} className={`
                  px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs sm:text-sm border shadow-sm transition-colors
                  ${weekOffset === 0 ? 'bg-cyan-500 text-white border-cyan-400 shadow-cyan-500/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                `}>
                  {weekOffset === 0 ? "Auj." : weekLabel}
                </button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {view === "month" && (
              <div className="flex-1 text-right text-sm sm:text-base font-black text-slate-800 uppercase tracking-widest">
                {today.month} 2026
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12 w-full"
      >
        <div className="max-w-4xl mx-auto w-full">
          {view === "week" && <WeekView key={weekOffset} weekOffset={weekOffset} />}
          {view === "month" && <MonthView />}
        </div>
      </div>

    </div>
  );
};
