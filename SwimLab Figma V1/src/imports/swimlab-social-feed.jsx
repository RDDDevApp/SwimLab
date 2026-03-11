import { useState, useEffect, useRef } from "react";

// ─── TOKENS ───
const C = {
  bg: "#060E18", bgCard: "#0C1A2E", bgCardHover: "#112240", bgSurface: "#152A4A",
  bgElevated: "#1A3358",
  turquoise: "#00D4D4", turquoiseDim: "rgba(0,212,212,0.12)",
  yellow: "#FFB800", yellowDim: "rgba(255,184,0,0.12)",
  pink: "#FF3B8F", pinkDim: "rgba(255,59,143,0.12)",
  purple: "#8B5CF6", purpleDim: "rgba(139,92,246,0.12)",
  green: "#22C55E", greenDim: "rgba(34,197,94,0.12)",
  coral: "#FF6B6B", coralDim: "rgba(255,107,107,0.12)",
  blue: "#3B82F6", blueDim: "rgba(59,130,246,0.12)",
  white: "#F0F6FF", w80: "rgba(240,246,255,0.8)", w60: "rgba(240,246,255,0.6)",
  w40: "rgba(240,246,255,0.4)", w20: "rgba(240,246,255,0.2)",
  w10: "rgba(240,246,255,0.1)", w05: "rgba(240,246,255,0.05)",
  bronze: "#CD7F32", silver: "#C0C0C0", gold: "#FFD700", diamond: "#B9F2FF",
};

const reactions = [
  { id: "like", emoji: "❤️", label: "J'aime" },
  { id: "splash", emoji: "💦", label: "Splash" },
  { id: "fire", emoji: "🔥", label: "En feu" },
  { id: "muscle", emoji: "💪", label: "Force" },
  { id: "wave", emoji: "🌊", label: "Respect" },
];

const tierStyle = {
  bronze: { color: C.bronze, bg: "rgba(205,127,50,0.15)", label: "Bronze" },
  silver: { color: C.silver, bg: "rgba(192,192,192,0.15)", label: "Argent" },
  gold: { color: C.gold, bg: "rgba(255,215,0,0.15)", label: "Or" },
  diamond: { color: C.diamond, bg: "rgba(185,242,255,0.15)", label: "Diamant" },
};

// ─── MOCK DATA ───
const users = {
  sophie: { name: "Sophie Dupont", title: "La Machine", avatar: "SD", level: 24, color: C.turquoise, club: "Swim Club Paris", following: true },
  marc: { name: "Marc Lefebvre", title: "Le Diesel", avatar: "ML", level: 18, color: C.green, club: "Swim Club Paris", following: true },
  claire: { name: "Claire Rousseau", title: "Le Phénix", avatar: "CR", level: 31, color: C.pink, club: "Swim Club Paris", following: false },
  thomas: { name: "Thomas Karimi", title: "Le Requin", avatar: "TK", level: 42, color: C.yellow, club: "Aqua Lyon", following: false },
  alice: { name: "Alice Bertrand", title: "Le Têtard", avatar: "AB", level: 8, color: C.purple, club: "Swim Club Paris", following: true },
  emma: { name: "Emma Vidal", title: "L'Analyste", avatar: "EV", level: 15, color: C.coral, club: "Dauphins Marseille", following: true },
};

