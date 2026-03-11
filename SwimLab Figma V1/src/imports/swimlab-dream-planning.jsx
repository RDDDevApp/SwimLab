import { useState } from "react";

const COLORS = {
  deepBlue: "#0A1628",
  darkBlue: "#0F2140",
  mediumBlue: "#162D50",
  turquoise: "#00D4D4",
  turquoiseGlow: "#00E5E5",
  yellow: "#FFB800",
  pink: "#FF3B8F",
  coral: "#FF6B6B",
  green: "#00E68A",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  textMuted: "#7B8CA8",
  textLight: "#A8B8D0",
  cardBg: "rgba(22, 45, 80, 0.6)",
  cardBorder: "rgba(0, 212, 212, 0.15)",
};

const sections = [
  {
    id: "hero",
    title: "La Vue Planning de Rêve",
    subtitle: "SwimLab Coach Calendar",
  },
  { id: "header", title: "1. Le Header Intelligent" },
  { id: "navigation", title: "2. Navigation Temporelle" },
  { id: "weekview", title: "3. Vue Semaine — Le Cœur" },
  { id: "slotcard", title: "4. Anatomie d'une Slot Card" },
  { id: "monthview", title: "5. Vue Mois — Vision Macro" },
  { id: "filters", title: "6. Filtres & Groupes" },
  { id: "swimmerside", title: "7. Côté Nageur" },
  { id: "animations", title: "8. Animations & Transitions" },
  { id: "interactions", title: "9. Interactions Clés" },
  { id: "mobile", title: "10. Mobile-First Details" },
];

function NavDot({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: active ? 24 : 8,
        height: 8,
        borderRadius: 4,
        background: active ? COLORS.turquoise : "rgba(255,255,255,0.2)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        padding: 0,
      }}
    />
  );
}

