import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ───
const C = {
  bg: "#0A1628",
  bgCard: "#0F2035",
  bgCardHover: "#142845",
  bgSurface: "#162D50",
  turquoise: "#00D4D4",
  turquoiseDim: "rgba(0,212,212,0.15)",
  turquoiseGlow: "rgba(0,212,212,0.3)",
  yellow: "#FFB800",
  yellowDim: "rgba(255,184,0,0.15)",
  pink: "#FF3B8F",
  pinkDim: "rgba(255,59,143,0.15)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139,92,246,0.15)",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.15)",
  coral: "#FF6B6B",
  coralDim: "rgba(255,107,107,0.15)",
  white: "#F0F6FF",
  white70: "rgba(240,246,255,0.7)",
  white40: "rgba(240,246,255,0.4)",
  white15: "rgba(240,246,255,0.15)",
  white08: "rgba(240,246,255,0.08)",
  bronze: "#CD7F32",
  bronzeDim: "rgba(205,127,50,0.2)",
  silver: "#C0C0C0",
  silverDim: "rgba(192,192,192,0.2)",
  gold: "#FFD700",
  goldDim: "rgba(255,215,0,0.2)",
  diamond: "#B9F2FF",
  diamondDim: "rgba(185,242,255,0.2)",
};

const tierColors = {
  bronze: { main: C.bronze, dim: C.bronzeDim, label: "Bronze" },
  silver: { main: C.silver, dim: C.silverDim, label: "Argent" },
  gold: { main: C.gold, dim: C.goldDim, label: "Or" },
  diamond: { main: C.diamond, dim: C.diamondDim, label: "Diamant" },
};

const familyColors = {
  distance: { main: C.turquoise, dim: C.turquoiseDim, icon: "🌊", label: "Distance" },
  assiduité: { main: C.green, dim: C.greenDim, icon: "⚡", label: "Assiduité" },
  feedback: { main: C.yellow, dim: C.yellowDim, icon: "💬", label: "Feedback" },
  intensité: { main: C.pink, dim: C.pinkDim, icon: "🔥", label: "Intensité" },
  secret: { main: C.purple, dim: C.purpleDim, icon: "✨", label: "Secret" },
};

// ─── MOCK DATA ───
const mockUser = {
  name: "Sophie Dupont",
  title: "La Machine",
  level: 24,
  xp: 7420,
  xpNext: 8500,
  avatar: "SD",
  club: "Swim Club Paris",
  group: "Compétition A",
  stats: { totalKm: 234.5, assiduité: 92, avgRPE: 14.2, feedbacks: 187 },
  pinnedBadges: [
    { id: 1, name: "Force de la Mer", family: "distance", tier: "gold", icon: "🦈" },
    { id: 2, name: "Indestructible", family: "intensité", tier: "diamond", icon: "💎" },
    { id: 3, name: "Le Caméléon", family: "secret", tier: "gold", icon: "🦎" },
  ],
  badges: [
    { id: 1, name: "Force de la Mer", family: "distance", tier: "gold", icon: "🦈", unlocked: true, date: "12 Fév" },
    { id: 4, name: "Première Vague", family: "distance", tier: "bronze", icon: "🌊", unlocked: true, date: "3 Oct" },
    { id: 5, name: "Courant Marin", family: "distance", tier: "silver", icon: "🐬", unlocked: true, date: "28 Nov" },
    { id: 6, name: "Légende des Océans", family: "distance", tier: "diamond", icon: "🐋", unlocked: false, progress: 23 },
    { id: 7, name: "Ancré", family: "assiduité", tier: "bronze", icon: "⚓", unlocked: true, date: "15 Oct" },
    { id: 8, name: "Insubmersible", family: "assiduité", tier: "silver", icon: "🚢", unlocked: true, date: "8 Jan" },
    { id: 9, name: "Force Tranquille", family: "assiduité", tier: "gold", icon: "🏛️", unlocked: false, progress: 68 },
    { id: 10, name: "Première Voix", family: "feedback", tier: "bronze", icon: "📢", unlocked: true, date: "5 Oct" },
    { id: 11, name: "Voix du Bassin", family: "feedback", tier: "silver", icon: "🎙️", unlocked: true, date: "2 Déc" },
    { id: 12, name: "Oracle des Lignes", family: "feedback", tier: "gold", icon: "🔮", unlocked: false, progress: 93 },
    { id: 2, name: "Indestructible", family: "intensité", tier: "diamond", icon: "💎", unlocked: true, date: "1 Mar" },
    { id: 13, name: "Premières Flammes", family: "intensité", tier: "bronze", icon: "🕯️", unlocked: true, date: "20 Oct" },
    { id: 14, name: "Cœur en Feu", family: "intensité", tier: "silver", icon: "❤️‍🔥", unlocked: true, date: "15 Déc" },
    { id: 3, name: "Le Caméléon", family: "secret", tier: "gold", icon: "🦎", unlocked: true, date: "22 Fév" },
    { id: 15, name: "Le Phénix", family: "secret", tier: "gold", icon: "🐦‍🔥", unlocked: true, date: "10 Jan" },
    { id: 16, name: "L'Équilibriste", family: "secret", tier: "silver", icon: "⚖️", unlocked: false, progress: 0 },
    { id: 17, name: "Le Fantôme", family: "secret", tier: "silver", icon: "👻", unlocked: false, progress: 0 },
  ],
};