const feedPosts = [
  {
    id: 1, type: "badge", user: "claire", time: "Il y a 12 min", scope: "club",
    badge: { name: "Indestructible", family: "intensité", tier: "diamond", icon: "💎", title: "Le Berserker" },
    description: "100 entraînements à RPE ≥ 17 sans jamais lâcher la semaine suivante",
    reactions: { like: 14, splash: 8, fire: 22, muscle: 11, wave: 6 },
    comments: [
      { user: "sophie", text: "Monstre absolu 🔥" },
      { user: "marc", text: "Bien mérité !" },
    ],
  },
  {
    id: 2, type: "record", user: "sophie", time: "Il y a 1h", scope: "club",
    record: { label: "Record hebdomadaire", value: "28.4 km", previous: "24.1 km", icon: "📈", improvement: "+17.8%" },
    description: "Nouvelle meilleure semaine ! 6 entraînements en 7 jours",
    reactions: { like: 7, splash: 3, fire: 5, muscle: 9, wave: 2 },
    comments: [{ user: "alice", text: "Tu es une machine Sophie 😳" }],
  },
  {
    id: 3, type: "challenge", user: "thomas", time: "Il y a 2h", scope: "general",
    challenge: { name: "Mois du Papillon", icon: "🦋", target: "10 km", color: C.pink, duration: "En 18 jours" },
    description: "Défi complété ! 10 km de papillon en mars",
    reactions: { like: 23, splash: 15, fire: 31, muscle: 18, wave: 12 },
    comments: [
      { user: "emma", text: "Depuis Lyon, respect total 🦋" },
      { user: "claire", text: "J'en suis à 7.2 km, tu me motives !" },
    ],
  },
  {
    id: 4, type: "badge_secret", user: "marc", time: "Il y a 3h", scope: "club",
    badge: { name: "Le Caméléon", family: "secret", tier: "gold", icon: "🦎", title: "Maître des Éléments" },
    description: "Badge secret découvert ! 5 km dans chacune des 4 nages",
    reactions: { like: 9, splash: 12, fire: 4, muscle: 6, wave: 8 },
    comments: [{ user: "sophie", text: "Comment t'as trouvé ça ?! 🤯" }],
  },
  {
    id: 5, type: "record", user: "emma", time: "Il y a 5h", scope: "general",
    record: { label: "Meilleure assiduité", value: "16 sem.", previous: "12 sem.", icon: "⚡", improvement: "Nouveau record" },
    description: "16 semaines consécutives sans absence. L'objectif c'est le Phare !",
    reactions: { like: 11, splash: 5, fire: 8, muscle: 7, wave: 14 },
    comments: [],
  },
  {
    id: 6, type: "challenge_collective", time: "Il y a 6h", scope: "club",
    club: "Swim Club Paris",
    challenge: { name: "Marathon Collectif Mars", icon: "🏊", target: "500 km", achieved: "500.3 km", color: C.turquoise, participants: 27 },
    description: "Le club a atteint l'objectif collectif de 500 km ce mois !",
    reactions: { like: 27, splash: 27, fire: 19, muscle: 22, wave: 27 },
    comments: [
      { user: "marc", text: "ON L'A FAIT 🎉" },
      { user: "alice", text: "Fière de ce club ❤️" },
      { user: "claire", text: "27/27 ont contribué, c'est ça l'esprit" },
    ],
  },
  {
    id: 7, type: "badge", user: "alice", time: "Il y a 8h", scope: "club",
    badge: { name: "Première Voix", family: "feedback", tier: "bronze", icon: "📢", title: "Le Reporter" },
    description: "10 feedbacks donnés ! Première étape vers La Conscience du Club",
    reactions: { like: 5, splash: 2, fire: 1, muscle: 3, wave: 1 },
    comments: [{ user: "sophie", text: "Bienvenue dans le club des feedbackeurs 💬" }],
  },
  {
    id: 8, type: "record", user: "claire", time: "Hier", scope: "club",
    record: { label: "RPE moyen mensuel le plus bas", value: "12.4", previous: "13.8", icon: "🧘", improvement: "Meilleure récup" },
    description: "Mon corps dit merci. Mois le plus maîtrisé depuis que j'utilise SwimLab",
    reactions: { like: 8, splash: 4, fire: 2, muscle: 5, wave: 11 },
    comments: [],
  },
];

const suggestedUsers = [
  { ...users.thomas, mutualFollowers: 3 },
  { ...users.claire, mutualFollowers: 5 },
];

// ─── UTILS ───
function totalReactions(r) { return Object.values(r).reduce((a, b) => a + b, 0); }

// ─── COMPONENTS ───

function Avatar({ initials, size = 40, color = C.turquoise, level, ring = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}30, ${color}08)`,
        border: ring ? `2.5px solid ${color}` : `1.5px solid ${C.w10}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 800, color,
        boxShadow: ring ? `0 0 12px ${color}25` : "none",
      }}>{initials}</div>
      {level && (
        <div style={{
          position: "absolute", bottom: -3, right: -3,
          background: `linear-gradient(135deg, ${C.yellow}, ${C.turquoise})`,
          borderRadius: 99, padding: "1px 5px", fontSize: 9, fontWeight: 900,
          color: C.bg, border: `1.5px solid ${C.bg}`, lineHeight: "14px",
        }}>{level}</div>
      )}
    </div>
  );
}

