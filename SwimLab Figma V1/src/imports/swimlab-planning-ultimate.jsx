import { useState, useEffect, useRef } from "react";

// ─── TOKENS ───
const C = {
  bg: "#050D17", bg2: "#0A1628", card: "#0E1E38", cardHover: "#122848",
  surface: "#162D50", elevated: "#1C3660",
  t: "#00D4D4", tDim: "rgba(0,212,212,0.12)", tGlow: "rgba(0,212,212,0.25)",
  y: "#FFB800", yDim: "rgba(255,184,0,0.12)",
  pk: "#FF3B8F", pkDim: "rgba(255,59,143,0.12)",
  pr: "#8B5CF6", prDim: "rgba(139,92,246,0.12)",
  g: "#22C55E", gDim: "rgba(34,197,94,0.12)",
  coral: "#FF6B6B", coralDim: "rgba(255,107,107,0.12)",
  w: "#F0F6FF", w80: "rgba(240,246,255,0.8)", w60: "rgba(240,246,255,0.6)",
  w40: "rgba(240,246,255,0.4)", w20: "rgba(240,246,255,0.2)",
  w10: "rgba(240,246,255,0.1)", w05: "rgba(240,246,255,0.05)",
  w02: "rgba(240,246,255,0.02)",
};

const typeColors = {
  endurance: { main: C.t, dim: C.tDim, emoji: "🏊", label: "Endurance" },
  sprint: { main: C.y, dim: C.yDim, emoji: "⚡", label: "Sprint" },
  technique: { main: C.pr, dim: C.prDim, emoji: "🎯", label: "Technique" },
  recovery: { main: C.g, dim: C.gDim, emoji: "🧘", label: "Récup" },
  other: { main: C.coral, dim: C.coralDim, emoji: "🌊", label: "Mixte" },
};

// ─── MOCK ───
const swimmer = {
  name: "Sophie", level: 24, xp: 7420, xpNext: 8500,
  streak: 12, streakRank: 2, title: "La Machine",
  nextBadge: { name: "Courant Marin", icon: "🐬", current: 47.7, target: 50, unit: "km" },
  challenge: { name: "Mois du Papillon", icon: "🦋", current: 6.3, target: 10, unit: "km", color: C.pk },
};

const today = { day: 10, dow: 0, month: "Mars" };
const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthDays = ["L", "M", "M", "J", "V", "S", "D"];

function makeWeekData(weekOffset) {
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

function Pulse({ color, size = 8, speed = "2s" }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: size, height: size, borderRadius: "50%", background: color, position: "relative", zIndex: 1 }} />
      <span style={{
        position: "absolute", width: size * 2.5, height: size * 2.5, borderRadius: "50%",
        background: color, opacity: 0, zIndex: 0, animation: `pulse ${speed} ease-in-out infinite`,
      }} />
    </span>
  );
}