const mockChallenges = {
  monthly: [
    {
      id: 1, title: "Marathon Collectif", subtitle: "Le club doit nager 500 km en mars",
      type: "collectif", icon: "🏊", color: C.turquoise, colorDim: C.turquoiseDim,
      target: 500, current: 342, unit: "km", endDate: "22 jours",
      topContributors: [
        { name: "Sophie D.", value: 48.2, avatar: "SD" },
        { name: "Marc L.", value: 41.7, avatar: "ML" },
        { name: "Alice B.", value: 38.9, avatar: "AB" },
      ],
    },
    {
      id: 2, title: "Mois du Papillon", subtitle: "Nage 10 km en papillon ce mois",
      type: "individuel", icon: "🦋", color: C.pink, colorDim: C.pinkDim,
      target: 10, current: 6.3, unit: "km", endDate: "22 jours",
      participants: 18, completed: 3,
    },
    {
      id: 3, title: "Streak Challenge", subtitle: "Plus longue série de présences",
      type: "compétitif", icon: "⚡", color: C.yellow, colorDim: C.yellowDim,
      leaderboard: [
        { name: "Claire R.", value: 14, avatar: "CR", isYou: false },
        { name: "Sophie D.", value: 12, avatar: "SD", isYou: true },
        { name: "Thomas K.", value: 11, avatar: "TK", isYou: false },
        { name: "Marc L.", value: 9, avatar: "ML", isYou: false },
        { name: "Emma V.", value: 8, avatar: "EV", isYou: false },
      ],
      endDate: "22 jours",
    },
  ],
  permanent: [
    { id: 10, name: "Légende des Océans", family: "distance", current: 234.5, target: 1000, unit: "km", tier: "diamond", icon: "🐋" },
    { id: 11, name: "Force Tranquille", family: "assiduité", current: 17, target: 25, unit: "sem.", tier: "gold", icon: "🏛️" },
    { id: 12, name: "Oracle des Lignes", family: "feedback", current: 187, target: 200, unit: "fb", tier: "gold", icon: "🔮" },
  ],
};

const xpBreakdown = [
  { label: "Entraînements complétés", xp: 3200, icon: "🏊" },
  { label: "Feedbacks donnés", xp: 1870, icon: "💬" },
  { label: "Badges débloqués", xp: 1500, icon: "🏅" },
  { label: "Défis mensuels", xp: 600, icon: "🎯" },
  { label: "Bonus streak", xp: 250, icon: "⚡" },
];

// ─── COMPONENTS ───

function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 30;
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(Math.floor(start));
    }, 20);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{typeof value === "number" && value % 1 !== 0 ? display.toFixed(1) : display}{suffix}</span>;
}