function ReactionBar({ postReactions, postId, activeReactions, onToggle }) {
  const [showPicker, setShowPicker] = useState(false);
  const myReactions = activeReactions[postId] || [];
  const total = totalReactions(postReactions);
  const topReactions = Object.entries(postReactions).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Quick like */}
        <button onClick={() => onToggle(postId, "like")} style={{
          background: myReactions.includes("like") ? C.turquoiseDim : "transparent",
          border: `1px solid ${myReactions.includes("like") ? C.turquoise + "40" : C.w10}`,
          borderRadius: 99, padding: "6px 12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ fontSize: 14 }}>❤️</span>
          <span style={{ fontSize: 12, color: myReactions.includes("like") ? C.turquoise : C.w40, fontWeight: 600 }}>
            {postReactions.like + (myReactions.includes("like") ? 1 : 0)}
          </span>
        </button>

        {/* Reaction picker trigger */}
        <button onClick={() => setShowPicker(!showPicker)} style={{
          background: "transparent", border: `1px solid ${C.w10}`, borderRadius: 99,
          padding: "6px 10px", cursor: "pointer", fontSize: 14,
          transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 12 }}>+</span>
          <span style={{ fontSize: 13, marginLeft: 2 }}>😊</span>
        </button>

        {/* My active reactions */}
        {myReactions.filter(r => r !== "like").map(rId => {
          const r = reactions.find(x => x.id === rId);
          return r ? (
            <button key={rId} onClick={() => onToggle(postId, rId)} style={{
              background: C.turquoiseDim, border: `1px solid ${C.turquoise}30`,
              borderRadius: 99, padding: "4px 8px", cursor: "pointer", fontSize: 13,
              transition: "all 0.2s",
            }}>{r.emoji}</button>
          ) : null;
        })}

        {/* Total reactions summary */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          {topReactions.map(([id]) => {
            const r = reactions.find(x => x.id === id);
            return <span key={id} style={{ fontSize: 12 }}>{r?.emoji}</span>;
          })}
          <span style={{ fontSize: 11, color: C.w40, fontWeight: 500 }}>{total}</span>
        </div>
      </div>

      {/* Picker dropdown */}
      {showPicker && (
        <div style={{
          position: "absolute", top: -52, left: 0, zIndex: 100,
          background: C.bgElevated, borderRadius: 16, padding: "8px 6px",
          display: "flex", gap: 2, border: `1px solid ${C.w10}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          animation: "fadeIn 0.15s ease",
        }}>
          {reactions.map(r => (
            <button key={r.id} onClick={() => { onToggle(postId, r.id); setShowPicker(false); }}
              title={r.label}
              style={{
                background: myReactions.includes(r.id) ? C.turquoiseDim : "transparent",
                border: "none", borderRadius: 12, padding: "8px 10px", cursor: "pointer",
                fontSize: 20, transition: "all 0.15s ease",
                transform: myReactions.includes(r.id) ? "scale(1.15)" : "scale(1)",
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.25)"}
              onMouseLeave={e => e.target.style.transform = myReactions.includes(r.id) ? "scale(1.15)" : "scale(1)"}
            >{r.emoji}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentSection({ comments, expanded }) {
  if (!comments.length) return null;
  const shown = expanded ? comments : comments.slice(0, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.w05}` }}>
      {shown.map((c, i) => {
        const u = users[c.user];
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar initials={u.avatar} size={26} color={u.color} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.w80 }}>{u.name.split(" ")[0]}</span>
              <span style={{ fontSize: 12, color: C.w60, marginLeft: 6 }}>{c.text}</span>
            </div>
          </div>
        );
      })}
      {!expanded && comments.length > 1 && (
        <span style={{ fontSize: 11, color: C.w40, cursor: "pointer", paddingLeft: 36 }}>
          Voir {comments.length - 1} autre{comments.length > 2 ? "s" : ""} commentaire{comments.length > 2 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// ─── POST CARDS ───

function BadgePost({ post, activeReactions, onToggleReaction }) {
  const u = users[post.user];
  const b = post.badge;
  const tier = tierStyle[b.tier];
  const isSecret = post.type === "badge_secret";

  return (
    <div style={{
      background: C.bgCard, borderRadius: 20, overflow: "hidden",
      border: `1px solid ${isSecret ? C.purple + "25" : C.w05}`,
    }}>
      {/* Glow header */}
      <div style={{
        padding: "24px 20px 20px", position: "relative", overflow: "hidden",
        background: isSecret
          ? `linear-gradient(135deg, ${C.purple}12, ${C.pink}08)`
          : `linear-gradient(135deg, ${tier.bg}, transparent)`,
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30, width: 120, height: 120,
          background: `radial-gradient(circle, ${tier.color}12, transparent 70%)`, borderRadius: "50%",
        }} />

        {/* User header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <Avatar initials={u.avatar} size={44} color={u.color} level={u.level} ring />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{u.name}</span>
              {isSecret && <span style={{ fontSize: 10, background: C.purpleDim, color: C.purple, padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>SECRET</span>}
            </div>
            <div style={{ fontSize: 11, color: C.w40 }}>{post.time} · {u.club}</div>
          </div>
          <div style={{ fontSize: 10, color: C.w40 }}>🏅</div>
        </div>

        {/* Badge visual — center stage */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${tier.bg}, ${C.bgCard})`,
            border: `3px solid ${tier.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 42, boxShadow: `0 0 30px ${tier.color}30, 0 0 60px ${tier.color}10`,
          }}>{b.icon}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.white, letterSpacing: -0.3 }}>{b.name}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
              background: tier.bg, borderRadius: 99, padding: "4px 14px",
              border: `1px solid ${tier.color}30`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: tier.color }}>{tierStyle[b.tier].label}</span>
              <span style={{ fontSize: 11, color: C.w40 }}>·</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.yellow }}>→ "{b.title}"</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description + interactions */}
      <div style={{ padding: "16px 20px 18px" }}>
        <p style={{ fontSize: 13, color: C.w60, lineHeight: 1.5, margin: "0 0 14px" }}>{post.description}</p>
        <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={onToggleReaction} />
        <CommentSection comments={post.comments} />
      </div>
    </div>
  );
}