function XPMini({ current, next, level }) {
  const pct = (current / next) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <span style={{ fontSize: 10, color: C.w40, fontWeight: 700 }}>Niv.{level}</span>
      <div style={{ flex: 1, height: 4, background: C.w05, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.t}, ${C.y})`, transition: "width 1.2s ease" }} />
      </div>
      <span style={{ fontSize: 10, color: C.w40, fontWeight: 700 }}>Niv.{level + 1}</span>
    </div>
  );
}

function CountdownTimer() {
  const [s, setS] = useState(0);
  useEffect(() => { const iv = setInterval(() => setS(x => x + 1), 1000); return () => clearInterval(iv); }, []);
  const total = 3 * 3600 + 42 * 60 - s;
  const h = Math.floor(Math.max(0, total) / 3600);
  const m = Math.floor((Math.max(0, total) % 3600) / 60);
  const sec = Math.max(0, total) % 60;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Pulse color={C.t} size={6} speed="1.5s" />
      <span style={{ fontSize: 14, fontWeight: 800, color: C.t, fontVariantNumeric: "tabular-nums", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 11, color: C.w40 }}>avant ta séance</span>
    </div>
  );
}

function TrainingCard({ slot }) {
  const tc = typeColors[slot.type];
  const [expanded, setExpanded] = useState(false);
  const cfgs = {
    today: { border: C.t, glow: true, badge: null },
    future: { border: C.w10, glow: false, badge: "🔒" },
    feedback_done: { border: `${C.g}40`, glow: false, badge: "✅" },
    feedback_pending: { border: `${C.y}50`, glow: false, badge: null },
    absent: { border: C.w05, glow: false, badge: "✖" },
  };
  const cfg = cfgs[slot.state];
  const isAbsent = slot.state === "absent";
  const isFuture = slot.state === "future";

  const teasers = {
    sprint: "Prête à exploser tes chronos ?",
    technique: "Éducatifs et finesse au programme",
    recovery: "Ton corps va te remercier",
    endurance: "Chaque mètre compte vers tes objectifs",
  };

  return (
    <div onClick={() => !isFuture && setExpanded(!expanded)} style={{
      background: isAbsent ? C.w02 : C.card, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${cfg.border}`,
      boxShadow: cfg.glow ? `0 0 24px ${C.t}12, inset 0 1px 0 ${C.t}08` : "none",
      opacity: isAbsent ? 0.4 : 1, cursor: isFuture ? "default" : "pointer",
      transition: "all 0.3s ease",
    }}>
      <div style={{ height: 3, background: isAbsent ? C.w10 : `linear-gradient(90deg, ${tc.main}, ${tc.main}60)` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: isAbsent ? C.w05 : tc.dim,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, border: `1px solid ${isAbsent ? C.w10 : tc.main + "20"}`,
          }}>{tc.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: isAbsent ? C.w40 : C.w }}>{tc.label} — {slot.distance}m</div>
            <div style={{ fontSize: 11, color: C.w40 }}>{slot.time} · {slot.duration}min · {slot.group}</div>
          </div>
          {cfg.badge && <span style={{ fontSize: cfg.badge === "✖" ? 12 : 14, opacity: cfg.badge === "🔒" ? 0.35 : 1 }}>{cfg.badge}</span>}
        </div>

        <div style={{ fontSize: 11, color: C.w40, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10 }}>📍</span>{slot.location}<span style={{ margin: "0 3px" }}>·</span><span style={{ fontSize: 10 }}>👤</span>{slot.coach}
        </div>

        {slot.state === "today" && (
          <div style={{
            background: `linear-gradient(135deg, ${C.tDim}, ${C.t}06)`, borderRadius: 12,
            padding: "10px 14px", marginTop: 12, border: `1px solid ${C.t}18`,
          }}>
            <CountdownTimer />
          </div>
        )}

        {slot.state === "feedback_pending" && (
          <div style={{
            background: `linear-gradient(135deg, ${C.yDim}, ${C.y}05)`, borderRadius: 12,
            padding: "10px 14px", marginTop: 12, border: `1px solid ${C.y}20`,
            display: "flex", alignItems: "center", gap: 8, animation: "softPulse 3s ease-in-out infinite",
          }}>
            <Pulse color={C.y} size={7} speed="2s" />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.y }}>Donne ton feedback</span>
            <span style={{ marginLeft: "auto", fontSize: 14, color: C.y }}>→</span>
          </div>
        )}

        {slot.state === "feedback_done" && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                background: slot.rpe <= 12 ? C.gDim : slot.rpe <= 15 ? C.yDim : C.pkDim,
                borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 10 }}>💪</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: slot.rpe <= 12 ? C.g : slot.rpe <= 15 ? C.y : C.pk }}>RPE {slot.rpe}</span>
              </div>
              {slot.socialReactions > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: C.w40 }}>
                  <span>💦🔥</span><span>{slot.socialReactions} réactions</span>
                </div>
              )}
            </div>
            {expanded && slot.feedbackText && (
              <div style={{ fontSize: 11, color: C.w60, fontStyle: "italic", marginTop: 8, padding: "8px 12px", background: C.w02, borderRadius: 8 }}>
                "{slot.feedbackText}"
              </div>
            )}
          </div>
        )}

        {isFuture && (
          <div style={{ marginTop: 10, fontSize: 11, color: C.w20, fontStyle: "italic" }}>
            {teasers[slot.type] || teasers.endurance}
          </div>
        )}
        {isAbsent && <div style={{ marginTop: 6, fontSize: 11, color: C.w20 }}>Absente</div>}
      </div>
    </div>
  );
}