function XPBar({ current, next, level }) {
  const pct = (current / next) * 100;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: C.white40 }}>
        <span>Niv. {level}</span>
        <span>{current.toLocaleString()} / {next.toLocaleString()} XP</span>
        <span>Niv. {level + 1}</span>
      </div>
      <div style={{ height: 8, background: C.white08, borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${C.turquoise}, ${C.yellow})`,
          transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 12px ${C.turquoiseGlow}`,
        }} />
      </div>
    </div>
  );
}

function BadgeVisual({ badge, size = 64, showName = true, locked = false, glow = false }) {
  const tier = tierColors[badge.tier];
  const family = familyColors[badge.family];
  const isLocked = locked || !badge.unlocked;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      opacity: isLocked ? 0.4 : 1, filter: isLocked ? "grayscale(0.8)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: isLocked
          ? C.white08
          : `radial-gradient(circle at 30% 30%, ${tier.dim}, ${C.bgCard})`,
        border: `2px solid ${isLocked ? C.white15 : tier.main}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.45, position: "relative",
        boxShadow: glow && !isLocked ? `0 0 20px ${tier.main}40, 0 0 40px ${tier.main}20` : "none",
        transition: "box-shadow 0.4s ease",
      }}>
        {isLocked ? "🔒" : badge.icon}
        {!isLocked && (
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: size * 0.3, height: size * 0.3, borderRadius: "50%",
            background: tier.main, border: `2px solid ${C.bgCard}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.14, fontWeight: 800, color: C.bg,
          }}>
            {badge.tier === "diamond" ? "💎" : badge.tier === "gold" ? "★" : badge.tier === "silver" ? "◆" : "●"}
          </div>
        )}
      </div>
      {showName && (
        <span style={{
          fontSize: 10, color: isLocked ? C.white40 : C.white70,
          textAlign: "center", maxWidth: size + 20, lineHeight: 1.2,
          fontWeight: 500,
        }}>
          {isLocked && badge.family === "secret" ? "???" : badge.name}
        </span>
      )}
    </div>
  );
}