function RecordPost({ post, activeReactions, onToggleReaction }) {
  const u = users[post.user];
  const r = post.record;

  return (
    <div style={{
      background: C.bgCard, borderRadius: 20, padding: 20,
      border: `1px solid ${C.w05}`,
    }}>
      {/* User header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar initials={u.avatar} size={44} color={u.color} level={u.level} ring />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{u.name}</span>
          <div style={{ fontSize: 11, color: C.w40 }}>{post.time} · {u.club}</div>
        </div>
        <div style={{
          background: C.yellowDim, borderRadius: 99, padding: "4px 10px",
          fontSize: 10, fontWeight: 800, color: C.yellow,
        }}>RECORD</div>
      </div>

      {/* Record card */}
      <div style={{
        background: `linear-gradient(135deg, ${C.yellowDim}, transparent)`,
        borderRadius: 14, padding: 18, marginBottom: 14,
        border: `1px solid ${C.yellow}15`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>{r.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.w40, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: C.yellow }}>{r.value}</span>
              <span style={{ fontSize: 12, color: C.w40, textDecoration: "line-through" }}>{r.previous}</span>
            </div>
          </div>
          <div style={{
            background: `${C.green}20`, borderRadius: 10, padding: "6px 10px",
            fontSize: 12, fontWeight: 800, color: C.green,
          }}>{r.improvement}</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: C.w60, lineHeight: 1.5, margin: "0 0 14px" }}>{post.description}</p>
      <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={onToggleReaction} />
      <CommentSection comments={post.comments} />
    </div>
  );
}