function GlowBadge({ color, children, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: small ? "2px 8px" : "4px 12px",
        borderRadius: 20,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 12px ${color}15`,
      }}
    >
      {children}
    </span>
  );
}

function MockSlotCard({ type, title, group, time, distance, feedbackRate, status, empty }) {
  const typeColors = {
    endurance: COLORS.turquoise,
    sprint: COLORS.yellow,
    technique: COLORS.purple,
    recovery: COLORS.green,
    empty: COLORS.textMuted,
  };

  const typeIcons = {
    endurance: "🏊",
    sprint: "⚡",
    technique: "🎯",
    recovery: "🧘",
    empty: "📦",
  };

  const color = typeColors[type] || COLORS.textMuted;

  return (
    <div
      style={{
        background: empty
          ? "rgba(22, 45, 80, 0.3)"
          : COLORS.cardBg,
        border: `1px solid ${empty ? "rgba(255,255,255,0.06)" : color + "25"}`,
        borderRadius: 16,
        padding: "14px 16px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {!empty && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: "100%",
            background: `linear-gradient(180deg, ${color}, ${color}40)`,
            borderRadius: "3px 0 0 3px",
          }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, marginBottom: 4 }}>
            {time}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>
            {typeIcons[type]} {title}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textLight }}>
            👥 {group}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {distance && (
            <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 4 }}>
              {distance}
            </div>
          )}
          {feedbackRate !== undefined && (
            <GlowBadge color={feedbackRate > 70 ? COLORS.green : COLORS.yellow} small>
              {feedbackRate}% feedback
            </GlowBadge>
          )}
          {status === "emarge" && (
            <GlowBadge color={COLORS.coral} small>
              À émarger
            </GlowBadge>
          )}
          {empty && (
            <div
              style={{
                fontSize: 11,
                color: COLORS.turquoise,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Assigner
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px",
          borderRadius: 20,
          background: "rgba(0, 212, 212, 0.1)",
          border: "1px solid rgba(0, 212, 212, 0.2)",
          fontSize: 12,
          color: COLORS.turquoise,
          fontWeight: 600,
          marginBottom: 24,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        🏊 SwimLab — Vision Planning
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          lineHeight: 1.1,
          margin: "0 0 16px",
          background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.turquoise} 50%, ${COLORS.yellow} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        La Vue Planning
        <br />
        de Rêve
      </h1>
      <p
        style={{
          fontSize: 16,
          color: COLORS.textLight,
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        Description complète de l'écran calendrier coach & nageur — chaque détail, chaque animation,
        chaque interaction pensée pour un feel{" "}
        <span style={{ color: COLORS.turquoise, fontWeight: 600 }}>sport-tech premium</span>.
      </p>
    </div>
  );
}

function SectionBlock({ id, title, children }) {
  return (
    <section id={id} style={{ padding: "40px 0" }}>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: COLORS.white,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: `2px solid ${COLORS.turquoise}25`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailBlock({ icon, title, children }) {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        backdropFilter: "blur(10px)",
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.turquoise, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span> {title}
      </h3>
      <div style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function SpecItem({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: COLORS.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || COLORS.white }}>{value}</span>
    </div>
  );
}

function ColorSwatch({ color, name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, background: color, border: "1px solid rgba(255,255,255,0.1)" }} />
      <span style={{ fontSize: 12, color: COLORS.textLight }}>{name}</span>
      <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{color}</span>
    </div>
  );
}

export default function SwimLabDreamPlanning() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeView, setActiveView] = useState("week");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(170deg, ${COLORS.deepBlue} 0%, ${COLORS.darkBlue} 40%, #0D1F3C 100%)`,
        color: COLORS.white,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow effects */}
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.turquoise}08, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: -300,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.pink}05, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        {/* HERO */}
        <HeroSection />

        {/* NAV DOTS */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
          {sections.map((s, i) => (
            <NavDot
              key={s.id}
              active={activeSection === i}
              onClick={() => {
                setActiveSection(i);
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              label={s.title}
            />
          ))}
        </div>

        {/* ========================= */}
        {/* SECTION 1 — HEADER        */}
        {/* ========================= */}
        <SectionBlock id="header" title="1. Le Header Intelligent">
          <DetailBlock icon="🧭" title="Structure du Header">
            <p>Le header est fixe (sticky) et contient trois zones alignées horizontalement :</p>
            <p>
              <strong style={{ color: COLORS.white }}>Zone gauche</strong> — Le sélecteur de vue :{" "}
              deux boutons pill <em>Semaine</em> / <em>Mois</em> avec un fond animé qui slide de l'un
              à l'autre (spring animation 300ms). Le bouton actif a un fond turquoise translucide
              avec un subtil glow.
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Zone centre</strong> — Le titre contextuel : en
              vue semaine, affiche <em>"27 Jan — 2 Fév 2026"</em> en bold. En vue mois, affiche{" "}
              <em>"Janvier 2026"</em>. Le texte change avec un fade + slide vertical (150ms).
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Zone droite</strong> — Bouton{" "}
              <em>"Aujourd'hui"</em> sous forme de pill turquoise, visible uniquement quand on n'est
              pas sur la semaine/mois courant. Apparaît avec un scale-in depuis 0.8.
            </p>
          </DetailBlock>

          {/* Mini mockup header */}
          <div
            style={{
              background: "rgba(15, 33, 64, 0.8)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1px solid ${COLORS.cardBorder}`,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3 }}>
              {["Semaine", "Mois"].map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v === "Semaine" ? "week" : "month")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    background: activeView === (v === "Semaine" ? "week" : "month") ? `${COLORS.turquoise}20` : "transparent",
                    color: activeView === (v === "Semaine" ? "week" : "month") ? COLORS.turquoise : COLORS.textMuted,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.white }}>
              {activeView === "week" ? "27 Jan — 2 Fév" : "Janvier 2026"}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.turquoise,
                padding: "4px 10px",
                borderRadius: 12,
                background: `${COLORS.turquoise}15`,
                border: `1px solid ${COLORS.turquoise}30`,
              }}
            >
              Aujourd'hui
            </span>
          </div>

          <DetailBlock icon="🎚️" title="Barre de Filtres (sous le header)">
            <p>
              Juste sous le header, une rangée scrollable horizontalement de <strong style={{ color: COLORS.white }}>chips de groupes</strong>.
              Chaque chip affiche le nom du groupe avec un dot de couleur (chaque groupe a sa couleur unique).
              Tap pour toggle on/off. Chip active = fond coloré translucide + border colorée. Chip inactive = grisée.
            </p>
            <p>
              Dernier chip spécial : <em>"Tous"</em> pour réinitialiser les filtres. Un compteur subtil 
              sous les chips indique <em>"3/5 groupes affichés"</em>.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 2 — NAVIGATION    */}
        {/* ========================= */}
        <SectionBlock id="navigation" title="2. Navigation Temporelle">
          <DetailBlock icon="👆" title="Swipe Horizontal">
            <p>
              La navigation entre semaines/mois se fait par <strong style={{ color: COLORS.white }}>swipe horizontal</strong> (gesture natif React Native).
              Swipe gauche = semaine suivante, swipe droite = semaine précédente.
              Le contenu sort en sliding avec un léger parallax : les cartes bougent à 1x, les dates à 0.8x.
            </p>
            <p>
              En complément, deux chevrons discrets <code style={{ color: COLORS.turquoise, fontSize: 12 }}>‹ ›</code> sur les côtés
              du titre de semaine pour navigation tap.
            </p>
          </DetailBlock>

          <DetailBlock icon="📍" title="Indicateur Aujourd'hui">
            <p>
              Le jour courant a un traitement spécial : une ligne verticale turquoise glowing à gauche
              du label du jour, et le label est en turquoise bold au lieu du blanc standard.
              Une <strong style={{ color: COLORS.white }}>pulsation douce</strong> (2s loop) sur le dot turquoise
              à côté du numéro du jour.
            </p>
          </DetailBlock>

          <DetailBlock icon="⏳" title="Pull-to-Refresh">
            <p>
              Pull-to-refresh custom : au lieu du spinner iOS standard, un petit nageur stylisé (SVG)
              qui fait un mouvement de crawl pendant le chargement. Couleur turquoise sur fond deep blue.
              Durée animation : 1.2s loop.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 3 — VUE SEMAINE   */}
        {/* ========================= */}
        <SectionBlock id="weekview" title="3. Vue Semaine — Le Cœur de l'App">
          <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 20, lineHeight: 1.7 }}>
            La vue semaine est le mode par défaut. Elle affiche les 7 jours de la semaine en <strong style={{ color: COLORS.white }}>scroll vertical</strong>,
            chaque jour étant une section avec ses slots. C'est le cœur de l'expérience coach.
          </p>

          <DetailBlock icon="📐" title="Layout de chaque jour">
            <p>
              Chaque jour est une section collapsable (mais ouverte par défaut pour la semaine courante).
              Le header du jour contient : le nom du jour + la date (<em>"Lundi 27 Janvier"</em>), 
              un dot de couleur si c'est aujourd'hui, et un mini compteur d'entraînements à droite (<em>"2 sessions"</em>).
            </p>
            <p>
              Les slots du jour sont empilées verticalement avec 8px de gap. Si un jour n'a aucun slot,
              il affiche un état vide élégant : icône ondulation d'eau + texte <em>"Pas de créneau"</em> en gris doux.
            </p>
          </DetailBlock>

          {/* MOCKUP VUE SEMAINE */}
          <div
            style={{
              background: "rgba(10, 22, 40, 0.6)",
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${COLORS.cardBorder}`,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
              Mockup interactif
            </div>

            {/* Lundi */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>Lundi 27 Janvier</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>2 sessions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <MockSlotCard
                  type="endurance"
                  title="Endurance 3000m"
                  group="Compétition"
                  time="18h00 — 19h30"
                  distance="3000m"
                  feedbackRate={82}
                />
                <MockSlotCard
                  type="technique"
                  title="Éducatifs Papillon"
                  group="Loisir"
                  time="19h30 — 20h30"
                  distance="1800m"
                  feedbackRate={65}
                />
              </div>
            </div>

            {/* Mardi */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.turquoise, boxShadow: `0 0 8px ${COLORS.turquoise}` }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.turquoise }}>Mardi 28 Janvier</span>
                <GlowBadge color={COLORS.turquoise} small>Aujourd'hui</GlowBadge>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <MockSlotCard
                  type="sprint"
                  title="Sprint Séries"
                  group="Compétition"
                  time="18h00 — 19h30"
                  distance="2500m"
                  status="emarge"
                />
              </div>
            </div>

            {/* Mercredi */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>Mercredi 29 Janvier</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>1 session</span>
              </div>
              <MockSlotCard type="empty" title="Slot vide" group="Compétition" time="18h00 — 19h30" empty />
            </div>
          </div>

          <DetailBlock icon="🎨" title="Codes Couleur des Types">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <ColorSwatch color={COLORS.turquoise} name="Endurance" />
              <ColorSwatch color={COLORS.yellow} name="Sprint" />
              <ColorSwatch color={COLORS.purple} name="Technique" />
              <ColorSwatch color={COLORS.green} name="Récupération" />
              <ColorSwatch color={COLORS.coral} name="Autre" />
              <ColorSwatch color={COLORS.textMuted} name="Slot vide" />
            </div>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 4 — SLOT CARD     */}
        {/* ========================= */}
        <SectionBlock id="slotcard" title="4. Anatomie d'une Slot Card">
          <DetailBlock icon="🃏" title="Card avec Entraînement Assigné">
            <p>Chaque carte de slot contient, de haut en bas :</p>
            <p>
              <strong style={{ color: COLORS.turquoise }}>Barre latérale colorée</strong> — 3px à gauche, couleur du type d'entraînement, 
              gradient du haut (opaque) vers le bas (transparent). C'est l'identité visuelle immédiate.
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Ligne horaire</strong> — En petit, gris doux : <em>"18h00 — 19h30 · Piscine Municipale"</em>
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Titre + Icône type</strong> — En bold blanc, précédé de l'emoji du type. 
              Ex : <em>"🏊 Endurance 3000m"</em>
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Groupe</strong> — Avec dot couleur du groupe : <em>"👥 Compétition"</em>
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Zone droite (stats)</strong> — Distance totale en bold turquoise, 
              et en dessous un badge feedback : pourcentage en vert si {">"} 70%, jaune sinon. 
              Ou badge "À émarger" en coral si l'entraînement vient de se terminer.
            </p>
          </DetailBlock>

          <DetailBlock icon="📦" title="Card Slot Vide">
            <p>
              Fond plus transparent, pas de barre latérale colorée. Le titre affiche <em>"📦 Slot vide"</em> en gris.
              Un CTA discret en turquoise à droite : <em>"+ Assigner"</em>. Au tap, ouvre un bottom sheet
              avec la liste des entraînements publiés et un bouton "Créer nouveau".
            </p>
          </DetailBlock>

          <DetailBlock icon="✨" title="États Visuels de la Card">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              <SpecItem label="Entraînement futur (assigné)" value="Fond standard, badge 'Planifié'" color={COLORS.turquoise} />
              <SpecItem label="Entraînement en cours / terminé, pas émargé" value="Badge pulsant 'À émarger'" color={COLORS.coral} />
              <SpecItem label="Émargé, feedbacks en attente" value="Badge jaune + compteur progressif" color={COLORS.yellow} />
              <SpecItem label="Émargé, feedbacks complets" value="Badge vert + stats RPE" color={COLORS.green} />
              <SpecItem label="Slot vide" value="Fond léger, CTA '+ Assigner'" color={COLORS.textMuted} />
            </div>
          </DetailBlock>

          <DetailBlock icon="📊" title="Mini-Stats Intégrées (après émargement)">
            <p>
              Quand le coach a fait l'émargement, la card s'enrichit avec une ligne supplémentaire en bas :
              une mini-barre de progression qui se remplit au fur et à mesure des feedbacks reçus.
              À droite de la barre : <em>"8/12 feedbacks"</em>. La barre passe de jaune ({"<"}60%) à turquoise (60-80%) à vert ({">"}80%).
            </p>
            <p>
              Si un nageur a un RPE {">"} 17, un petit triangle d'alerte ⚠️ apparaît à côté du compteur.
              Au tap sur cette zone stats, navigation directe vers l'écran de feedbacks détaillé.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 5 — VUE MOIS      */}
        {/* ========================= */}
        <SectionBlock id="monthview" title="5. Vue Mois — Vision Macro">
          <DetailBlock icon="📅" title="Grille Mensuelle">
            <p>
              Grille 7 colonnes (L-M-M-J-V-S-D) × 4-5 lignes. Chaque cellule représente un jour.
              Les jours avec entraînements ont des <strong style={{ color: COLORS.white }}>dots empilés</strong> en bas de cellule,
              chaque dot correspondant à un slot. La couleur du dot = couleur du type d'entraînement.
            </p>
            <p>
              Le jour courant a un cercle turquoise derrière le numéro (comme Google Calendar).
              Les jours passés ont un fond légèrement plus sombre. Les jours hors du mois courant
              sont très estompés (opacity 0.3).
            </p>
          </DetailBlock>

          {/* MOCKUP GRILLE MOIS */}
          <div
            style={{
              background: "rgba(10, 22, 40, 0.6)",
              borderRadius: 20,
              padding: 16,
              border: `1px solid ${COLORS.cardBorder}`,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
              Mockup — Vue Mois
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, paddingBottom: 6 }}>{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const isToday = day === 28;
                const hasSessions = [1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 19, 20, 22, 24, 26, 27, 28, 29, 31].includes(day);
                const dotColors = day % 3 === 0
                  ? [COLORS.turquoise, COLORS.yellow]
                  : day % 2 === 0
                  ? [COLORS.turquoise]
                  : hasSessions
                  ? [COLORS.purple]
                  : [];
                return (
                  <div
                    key={day}
                    style={{
                      padding: "6px 2px 4px",
                      borderRadius: 8,
                      background: isToday ? `${COLORS.turquoise}20` : "transparent",
                      border: isToday ? `1px solid ${COLORS.turquoise}40` : "1px solid transparent",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? COLORS.turquoise : day < 28 ? COLORS.textLight : COLORS.textMuted }}>
                      {day}
                    </div>
                    <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 3 }}>
                      {dotColors.map((c, di) => (
                        <div key={di} style={{ width: 4, height: 4, borderRadius: 2, background: c }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DetailBlock icon="📋" title="Tap sur un Jour → Modal Détail">
            <p>
              Au tap sur un jour, un <strong style={{ color: COLORS.white }}>bottom sheet</strong> remonte en spring animation (200ms),
              affichant la liste des slots de ce jour avec le même format que les slot cards de la vue semaine.
              Le fond s'assombrit avec un overlay 50% noir. Swipe down pour fermer.
            </p>
            <p>
              Ce bottom sheet a un header avec la date complète + un bouton "Voir la semaine" qui switch
              automatiquement en vue semaine positionnée sur ce jour.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 6 — FILTRES       */}
        {/* ========================= */}
        <SectionBlock id="filters" title="6. Filtres & Organisation par Groupes">
          <DetailBlock icon="🏷️" title="Chips de Groupes">
            <p>
              Chaque groupe a une couleur unique assignée automatiquement dans l'ordre :
              turquoise → rose → jaune → violet → corail → vert. La chip affiche un dot de cette couleur + le nom du groupe.
            </p>
            <p>
              Quand un groupe est filtré, les slots des autres groupes disparaissent avec un fade out (200ms),
              et les slots restantes se réorganisent avec un layout animation.
              Les jours sans aucun slot restant après filtrage affichent un mini message : <em>"Aucun créneau [Groupe] ce jour"</em>.
            </p>
          </DetailBlock>

          <DetailBlock icon="🔍" title="Filtres Avancés (V0.5+)">
            <p>
              Un bouton filtre (icône entonnoir) à côté des chips ouvre un bottom sheet avec des filtres supplémentaires :
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Par type</strong> — Toggle endurance / sprint / technique / récup / autre
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Par statut</strong> — Slots vides / Planifiés / À émarger / Terminés
            </p>
            <p>
              <strong style={{ color: COLORS.white }}>Par lieu</strong> — Si le coach utilise plusieurs piscines
            </p>
            <p>
              Le nombre de filtres actifs est indiqué par un petit badge compteur sur l'icône entonnoir.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 7 — NAGEUR        */}
        {/* ========================= */}
        <SectionBlock id="swimmerside" title="7. Côté Nageur — Ma Semaine">
          <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 20, lineHeight: 1.7 }}>
            La vue nageur est différente mais garde la même identité visuelle. Le nageur a deux modes : une
            <strong style={{ color: COLORS.white }}> vue grille semaine</strong> (inspirée Google Calendar) et une
            <strong style={{ color: COLORS.white }}> vue liste</strong> (verticale).
          </p>

          <DetailBlock icon="📊" title="Vue Grille Semaine (Nageur)">
            <p>
              7 colonnes (Lun → Dim), une grille horaire de 17h à 21h (plage typique).
              Les entraînements apparaissent comme des blocs colorés positionnés à la bonne heure,
              dont la hauteur correspond à la durée (90min = bloc plus grand que 60min).
            </p>
            <p>
              Le bloc affiche : l'emoji type + nom court + le badge de statut (🔒 futur, ✅ feedback donné, 🟠 feedback en attente).
              Au tap, navigation vers le détail de l'entraînement.
            </p>
          </DetailBlock>

          <DetailBlock icon="📝" title="Vue Liste (Nageur)">
            <p>
              Scroll vertical des 14 prochains jours. Chaque entraînement est une card similaire au coach mais simplifiée :
              pas de stats feedback, remplacées par le statut personnel du nageur.
            </p>
            <p>
              Les cards des entraînements <strong style={{ color: COLORS.white }}>futurs</strong> ont un overlay
              <em> "🔒 Détails disponibles après l'entraînement"</em> — le titre et la distance sont visibles
              mais les blocks détaillés sont floutés (blur 8px).
            </p>
            <p>
              Les cards des entraînements <strong style={{ color: COLORS.white }}>passés sans feedback</strong> ont un
              CTA pulsant en orange : <em>"Donne ton feedback"</em> — ce CTA a une micro-animation heartbeat
              toutes les 3 secondes pour attirer l'attention.
            </p>
          </DetailBlock>

          <DetailBlock icon="🏠" title="Ma Semaine Type (V0.5)">
            <p>
              Page dédiée accessible depuis le profil nageur. Affiche les créneaux récurrents
              du nageur sous forme de planning visuel fixe (pas lié à une date spécifique).
              Utile pour partager à sa famille / son employeur. Bouton "Partager" pour exporter en image
              ou ajouter à Google Calendar.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 8 — ANIMATIONS    */}
        {/* ========================= */}
        <SectionBlock id="animations" title="8. Animations & Transitions">
          <DetailBlock icon="🎬" title="Page Transitions">
            <p>
              La transition entre écrans utilise un <strong style={{ color: COLORS.white }}>shared element transition</strong> :
              quand le coach tape sur une slot card dans le calendrier, la card s'agrandit et morphe
              vers l'écran de détail. L'arrière-plan se floute progressivement. Durée : 350ms, easing cubic-bezier(0.16, 1, 0.3, 1).
            </p>
          </DetailBlock>

          <DetailBlock icon="💫" title="Micro-interactions">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              <SpecItem label="Tap sur slot card" value="Scale 0.97 → 1 (100ms) + haptic light" color={COLORS.turquoise} />
              <SpecItem label="Long press sur slot" value="Scale 0.95 + menu contextuel (éditer, dupliquer, supprimer)" color={COLORS.yellow} />
              <SpecItem label="Swipe semaine" value="Parallax content 1x / dates 0.8x (300ms spring)" color={COLORS.turquoise} />
              <SpecItem label="Toggle Semaine ↔ Mois" value="Crossfade 200ms + layout morph" color={COLORS.purple} />
              <SpecItem label="Feedback badge pulse" value="Scale 1→1.05→1 (3s loop) sur badge orange 'Donner feedback'" color={COLORS.coral} />
              <SpecItem label="Pull to refresh" value="Nageur SVG crawl animation (1.2s loop)" color={COLORS.turquoise} />
              <SpecItem label="Slot card apparition" value="Staggered fade-in + slide-up (50ms delay entre cards)" color={COLORS.green} />
              <SpecItem label="Nouveau feedback reçu" value="Counter bump animation (scale 1.2 → 1) sur le compteur" color={COLORS.yellow} />
            </div>
          </DetailBlock>

          <DetailBlock icon="🌊" title="Loading States">
            <p>
              Pas de spinner classique. Le loading utilise des <strong style={{ color: COLORS.white }}>skeleton screens</strong>
              animés avec un shimmer turquoise qui pulse de gauche à droite. Les skeletons reproduisent
              exactement la forme des slot cards (rectangles arrondis avec les mêmes proportions).
            </p>
            <p>
              Pour les chargements plus longs ({">"} 2s), un <strong style={{ color: COLORS.white }}>skeleton + texte</strong> :
              <em>"Chargement de ta semaine..."</em> en gris doux, avec des ondulations d'eau subtiles en arrière-plan.
            </p>
          </DetailBlock>

          <DetailBlock icon="🛠️" title="Stack Animations">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              <SpecItem label="Bibliothèque principale" value="React Native Reanimated 3" color={COLORS.turquoise} />
              <SpecItem label="Layout animations" value="Moti (wrapper Reanimated)" color={COLORS.yellow} />
              <SpecItem label="Gestures" value="React Native Gesture Handler" color={COLORS.purple} />
              <SpecItem label="Shared transitions" value="React Navigation Shared Element" color={COLORS.green} />
              <SpecItem label="Haptics" value="expo-haptics (light / medium / heavy)" color={COLORS.pink} />
              <SpecItem label="SVG animations" value="react-native-svg + Reanimated" color={COLORS.coral} />
            </div>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 9 — INTERACTIONS  */}
        {/* ========================= */}
        <SectionBlock id="interactions" title="9. Interactions Clés">
          <DetailBlock icon="➕" title="Créer/Assigner depuis le Calendrier">
            <p>
              Tap sur slot vide → <strong style={{ color: COLORS.white }}>bottom sheet "Assigner un entraînement"</strong> remonte.
              Le bottom sheet a deux sections :
            </p>
            <p>
              <strong style={{ color: COLORS.turquoise }}>Entraînements existants</strong> — Liste scrollable
              des entraînements publiés, chacun avec titre + type badge + distance. Barre de recherche en haut.
              Au tap sur un entraînement, preview rapide (titre, distance, nombre de blocks) puis bouton "Assigner".
            </p>
            <p>
              <strong style={{ color: COLORS.yellow }}>Créer nouveau</strong> — Gros bouton en bas du sheet :
              <em>"+ Créer un nouvel entraînement"</em>. Redirige vers l'éditeur de workout avec le slot pré-sélectionné
              comme destination d'assignation.
            </p>
          </DetailBlock>

          <DetailBlock icon="✅" title="Émarger depuis le Calendrier">
            <p>
              Le bouton "Émarger" apparaît sur la slot card 30 minutes avant l'heure de début.
              C'est un bouton coral pulsant. Au tap, navigation vers l'écran d'émargement full-screen.
            </p>
            <p>
              L'écran d'émargement affiche la liste des nageurs avec des toggles (on/off).
              Tous sont cochés par défaut. En haut : compteur animé <em>"14/15 présents"</em> qui update
              en temps réel au toggle. Bouton "Valider" en bas — confirmation avec haptic success.
            </p>
          </DetailBlock>

          <DetailBlock icon="📈" title="Voir les Stats depuis le Calendrier">
            <p>
              Tap sur la zone de stats d'une slot card (le badge feedback) → navigation vers l'écran
              de stats de l'entraînement. Transition : la zone de stats s'agrandit et morphe vers le header
              de la page stats (shared element).
            </p>
          </DetailBlock>

          <DetailBlock icon="🔔" title="FAB (Floating Action Button)">
            <p>
              En bas à droite de la vue calendrier, un FAB turquoise avec icône "+".
              Au tap, un menu radial apparaît avec 3 options en éventail :
            </p>
            <p>🏊 <strong style={{ color: COLORS.white }}>Créer entraînement</strong> (accès rapide)</p>
            <p>📅 <strong style={{ color: COLORS.white }}>Créer créneau</strong> (nouveau slot)</p>
            <p>🤖 <strong style={{ color: COLORS.white }}>IA Générer</strong> (génération IA — V1)</p>
            <p>
              Le FAB rotation 45° quand le menu est ouvert (+ → ×). Overlay semi-transparent derrière.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* ========================= */}
        {/* SECTION 10 — MOBILE       */}
        {/* ========================= */}
        <SectionBlock id="mobile" title="10. Mobile-First Details">
          <DetailBlock icon="📱" title="Safe Areas & Dimensions">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              <SpecItem label="Header height" value="56px (+ safe area top)" color={COLORS.turquoise} />
              <SpecItem label="Filter chips height" value="44px" color={COLORS.turquoise} />
              <SpecItem label="Slot card height" value="~90px (avec stats) / ~70px (sans)" color={COLORS.turquoise} />
              <SpecItem label="Day header height" value="36px" color={COLORS.turquoise} />
              <SpecItem label="FAB size" value="56px (touche 48px minimum)" color={COLORS.turquoise} />
              <SpecItem label="Bottom tab bar" value="64px (+ safe area bottom)" color={COLORS.turquoise} />
              <SpecItem label="Card border radius" value="16px (partout)" color={COLORS.turquoise} />
              <SpecItem label="Spacing entre cards" value="8px" color={COLORS.turquoise} />
              <SpecItem label="Padding horizontal" value="16px" color={COLORS.turquoise} />
            </div>
          </DetailBlock>

          <DetailBlock icon="🌙" title="Dark Mode Natif">
            <p>
              Le design est <strong style={{ color: COLORS.white }}>dark-first</strong> par défaut — 
              c'est l'identité SwimLab. Les couleurs profondes évoquent la profondeur de la piscine
              et le turquoise lumineux évoque l'eau éclairée. Pas de mode light prévu en V0.
            </p>
            <p>
              Palette fond : deep blue #0A1628 → dark blue #0F2140 → medium blue #162D50.
              Les cards utilisent du fond translucide avec backdrop-blur pour créer de la profondeur.
            </p>
          </DetailBlock>

          <DetailBlock icon="♿" title="Accessibilité">
            <p>
              Tous les éléments interactifs ont une taille minimum de 44×44px.
              Les badges de statut utilisent des icônes en plus des couleurs (pas juste la couleur pour différencier).
              Les labels sont explicites pour les screen readers.
              Le contraste texte/fond respecte WCAG AA minimum sur tous les éléments textuels.
            </p>
          </DetailBlock>

          <DetailBlock icon="⚡" title="Performance">
            <p>
              La vue semaine utilise une <strong style={{ color: COLORS.white }}>FlatList</strong> (pas un ScrollView)
              pour les jours, avec un renderItem optimisé. Chaque slot card est mémoïsée (React.memo).
              Les images (si avatars) sont lazy-loaded. Le swipe de semaine précharge la semaine suivante
              et précédente en arrière-plan.
            </p>
          </DetailBlock>
        </SectionBlock>

        {/* FOOTER */}
        <div style={{ textAlign: "center", padding: "48px 0 60px", borderTop: `1px solid ${COLORS.cardBorder}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>
            SwimLab — Vision Planning Complète
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            V0 → V0.5 · Stack: React Native + Expo + Supabase + Reanimated + Moti
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <GlowBadge color={COLORS.turquoise}>Coach View</GlowBadge>
            <GlowBadge color={COLORS.pink}>Swimmer View</GlowBadge>
            <GlowBadge color={COLORS.yellow}>V0.5 Features</GlowBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