function MotivWidget({ type }) {
  if (type === "badge") {
    const b = swimmer.nextBadge;
    const pct = (b.current / b.target) * 100;
    return (
      <div style={{ background: `linear-gradient(135deg, ${C.tDim}, transparent)`, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.t}10`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{b.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.w60 }}>Plus que <span style={{ color: C.t, fontWeight: 800 }}>{(b.target - b.current).toFixed(1)} {b.unit}</span> pour <span style={{ fontWeight: 700, color: C.w80 }}>{b.name}</span></div>
          <div style={{ height: 3, background: C.w05, borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: C.t }} />
          </div>
        </div>
      </div>
    );
  }
  if (type === "streak") {
    return (
      <div style={{ background: `linear-gradient(135deg, ${C.yDim}, transparent)`, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.y}10`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <div style={{ fontSize: 11, color: C.w60, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 800, color: C.y }}>{swimmer.streak} semaines</span> de streak — tu es <span style={{ fontWeight: 800, color: C.y }}>{swimmer.streakRank}ème</span> du club
        </div>
      </div>
    );
  }
  if (type === "challenge") {
    const ch = swimmer.challenge;
    return (
      <div style={{ background: `linear-gradient(135deg, ${C.pkDim}, transparent)`, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.pk}10`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{ch.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.w60 }}><span style={{ fontWeight: 700, color: C.w80 }}>{ch.name}</span> — <span style={{ fontWeight: 800, color: ch.color }}>{ch.current}/{ch.target} {ch.unit}</span></div>
          <div style={{ height: 3, background: C.w05, borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(ch.current / ch.target) * 100}%`, borderRadius: 99, background: ch.color }} />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function WeekView({ weekOffset }) {
  const slots = makeWeekData(weekOffset);
  const baseDay = today.day + weekOffset * 7;
  const widgets = ["badge", "streak", "challenge"];
  let wi = 0;
  const byDay = {};
  slots.forEach(s => { if (!byDay[s.dayOffset]) byDay[s.dayOffset] = []; byDay[s.dayOffset].push(s); });

  const items = [];
  for (let d = 0; d < 7; d++) {
    const dayNum = baseDay + d;
    if (dayNum < 1 || dayNum > 31) continue;
    const isToday = weekOffset === 0 && d === 0;
    const hasSlots = byDay[d]?.length > 0;

    items.push(
      <div key={d} style={{ animation: `fadeUp 0.4s ease ${d * 0.06}s both` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: d > 0 ? 10 : 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: isToday ? C.t : "transparent",
            border: isToday ? "none" : `1px solid ${C.w10}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            boxShadow: isToday ? `0 0 18px ${C.t}30` : "none",
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: isToday ? C.bg : C.w40, textTransform: "uppercase", lineHeight: 1 }}>{weekDays[d]}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: isToday ? C.bg : C.w80, lineHeight: 1.1 }}>{dayNum}</span>
          </div>
          {isToday && <span style={{ fontSize: 11, fontWeight: 700, color: C.t }}>Aujourd'hui</span>}
          <div style={{ flex: 1, height: 1, background: C.w05 }} />
        </div>
        {hasSlots ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 4 }}>
            {byDay[d].map((slot, si) => <TrainingCard key={si} slot={slot} />)}
          </div>
        ) : (
          <div style={{ marginLeft: 4, padding: "14px", borderRadius: 12, border: `1px dashed ${C.w10}`, fontSize: 12, color: C.w20, textAlign: "center" }}>
            Repos 😴
          </div>
        )}
        {hasSlots && wi < widgets.length && d % 2 === 0 && (
          <div style={{ marginTop: 10, marginLeft: 4 }}><MotivWidget type={widgets[wi++]} /></div>
        )}
      </div>
    );
  }
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{items}</div>;
}

function MonthView() {
  const startDow = 6;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  monthData.forEach(d => cells.push(d));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
        {monthDays.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.w20, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const hasDots = cell.types.length > 0;
          return (
            <div key={i} style={{
              aspectRatio: "1", borderRadius: 10,
              background: cell.isToday ? C.t : cell.isPast && hasDots ? C.w02 : "transparent",
              border: cell.isToday ? "none" : `1px solid ${hasDots && cell.isPast ? C.w10 : C.w05}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3, cursor: "pointer", position: "relative",
              boxShadow: cell.isToday ? `0 0 14px ${C.t}30` : "none",
            }}>
              <span style={{
                fontSize: 12, fontWeight: cell.isToday ? 900 : 600,
                color: cell.isToday ? C.bg : cell.wasAbsent ? C.w20 : C.w60,
              }}>{cell.day}</span>
              {hasDots && !cell.isToday && (
                <div style={{ display: "flex", gap: 2, position: "absolute", bottom: 4 }}>
                  {cell.types.map((t, ti) => (
                    <div key={ti} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: cell.isPast ? (cell.hasFeedback ? C.g : cell.wasAbsent ? C.w10 : C.y) : typeColors[t]?.main || C.w20,
                      opacity: cell.isPast ? (cell.wasAbsent ? 0.3 : 0.8) : 0.5,
                    }} />
                  ))}
                </div>
              )}
              {cell.isPast && cell.hasFeedback && !cell.isToday && (
                <div style={{ position: "absolute", top: 2, right: 3, fontSize: 7, color: C.g, fontWeight: 900 }}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16, padding: "12px 0", borderTop: `1px solid ${C.w05}` }}>
        {Object.entries(typeColors).slice(0, 4).map(([k, tc]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.w40 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: tc.main, opacity: 0.7 }} />{tc.label}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.w40 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.g }} />Feedback ✓
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.w40 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.y }} />En attente
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        {[
          { label: "Séances", value: "12/16", color: C.t },
          { label: "Distance", value: "38.4 km", color: C.y },
          { label: "Assiduité", value: "92%", color: C.g },
        ].map((s, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 12, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.w05}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.w40, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Month motivation */}
      <div style={{ marginTop: 14 }}><MotivWidget type="challenge" /></div>
      <div style={{ marginTop: 8 }}><MotivWidget type="badge" /></div>
    </div>
  );
}