function ChallengePost({ post, activeReactions, onToggleReaction }) {
  const u = post.user ? users[post.user] : null;
  const ch = post.challenge;
  const isCollective = post.type === "challenge_collective";

  return (
    <div style={{
      background: C.bgCard, borderRadius: 20, overflow: "hidden",
      border: `1px solid ${ch.color}15`,
    }}>
      <div style={{
        padding: "20px 20px 16px",
        background: `linear-gradient(135deg, ${ch.color}10, transparent)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20, width: 100, height: 100,
          background: `radial-gradient(circle, ${ch.color}10, transparent 70%)`, borderRadius: "50%",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {u ? (
            <Avatar initials={u.avatar} size={44} color={u.color} level={u.level} ring />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `linear-gradient(135deg, ${ch.color}30, ${ch.color}10)`,
              border: `2px solid ${ch.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>{ch.icon}</div>
          )}
          <div style={{ flex: 1 }}>
            {u ? (
              <>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{u.name}</span>
                <div style={{ fontSize: 11, color: C.w40 }}>{post.time} · {u.club}</div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{post.club}</span>
                <div style={{ fontSize: 11, color: C.w40 }}>{post.time}</div>
              </>
            )}
          </div>
          <div style={{
            background: `${ch.color}20`, borderRadius: 99, padding: "4px 10px",
            fontSize: 10, fontWeight: 800, color: ch.color,
          }}>{isCollective ? "CLUB" : "DÉFI"}</div>
        </div>

        {/* Challenge achievement card */}
        <div style={{
          background: C.bgCard, borderRadius: 14, padding: 16,
          border: `1px solid ${ch.color}20`, textAlign: "center",
        }}>
          <span style={{ fontSize: 36 }}>{ch.icon}</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginTop: 8 }}>{ch.name}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: C.w40 }}>Objectif :</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: ch.color }}>{ch.target}</span>
            {ch.achieved && (
              <>
                <span style={{ fontSize: 11, color: C.w40 }}>→</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{ch.achieved}</span>
              </>
            )}
          </div>
          {ch.duration && (
            <div style={{ fontSize: 11, color: C.w40, marginTop: 6 }}>{ch.duration}</div>
          )}
          {ch.participants && (
            <div style={{ fontSize: 11, color: C.w40, marginTop: 6 }}>{ch.participants} nageurs ont contribué</div>
          )}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10,
            background: `${C.green}15`, borderRadius: 99, padding: "4px 12px",
          }}>
            <span style={{ fontSize: 12 }}>✅</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Complété</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 20px 18px" }}>
        <p style={{ fontSize: 13, color: C.w60, lineHeight: 1.5, margin: "0 0 14px" }}>{post.description}</p>
        <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={onToggleReaction} />
        <CommentSection comments={post.comments} expanded={isCollective} />
      </div>
    </div>
  );
}