function ProgressRing({ pct, size = 44, color = C.turquoise }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.white08} strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function Avatar({ initials, size = 32, color = C.turquoise, border = false, isYou = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
      border: border ? `2px solid ${color}` : isYou ? `2px solid ${C.yellow}` : `1px solid ${C.white15}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: isYou ? C.yellow : color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 4, background: C.white08, borderRadius: 12, padding: 3,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
          background: active === t.id ? C.bgSurface : "transparent",
          color: active === t.id ? C.white : C.white40,
          fontSize: 13, fontWeight: active === t.id ? 700 : 500,
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.25s ease",
          boxShadow: active === t.id ? `0 2px 8px rgba(0,0,0,0.3)` : "none",
        }}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── PAGES ───

function ProfilePage() {
  const u = mockUser;
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [filterFamily, setFilterFamily] = useState("all");
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const filteredBadges = filterFamily === "all"
    ? u.badges
    : u.badges.filter(b => b.family === filterFamily);

  const unlockedCount = u.badges.filter(b => b.unlocked).length;
  const secretCount = u.badges.filter(b => b.family === "secret" && b.unlocked).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero Profile Card */}
      <div style={{
        background: `linear-gradient(135deg, ${C.bgCard}, ${C.bgSurface})`,
        borderRadius: 20, padding: 28, position: "relative", overflow: "hidden",
        border: `1px solid ${C.white08}`,
      }}>
        {/* Glow accent */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 160, height: 160,
          background: `radial-gradient(circle, ${C.turquoise}15, transparent 70%)`,
          borderRadius: "50%",
        }} />

        <div style={{ display: "flex", gap: 20, alignItems: "center", position: "relative" }}>
          {/* Avatar + Level Ring */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.turquoise}40, ${C.pink}20)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: C.turquoise,
              border: `3px solid ${C.turquoise}`,
              boxShadow: `0 0 24px ${C.turquoise}30`,
            }}>
              {u.avatar}
            </div>
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              background: `linear-gradient(135deg, ${C.yellow}, ${C.turquoise})`,
              borderRadius: 99, padding: "3px 9px",
              fontSize: 11, fontWeight: 800, color: C.bg,
              border: `2px solid ${C.bgCard}`,
            }}>
              {u.level}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>
              {u.name}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: C.yellow,
              display: "flex", alignItems: "center", gap: 6, marginTop: 2,
            }}>
              ⚡ {u.title}
            </div>
            <div style={{ fontSize: 12, color: C.white40, marginTop: 4 }}>
              {u.club} · {u.group}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 20 }}>
          <XPBar current={u.xp} next={u.xpNext} level={u.level} />
        </div>

        {/* Pinned Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          {u.pinnedBadges.map(b => (
            <BadgeVisual key={b.id} badge={{ ...b, unlocked: true }} size={56} glow={true} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Distance totale", value: u.stats.totalKm, suffix: " km", color: C.turquoise, icon: "🌊" },
          { label: "Assiduité", value: u.stats.assiduité, suffix: "%", color: C.green, icon: "⚡" },
          { label: "RPE moyen", value: u.stats.avgRPE, suffix: "/20", color: C.pink, icon: "🔥" },
          { label: "Feedbacks", value: u.stats.feedbacks, suffix: "", color: C.yellow, icon: "💬" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.bgCard, borderRadius: 14, padding: "16px 14px",
            border: `1px solid ${C.white08}`,
          }}>
            <div style={{ fontSize: 11, color: C.white40, marginBottom: 6 }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
          </div>
        ))}
      </div>

      {/* Badge Collection */}
      <div style={{
        background: C.bgCard, borderRadius: 20, padding: 20,
        border: `1px solid ${C.white08}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>
              🏅 Collection
            </div>
            <div style={{ fontSize: 12, color: C.white40, marginTop: 2 }}>
              {unlockedCount}/{u.badges.length} badges · {secretCount} secrets trouvés
            </div>
          </div>
          <button onClick={() => setShowAllBadges(!showAllBadges)} style={{
            background: C.white08, border: "none", borderRadius: 8, padding: "6px 12px",
            color: C.turquoise, fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {showAllBadges ? "Réduire" : "Voir tout"}
          </button>
        </div>

        {/* Family Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setFilterFamily("all")} style={{
            background: filterFamily === "all" ? C.white15 : "transparent",
            border: `1px solid ${filterFamily === "all" ? C.white40 : C.white08}`,
            borderRadius: 99, padding: "5px 12px", cursor: "pointer",
            color: filterFamily === "all" ? C.white : C.white40,
            fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}>Tous</button>
          {Object.entries(familyColors).map(([key, fam]) => (
            <button key={key} onClick={() => setFilterFamily(key)} style={{
              background: filterFamily === key ? `${fam.main}20` : "transparent",
              border: `1px solid ${filterFamily === key ? fam.main : C.white08}`,
              borderRadius: 99, padding: "5px 12px", cursor: "pointer",
              color: filterFamily === key ? fam.main : C.white40,
              fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>
              {fam.icon} {fam.label}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
          maxHeight: showAllBadges ? 600 : 200, overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}>
          {filteredBadges.map(b => (
            <div key={b.id + b.family}
              onMouseEnter={() => setHoveredBadge(b.id)}
              onMouseLeave={() => setHoveredBadge(null)}
              style={{ cursor: "pointer", transition: "transform 0.2s", transform: hoveredBadge === b.id ? "scale(1.1)" : "scale(1)" }}
            >
              <BadgeVisual badge={b} size={52} locked={!b.unlocked} glow={hoveredBadge === b.id} />
              {b.unlocked && b.date && (
                <div style={{ textAlign: "center", fontSize: 9, color: C.white40, marginTop: 2 }}>{b.date}</div>
              )}
              {!b.unlocked && b.progress > 0 && (
                <div style={{ textAlign: "center", fontSize: 9, color: familyColors[b.family].main, marginTop: 2, fontWeight: 700 }}>
                  {b.progress}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* XP Breakdown */}
      <div style={{
        background: C.bgCard, borderRadius: 20, padding: 20,
        border: `1px solid ${C.white08}`,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 16 }}>
          ✨ Sources d'XP
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {xpBreakdown.map((item, i) => {
            const pct = (item.xp / u.xp) * 100;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.white70 }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: C.turquoise, fontWeight: 700 }}>+{item.xp.toLocaleString()} XP</span>
                  </div>
                  <div style={{ height: 4, background: C.white08, borderRadius: 99 }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 99,
                      background: C.turquoise, transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share CTA */}
      <button style={{
        width: "100%", padding: 16, borderRadius: 14, border: "none",
        background: `linear-gradient(135deg, ${C.turquoise}, ${C.turquoise}CC)`,
        color: C.bg, fontSize: 15, fontWeight: 800, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 20px ${C.turquoise}40`,
      }}>
        📤 Partager mon profil
      </button>
    </div>
  );
}

function ChallengesPage() {
  const [subTab, setSubTab] = useState("monthly");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 4, background: C.white08, borderRadius: 10, padding: 3 }}>
        {[
          { id: "monthly", label: "🎯 Ce Mois" },
          { id: "permanent", label: "🏔️ Permanents" },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
            background: subTab === t.id ? C.bgSurface : "transparent",
            color: subTab === t.id ? C.white : C.white40,
            fontSize: 13, fontWeight: subTab === t.id ? 700 : 500,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "monthly" && (
        <>
          {/* Countdown */}
          <div style={{
            textAlign: "center", fontSize: 12, color: C.white40,
            padding: "8px 0",
          }}>
            ⏱️ 22 jours restants en mars
          </div>

          {/* Collective Challenge */}
          {mockChallenges.monthly.filter(c => c.type === "collectif").map(ch => (
            <div key={ch.id} style={{
              background: `linear-gradient(135deg, ${C.bgCard}, ${ch.colorDim})`,
              borderRadius: 20, padding: 24, border: `1px solid ${ch.color}30`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20, width: 100, height: 100,
                background: `radial-gradient(circle, ${ch.color}15, transparent 70%)`,
                borderRadius: "50%",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{ch.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.white }}>{ch.title}</div>
                  <div style={{ fontSize: 12, color: C.white40 }}>{ch.subtitle}</div>
                </div>
                <div style={{
                  marginLeft: "auto", background: `${ch.color}20`, borderRadius: 99,
                  padding: "4px 10px", fontSize: 11, color: ch.color, fontWeight: 700,
                }}>COLLECTIF</div>
              </div>

              {/* Big Progress */}
              <div style={{ textAlign: "center", margin: "12px 0" }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: ch.color }}>
                  <AnimatedNumber value={ch.current} />
                </span>
                <span style={{ fontSize: 18, color: C.white40, fontWeight: 600 }}> / {ch.target} {ch.unit}</span>
              </div>
              <div style={{ height: 10, background: C.white08, borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
                <div style={{
                  height: "100%", width: `${(ch.current / ch.target) * 100}%`,
                  background: `linear-gradient(90deg, ${ch.color}, ${ch.color}AA)`,
                  borderRadius: 99, transition: "width 1.5s ease",
                  boxShadow: `0 0 12px ${ch.color}40`,
                }} />
              </div>

              {/* Top Contributors */}
              <div style={{ fontSize: 11, color: C.white40, marginBottom: 10, fontWeight: 600 }}>
                🏆 TOP CONTRIBUTEURS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ch.topContributors.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 20, fontSize: 14, fontWeight: 800, textAlign: "center",
                      color: i === 0 ? C.gold : i === 1 ? C.silver : C.bronze,
                    }}>{i + 1}</span>
                    <Avatar initials={p.avatar} size={28} color={ch.color} isYou={p.name.includes("Sophie")} />
                    <span style={{ flex: 1, fontSize: 13, color: p.name.includes("Sophie") ? C.yellow : C.white70, fontWeight: p.name.includes("Sophie") ? 700 : 500 }}>
                      {p.name} {p.name.includes("Sophie") && <span style={{ fontSize: 10, color: C.yellow }}>← Toi</span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: ch.color }}>{p.value} km</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Individual Challenge */}
          {mockChallenges.monthly.filter(c => c.type === "individuel").map(ch => (
            <div key={ch.id} style={{
              background: C.bgCard, borderRadius: 16, padding: 20,
              border: `1px solid ${C.white08}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{ch.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: C.white40 }}>{ch.subtitle}</div>
                </div>
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <ProgressRing pct={(ch.current / ch.target) * 100} size={48} color={ch.color} />
                  <span style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: ch.color,
                  }}>{Math.round((ch.current / ch.target) * 100)}%</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: ch.color }}>{ch.current} <span style={{ fontSize: 13, color: C.white40 }}>/ {ch.target} {ch.unit}</span></span>
                <span style={{ fontSize: 11, color: C.white40 }}>{ch.participants} participants · {ch.completed} ont fini</span>
              </div>
            </div>
          ))}

          {/* Leaderboard Challenge */}
          {mockChallenges.monthly.filter(c => c.type === "compétitif").map(ch => (
            <div key={ch.id} style={{
              background: C.bgCard, borderRadius: 16, padding: 20,
              border: `1px solid ${C.white08}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{ch.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: C.white40 }}>{ch.subtitle}</div>
                </div>
                <div style={{
                  marginLeft: "auto", background: `${ch.color}20`, borderRadius: 99,
                  padding: "4px 10px", fontSize: 11, color: ch.color, fontWeight: 700,
                }}>COMPÉTITIF</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ch.leaderboard.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: 10, background: p.isYou ? `${C.yellow}10` : "transparent",
                    border: p.isYou ? `1px solid ${C.yellow}30` : "1px solid transparent",
                  }}>
                    <span style={{
                      width: 22, fontSize: i < 3 ? 16 : 13, fontWeight: 800, textAlign: "center",
                      color: i === 0 ? C.gold : i === 1 ? C.silver : i === 2 ? C.bronze : C.white40,
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <Avatar initials={p.avatar} size={28} color={ch.color} isYou={p.isYou} />
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: p.isYou ? 700 : 500,
                      color: p.isYou ? C.yellow : C.white70,
                    }}>
                      {p.name} {p.isYou && <span style={{ fontSize: 10 }}>← Toi</span>}
                    </span>
                    <span style={{
                      fontSize: 15, fontWeight: 800, color: ch.color,
                    }}>{p.value}</span>
                    <span style={{ fontSize: 10, color: C.white40 }}>sem.</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {subTab === "permanent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: C.white40, padding: "4px 0" }}>
            Tes prochains objectifs à atteindre
          </div>
          {mockChallenges.permanent.map(ch => {
            const family = familyColors[ch.family];
            const tier = tierColors[ch.tier];
            const pct = (ch.current / ch.target) * 100;
            return (
              <div key={ch.id} style={{
                background: C.bgCard, borderRadius: 16, padding: 18,
                border: `1px solid ${C.white08}`, display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `radial-gradient(circle, ${tier.dim}, ${C.bgCard})`,
                  border: `2px solid ${tier.main}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, opacity: 0.5,
                }}>
                  {ch.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{ch.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: tier.main,
                      background: tier.dim, borderRadius: 99, padding: "2px 8px",
                    }}>{tierColors[ch.tier].label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: family.main }}>{ch.current}</span>
                    <span style={{ fontSize: 12, color: C.white40 }}>/ {ch.target} {ch.unit}</span>
                  </div>
                  <div style={{ height: 5, background: C.white08, borderRadius: 99 }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 99,
                      background: family.main, transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BadgeShowcasePage() {
  const families = ["distance", "assiduité", "feedback", "intensité", "secret"];
  const [selectedFamily, setSelectedFamily] = useState("distance");

  const badges = {
    distance: [
      { name: "Première Vague", tier: "bronze", icon: "🌊", unlocked: true, title: "Le Têtard", seuil: "10 km nagés" },
      { name: "Courant Marin", tier: "silver", icon: "🐬", unlocked: true, title: "Le Dauphin", seuil: "50 km nagés" },
      { name: "Force de la Mer", tier: "gold", icon: "🦈", unlocked: true, title: "Le Requin", seuil: "200 km nagés" },
      { name: "Légende des Océans", tier: "diamond", icon: "🐋", unlocked: false, title: "Le Léviathan", seuil: "1 000 km nagés" },
    ],
    assiduité: [
      { name: "Ancré", tier: "bronze", icon: "⚓", unlocked: true, title: "Le Fidèle", seuil: "4 sem. consécutives" },
      { name: "Insubmersible", tier: "silver", icon: "🚢", unlocked: true, title: "La Marée Haute", seuil: "12 sem. consécutives" },
      { name: "Force Tranquille", tier: "gold", icon: "🏛️", unlocked: false, title: "Le Phare", seuil: "6 mois consécutifs" },
      { name: "Éternel", tier: "diamond", icon: "👑", unlocked: false, title: "Le Titan des Bassins", seuil: "1 an sans interruption" },
    ],
    feedback: [
      { name: "Première Voix", tier: "bronze", icon: "📢", unlocked: true, title: "Le Reporter", seuil: "10 feedbacks" },
      { name: "Voix du Bassin", tier: "silver", icon: "🎙️", unlocked: true, title: "L'Analyste", seuil: "50 feedbacks" },
      { name: "Oracle des Lignes", tier: "gold", icon: "🔮", unlocked: false, title: "Le Sage", seuil: "200 feedbacks" },
      { name: "Légende Vocale", tier: "diamond", icon: "🌟", unlocked: false, title: "La Conscience du Club", seuil: "500 fb + 80% commentés" },
    ],
    intensité: [
      { name: "Premières Flammes", tier: "bronze", icon: "🕯️", unlocked: true, title: "Le Courageux", seuil: "5 × RPE ≥ 16" },
      { name: "Cœur en Feu", tier: "silver", icon: "❤️‍🔥", unlocked: true, title: "Le Forgé", seuil: "20 × RPE ≥ 16" },
      { name: "Limite Repoussée", tier: "gold", icon: "🌋", unlocked: false, title: "La Machine", seuil: "50 × RPE ≥ 17" },
      { name: "Indestructible", tier: "diamond", icon: "💎", unlocked: true, title: "Le Berserker", seuil: "100 × RPE ≥ 17 + retour" },
    ],
    secret: [
      { name: "Le Fantôme", tier: "silver", icon: "👻", unlocked: false, title: "L'Ombre du Bassin", seuil: "???" },
      { name: "Le Phénix", tier: "gold", icon: "🐦‍🔥", unlocked: true, title: "Ressuscité", seuil: "Retour après 3+ sem." },
      { name: "Le Caméléon", tier: "gold", icon: "🦎", unlocked: true, title: "Maître des Éléments", seuil: "5km chaque nage" },
      { name: "L'Équilibriste", tier: "silver", icon: "⚖️", unlocked: false, title: "???", seuil: "???" },
    ],
  };

  const family = familyColors[selectedFamily];
  const currentBadges = badges[selectedFamily];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", fontSize: 12, color: C.white40 }}>
        Catalogue des badges · 5 familles · 4 niveaux
      </div>

      {/* Family Selector */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {families.map(f => {
          const fc = familyColors[f];
          const isActive = selectedFamily === f;
          return (
            <button key={f} onClick={() => setSelectedFamily(f)} style={{
              width: 52, height: 52, borderRadius: 14, border: "none", cursor: "pointer",
              background: isActive ? `${fc.main}25` : C.white08,
              borderWidth: 2, borderStyle: "solid",
              borderColor: isActive ? fc.main : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2, transition: "all 0.25s ease",
              boxShadow: isActive ? `0 0 16px ${fc.main}30` : "none",
            }}>
              <span style={{ fontSize: 18 }}>{fc.icon}</span>
              <span style={{ fontSize: 8, color: isActive ? fc.main : C.white40, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                {fc.label.slice(0, 4).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Family Header */}
      <div style={{
        textAlign: "center", padding: "8px 0",
        fontSize: 18, fontWeight: 800, color: family.main,
      }}>
        {family.icon} Famille {family.label}
      </div>

      {/* Badge Progression */}
      <div style={{
        background: C.bgCard, borderRadius: 20, padding: 20,
        border: `1px solid ${family.main}20`,
      }}>
        {/* Tier line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, position: "relative" }}>
          {/* Connection line */}
          <div style={{
            position: "absolute", top: "50%", left: 40, right: 40, height: 2,
            background: C.white08, transform: "translateY(-50%)", zIndex: 0,
          }} />
          <div style={{
            position: "absolute", top: "50%", left: 40, height: 2,
            width: `${(currentBadges.filter(b => b.unlocked).length / currentBadges.length) * (100 - 20)}%`,
            background: `linear-gradient(90deg, ${family.main}, ${family.main}60)`,
            transform: "translateY(-50%)", zIndex: 1,
            boxShadow: `0 0 8px ${family.main}40`,
          }} />

          {currentBadges.map((b, i) => (
            <div key={i} style={{ zIndex: 2, position: "relative" }}>
              <BadgeVisual badge={{ ...b, family: selectedFamily }} size={64} glow={b.unlocked} />
            </div>
          ))}
        </div>

        {/* Detail cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {currentBadges.map((b, i) => {
            const tier = tierColors[b.tier];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 12, background: b.unlocked ? `${tier.main}08` : C.white08,
                border: `1px solid ${b.unlocked ? `${tier.main}20` : C.white08}`,
                opacity: b.unlocked ? 1 : 0.6,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: b.unlocked ? tier.main : C.white15,
                  boxShadow: b.unlocked ? `0 0 8px ${tier.main}` : "none",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: b.unlocked ? C.white : C.white40 }}>
                    {b.unlocked || selectedFamily !== "secret" ? b.name : "???"}
                  </div>
                  <div style={{ fontSize: 11, color: C.white40 }}>
                    {b.seuil}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: tier.main,
                  background: tier.dim, borderRadius: 99, padding: "3px 8px",
                }}>
                  {tier.label}
                </div>
                <div style={{
                  fontSize: 11, color: b.unlocked || selectedFamily !== "secret" ? C.yellow : C.white40,
                  fontWeight: 600, maxWidth: 100, textAlign: "right",
                }}>
                  → "{b.unlocked || selectedFamily !== "secret" ? b.title : "???"}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Badge Teaser */}
      {selectedFamily === "secret" && (
        <div style={{
          background: `linear-gradient(135deg, ${C.purple}10, ${C.pink}10)`,
          borderRadius: 16, padding: 20, textAlign: "center",
          border: `1px dashed ${C.purple}30`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔮</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>
            Les badges secrets sont découverts en les débloquant
          </div>
          <div style={{ fontSize: 12, color: C.white40, marginTop: 6 }}>
            Indice : nagez de toutes les façons, soyez régulier, revenez toujours plus fort...
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───
export default function SwimLabGamification() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", icon: "👤", label: "Profil" },
    { id: "challenges", icon: "🎯", label: "Défis" },
    { id: "badges", icon: "🏅", label: "Badges" },
  ];

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif",
      color: C.white, position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Status Bar */}
      <div style={{
        padding: "12px 20px 8px", display: "flex", justifyContent: "space-between",
        fontSize: 12, color: C.white40,
      }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10 }}>📶</span>
          <span style={{ fontSize: 10 }}>🔋</span>
        </span>
      </div>

      {/* Header */}
      <div style={{
        padding: "8px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: C.turquoise }}>Swim</span>
          <span style={{ color: C.white }}>Lab</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            background: `${C.yellow}15`, borderRadius: 99, padding: "4px 10px",
            fontSize: 12, fontWeight: 700, color: C.yellow,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            ✨ {mockUser.xp.toLocaleString()} XP
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: C.white08,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, cursor: "pointer",
          }}>🔔</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ padding: "0 20px 16px" }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 100px", overflowY: "auto" }}>
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "challenges" && <ChallengesPage />}
        {activeTab === "badges" && <BadgeShowcasePage />}
      </div>

      {/* Bottom Nav hint */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420, padding: "12px 20px",
        background: `linear-gradient(transparent, ${C.bg} 40%)`,
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: 134, height: 5, background: C.white15, borderRadius: 99,
        }} />
      </div>
    </div>
  );
}