// ─── MAIN ───
export default function SwimLabDreamPlanning() {
  const [view, setView] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [compact, setCompact] = useState(false);
  const scrollRef = useRef(null);

  const weekLabel = weekOffset === 0 ? "Cette semaine" : weekOffset === -1 ? "Sem. dernière" : weekOffset === 1 ? "Sem. prochaine" : `Sem. du ${today.day + weekOffset * 7}`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fn = () => setCompact(el.scrollTop > 50);
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", height: "100vh", background: C.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif", color: C.w,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0}50%{transform:scale(2.2);opacity:0.25} }
        @keyframes softPulse { 0%,100%{opacity:1}50%{opacity:0.7} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box} ::-webkit-scrollbar{width:0}
      `}</style>

      {/* ═══ LIVING HEADER ═══ */}
      <div style={{
        padding: compact ? "8px 20px 10px" : "10px 20px 14px",
        background: `linear-gradient(180deg, ${C.bg2}, ${C.bg})`,
        borderBottom: `1px solid ${C.w05}`, transition: "all 0.3s ease", flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.w40, marginBottom: compact ? 4 : 8 }}>
          <span>9:41</span><span style={{ fontSize: 10 }}>📶 🔋</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: compact ? 6 : 10 }}>
          <div style={{
            width: compact ? 30 : 40, height: compact ? 30 : 40, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.t}30, ${C.pk}12)`,
            border: `2px solid ${C.t}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: compact ? 11 : 14, fontWeight: 900, color: C.t, transition: "all 0.3s",
            boxShadow: `0 0 12px ${C.t}18`, flexShrink: 0,
          }}>SD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: compact ? 14 : 17, fontWeight: 900, color: C.w }}>
              {compact ? "Sophie" : `Hey ${swimmer.name} 👋`}
            </div>
            {!compact && <div style={{ fontSize: 11, color: C.y, fontWeight: 600, marginTop: 1 }}>⚡ {swimmer.title}</div>}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: C.yDim, borderRadius: 99, padding: "4px 10px", border: `1px solid ${C.y}18`,
          }}>
            <Pulse color={C.y} size={5} speed="2.5s" />
            <span style={{ fontSize: 12, fontWeight: 800, color: C.y }}>{swimmer.streak}</span>
            <span style={{ fontSize: 10, color: C.y }}>🔥</span>
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", background: C.w05,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, cursor: "pointer", border: `1px solid ${C.w10}`, position: "relative",
          }}>🔔<div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: C.pk, border: `2px solid ${C.bg2}` }} /></div>
        </div>

        {!compact && <div style={{ marginBottom: 10 }}><XPMini current={swimmer.xp} next={swimmer.xpNext} level={swimmer.level} /></div>}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2, background: C.w05, borderRadius: 10, padding: 2 }}>
            {[{ id: "week", l: "Sem." }, { id: "month", l: "Mois" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: view === v.id ? C.surface : "transparent",
                color: view === v.id ? C.w : C.w40, fontSize: 12, fontWeight: view === v.id ? 700 : 500,
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}>{v.l}</button>
            ))}
          </div>
          {view === "week" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
              <button onClick={() => setWeekOffset(w => w - 1)} style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.w10}`,
                background: "transparent", color: C.w40, cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans'",
              }}>‹</button>
              <button onClick={() => setWeekOffset(0)} style={{
                padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: weekOffset === 0 ? C.tDim : C.w05,
                color: weekOffset === 0 ? C.t : C.w60, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans'",
              }}>{weekOffset === 0 ? "Auj." : weekLabel}</button>
              <button onClick={() => setWeekOffset(w => w + 1)} style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.w10}`,
                background: "transparent", color: C.w40, cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans'",
              }}>›</button>
            </div>
          )}
          {view === "month" && <div style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 800, color: C.w }}>{today.month} 2026</div>}
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px" }}>
        {view === "week" && <WeekView key={weekOffset} weekOffset={weekOffset} />}
        {view === "month" && <MonthView />}
      </div>

      {/* ═══ BOTTOM NAV ═══ */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420, background: `linear-gradient(transparent, ${C.bg} 30%)`,
        padding: "20px 16px 10px",
      }}>
        <div style={{
          background: `${C.card}E8`, backdropFilter: "blur(20px)",
          borderRadius: 18, padding: "8px 4px", display: "flex", justifyContent: "space-around",
          border: `1px solid ${C.w05}`,
        }}>
          {[
            { icon: "🏠", label: "Home", active: false },
            { icon: "📅", label: "Planning", active: true },
            { icon: "🌊", label: "Feed", active: false },
            { icon: "🏅", label: "Badges", active: false },
            { icon: "👤", label: "Profil", active: false },
          ].map((tab, i) => (
            <button key={i} style={{
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              padding: "4px 10px", opacity: tab.active ? 1 : 0.35,
            }}>
              <span style={{ fontSize: 17 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans'", color: tab.active ? C.t : C.w40 }}>{tab.label}</span>
              {tab.active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.t, marginTop: 1 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