function SuggestedFollows({ suggested, onFollow }) {
  return (
    <div style={{
      background: C.bgCard, borderRadius: 20, padding: 18,
      border: `1px solid ${C.w05}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.w60, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>👥</span> Nageurs à découvrir
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {suggested.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={u.avatar} size={40} color={u.color} level={u.level} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{u.name}</div>
              <div style={{ fontSize: 11, color: C.w40 }}>
                {u.club} · {u.mutualFollowers} ami{u.mutualFollowers > 1 ? "s" : ""} en commun
              </div>
            </div>
            <button onClick={() => onFollow(i)} style={{
              background: u.following ? C.w05 : C.turquoise,
              border: u.following ? `1px solid ${C.w10}` : "none",
              borderRadius: 99, padding: "6px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              color: u.following ? C.w40 : C.bg,
              transition: "all 0.2s ease",
            }}>
              {u.following ? "Suivi" : "Suivre"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function SwimLabFeed() {
  const [feedFilter, setFeedFilter] = useState("general");
  const [activeReactions, setActiveReactions] = useState({});
  const [suggested, setSuggested] = useState(suggestedUsers);
  const [visiblePosts, setVisiblePosts] = useState([]);

  // Staggered entrance animation
  useEffect(() => {
    const filtered = feedFilter === "club"
      ? feedPosts.filter(p => p.scope === "club")
      : feedPosts;
    setVisiblePosts([]);
    filtered.forEach((_, i) => {
      setTimeout(() => setVisiblePosts(prev => [...prev, i]), i * 120);
    });
  }, [feedFilter]);

  const filteredPosts = feedFilter === "club"
    ? feedPosts.filter(p => p.scope === "club")
    : feedPosts;

  const toggleReaction = (postId, reactionId) => {
    setActiveReactions(prev => {
      const current = prev[postId] || [];
      return {
        ...prev,
        [postId]: current.includes(reactionId)
          ? current.filter(r => r !== reactionId)
          : [...current, reactionId],
      };
    });
  };

  const toggleFollow = (idx) => {
    setSuggested(prev => prev.map((u, i) => i === idx ? { ...u, following: !u.following } : u));
  };

  const renderPost = (post, i) => {
    const isVisible = visiblePosts.includes(i);
    const wrapper = (children) => (
      <div key={post.id} style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {children}
      </div>
    );

    if (post.type === "badge" || post.type === "badge_secret")
      return wrapper(<BadgePost post={post} activeReactions={activeReactions} onToggleReaction={toggleReaction} />);
    if (post.type === "record")
      return wrapper(<RecordPost post={post} activeReactions={activeReactions} onToggleReaction={toggleReaction} />);
    if (post.type === "challenge" || post.type === "challenge_collective")
      return wrapper(<ChallengePost post={post} activeReactions={activeReactions} onToggleReaction={toggleReaction} />);
    return null;
  };

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.white,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Status bar */}
      <div style={{ padding: "12px 20px 6px", display: "flex", justifyContent: "space-between", fontSize: 12, color: C.w40 }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: 6 }}><span style={{ fontSize: 10 }}>📶</span><span style={{ fontSize: 10 }}>🔋</span></span>
      </div>

      {/* Header */}
      <div style={{
        padding: "10px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50, background: `${C.bg}F0`, backdropFilter: "blur(20px)",
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: C.turquoise }}>Swim</span>
          <span style={{ color: C.white }}>Feed</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{
            background: C.w05, border: `1px solid ${C.w10}`, borderRadius: 99,
            padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.w60,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            🔍 <span style={{ fontSize: 12 }}>Chercher</span>
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: C.w05,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, cursor: "pointer", border: `1px solid ${C.w10}`,
          }}>🔔</div>
        </div>
      </div>

      {/* Feed toggle */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ display: "flex", gap: 4, background: C.w05, borderRadius: 12, padding: 3 }}>
          {[
            { id: "general", label: "🌍 Général", count: feedPosts.length },
            { id: "club", label: "🏠 Mon Club", count: feedPosts.filter(p => p.scope === "club").length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFeedFilter(tab.id)} style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
              background: feedFilter === tab.id ? C.bgSurface : "transparent",
              color: feedFilter === tab.id ? C.white : C.w40,
              fontSize: 13, fontWeight: feedFilter === tab.id ? 700 : 500,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.25s ease",
              boxShadow: feedFilter === tab.id ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              {tab.label}
              <span style={{
                fontSize: 10, fontWeight: 700, background: feedFilter === tab.id ? C.turquoise + "25" : C.w05,
                color: feedFilter === tab.id ? C.turquoise : C.w40,
                borderRadius: 99, padding: "1px 6px",
              }}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stories-like top bar */}
      <div style={{
        padding: "0 20px 16px", display: "flex", gap: 12, overflowX: "auto",
      }}>
        {Object.entries(users).slice(0, 5).map(([key, u]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 56 }}>
            <div style={{
              padding: 2, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.turquoise}, ${C.pink})`,
            }}>
              <div style={{ padding: 2, borderRadius: "50%", background: C.bg }}>
                <Avatar initials={u.avatar} size={42} color={u.color} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: C.w40, fontWeight: 500 }}>{u.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* Feed posts */}
      <div style={{ padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredPosts.map((post, i) => {
          const rendered = renderPost(post, i);
          // Insert suggested follows after 2nd post
          if (i === 1 && feedFilter === "general") {
            return (
              <div key={`group-${i}`}>
                {rendered}
                <div style={{ marginTop: 14 }}>
                  <SuggestedFollows suggested={suggested} onFollow={toggleFollow} />
                </div>
              </div>
            );
          }
          return rendered;
        })}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420,
        background: `linear-gradient(transparent, ${C.bg} 30%)`,
        padding: "20px 20px 12px",
      }}>
        <div style={{
          background: `${C.bgCard}E0`, backdropFilter: "blur(20px)",
          borderRadius: 20, padding: "10px 8px", display: "flex", justifyContent: "space-around",
          border: `1px solid ${C.w05}`,
        }}>
          {[
            { icon: "🏠", label: "Home", active: false },
            { icon: "🌊", label: "Feed", active: true },
            { icon: "🎯", label: "Défis", active: false },
            { icon: "🏅", label: "Badges", active: false },
            { icon: "👤", label: "Profil", active: false },
          ].map((tab, i) => (
            <button key={i} style={{
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px", opacity: tab.active ? 1 : 0.4,
            }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                color: tab.active ? C.turquoise : C.w40,
              }}>{tab.label}</span>
              {tab.active && (
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.turquoise, marginTop: 1 }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
