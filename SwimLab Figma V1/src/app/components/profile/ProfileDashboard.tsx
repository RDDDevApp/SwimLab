import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router";
import { OptimizedImage } from "../OptimizedImage";
import {
  ArrowLeft,
  Waves,
  Zap,
  MessageCircle,
  Sparkles,
  Clock,
  Trophy,
  Star,
  Target,
  Crown,
  Medal,
  TrendingUp,
  Activity,
  ChevronRight,
  Lock,
  Share2,
} from "lucide-react";
import { SplashCoach } from "../coach/SplashCoach";



const THEME = {
  turquoise: {
    text: "text-indigo-500",
    bg: "bg-indigo-500",
    border: "border-indigo-500",
    light: "bg-indigo-50",
    glow: "shadow-indigo-400/50",
    gradient: "from-indigo-400 to-blue-500",
  },
  green: {
    text: "text-emerald-500",
    bg: "bg-emerald-500",
    border: "border-emerald-500",
    light: "bg-emerald-50",
    glow: "shadow-emerald-400/50",
    gradient: "from-emerald-400 to-green-600",
  },
  yellow: {
    text: "text-amber-500",
    bg: "bg-amber-500",
    border: "border-amber-500",
    light: "bg-amber-50",
    glow: "shadow-amber-400/50",
    gradient: "from-amber-300 to-orange-400",
  },
  pink: {
    text: "text-rose-500",
    bg: "bg-rose-500",
    border: "border-rose-500",
    light: "bg-rose-50",
    glow: "shadow-rose-400/50",
    gradient: "from-pink-400 to-rose-600",
  },
  purple: {
    text: "text-purple-500",
    bg: "bg-purple-500",
    border: "border-purple-500",
    light: "bg-purple-50",
    glow: "shadow-purple-400/50",
    gradient: "from-purple-400 to-indigo-600",
  },
};

const tierColors = {
  bronze: {
    text: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-400",
    label: "Bronze",
    indicator: "●",
  },
  silver: {
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-300",
    label: "Argent",
    indicator: "◆",
  },
  gold: {
    text: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    label: "Or",
    indicator: "★",
  },
  diamond: {
    text: "text-cyan-600",
    bg: "bg-cyan-100",
    border: "border-cyan-300",
    label: "Diamant",
    indicator: "💎",
  },
};

const familyColors: Record<
  string,
  { theme: any; icon: React.ElementType; label: string }
> = {
  distance: {
    theme: THEME.turquoise,
    icon: Waves,
    label: "Distance",
  },
  assiduité: {
    theme: THEME.green,
    icon: Clock,
    label: "Assiduité",
  },
  feedback: {
    theme: THEME.yellow,
    icon: MessageCircle,
    label: "Feedback",
  },
  intensité: {
    theme: THEME.pink,
    icon: Zap,
    label: "Intensité",
  },
  secret: {
    theme: THEME.purple,
    icon: Sparkles,
    label: "Secret",
  },
};

// ─── MOCK DATA ───
const mockUser = {
  name: "Sophie Dupont",
  title: "La Machine",
  level: 24,
  xp: 7420,
  xpNext: 8500,
  avatar:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  club: "Swim Club Paris",
  group: "Compétition A",
  stats: {
    totalKm: 234.5,
    assiduite: 92,
    avgRPE: 14.2,
    feedbacks: 187,
  },
  pinnedBadges: [
    {
      id: 1,
      name: "Force de la Mer",
      family: "distance",
      tier: "gold",
      icon: Waves,
    },
    {
      id: 2,
      name: "Indestructible",
      family: "intensité",
      tier: "diamond",
      icon: Zap,
    },
    {
      id: 3,
      name: "Le Caméléon",
      family: "secret",
      tier: "gold",
      icon: Sparkles,
    },
  ],
  badges: [
    {
      id: 1,
      name: "Force de la Mer",
      family: "distance",
      tier: "gold",
      icon: Waves,
      unlocked: true,
      date: "12 Fév",
    },
    {
      id: 4,
      name: "Première Vague",
      family: "distance",
      tier: "bronze",
      icon: Waves,
      unlocked: true,
      date: "3 Oct",
    },
    {
      id: 5,
      name: "Courant Marin",
      family: "distance",
      tier: "silver",
      icon: Waves,
      unlocked: true,
      date: "28 Nov",
    },
    {
      id: 6,
      name: "Légende des Océans",
      family: "distance",
      tier: "diamond",
      icon: Crown,
      unlocked: false,
      progress: 23,
    },
    {
      id: 7,
      name: "Ancré",
      family: "assiduité",
      tier: "bronze",
      icon: Clock,
      unlocked: true,
      date: "15 Oct",
    },
    {
      id: 8,
      name: "Insubmersible",
      family: "assiduité",
      tier: "silver",
      icon: Clock,
      unlocked: true,
      date: "8 Jan",
    },
    {
      id: 9,
      name: "Force Tranquille",
      family: "assiduité",
      tier: "gold",
      icon: Clock,
      unlocked: false,
      progress: 68,
    },
    {
      id: 10,
      name: "Première Voix",
      family: "feedback",
      tier: "bronze",
      icon: MessageCircle,
      unlocked: true,
      date: "5 Oct",
    },
    {
      id: 11,
      name: "Voix du Bassin",
      family: "feedback",
      tier: "silver",
      icon: MessageCircle,
      unlocked: true,
      date: "2 Déc",
    },
    {
      id: 12,
      name: "Oracle des Lignes",
      family: "feedback",
      tier: "gold",
      icon: MessageCircle,
      unlocked: false,
      progress: 93,
    },
    {
      id: 2,
      name: "Indestructible",
      family: "intensité",
      tier: "diamond",
      icon: Zap,
      unlocked: true,
      date: "1 Mar",
    },
    {
      id: 13,
      name: "Premières Flammes",
      family: "intensité",
      tier: "bronze",
      icon: Zap,
      unlocked: true,
      date: "20 Oct",
    },
    {
      id: 14,
      name: "Cœur en Feu",
      family: "intensité",
      tier: "silver",
      icon: Zap,
      unlocked: true,
      date: "15 Déc",
    },
    {
      id: 3,
      name: "Le Caméléon",
      family: "secret",
      tier: "gold",
      icon: Sparkles,
      unlocked: true,
      date: "22 Fév",
    },
    {
      id: 15,
      name: "Le Phénix",
      family: "secret",
      tier: "gold",
      icon: Sparkles,
      unlocked: true,
      date: "10 Jan",
    },
    {
      id: 16,
      name: "L'Équilibriste",
      family: "secret",
      tier: "silver",
      icon: Sparkles,
      unlocked: false,
      progress: 0,
    },
    {
      id: 17,
      name: "Le Fantôme",
      family: "secret",
      tier: "silver",
      icon: Sparkles,
      unlocked: false,
      progress: 0,
    },
  ],
};

const mockChallenges = {
  monthly: [
    {
      id: 1,
      title: "Marathon Collectif",
      subtitle: "Le club doit nager 500 km en mars",
      type: "collectif",
      icon: Waves,
      theme: THEME.turquoise,
      target: 500,
      current: 342,
      unit: "km",
      endDate: "22 jours",
      topContributors: [
        { name: "Sophie D.", value: 48.2, isYou: true },
        { name: "Marc L.", value: 41.7, isYou: false },
        { name: "Alice B.", value: 38.9, isYou: false },
      ],
    },
    {
      id: 2,
      title: "Mois du Papillon",
      subtitle: "Nage 10 km en papillon ce mois",
      type: "individuel",
      icon: Activity,
      theme: THEME.pink,
      target: 10,
      current: 6.3,
      unit: "km",
      endDate: "22 jours",
      participants: 18,
      completed: 3,
    },
    {
      id: 3,
      title: "Streak Challenge",
      subtitle: "Plus longue série de présences",
      type: "compétitif",
      icon: Zap,
      theme: THEME.yellow,
      leaderboard: [
        { name: "Claire R.", value: 14, isYou: false },
        { name: "Sophie D.", value: 12, isYou: true },
        { name: "Thomas K.", value: 11, isYou: false },
      ],
      endDate: "22 jours",
    },
  ],
  permanent: [
    {
      id: 10,
      name: "Légende des Océans",
      family: "distance",
      current: 234.5,
      target: 1000,
      unit: "km",
      tier: "diamond",
      icon: Crown,
    },
    {
      id: 11,
      name: "Force Tranquille",
      family: "assiduité",
      current: 17,
      target: 25,
      unit: "sem.",
      tier: "gold",
      icon: Clock,
    },
    {
      id: 12,
      name: "Oracle des Lignes",
      family: "feedback",
      current: 187,
      target: 200,
      unit: "fb",
      tier: "gold",
      icon: MessageCircle,
    },
  ],
};

const xpBreakdown = [
  {
    label: "Entraînements complétés",
    xp: 3200,
    icon: Activity,
  },
  { label: "Feedbacks donnés", xp: 1870, icon: MessageCircle },
  { label: "Badges débloqués", xp: 1500, icon: Medal },
  { label: "Défis mensuels", xp: 600, icon: Target },
  { label: "Bonus streak", xp: 250, icon: Zap },
];

const mockRecords = [
  {
    event: "50m NL",
    time: "28.45",
    date: "12 Mar 2026",
    type: "short",
  },
  {
    event: "100m NL",
    time: "1:02.30",
    date: "05 Fév 2026",
    type: "short",
  },
  {
    event: "200m 4N",
    time: "2:34.15",
    date: "22 Jan 2026",
    type: "long",
  },
  {
    event: "50m Pap",
    time: "31.20",
    date: "18 Nov 2025",
    type: "short",
  },
];

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 30;
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else setDisplay(start);
    }, 20);
    return () => clearInterval(interval);
  }, [value]);
  return (
    <span>
      {Number.isInteger(value)
        ? Math.floor(display)
        : display.toFixed(1)}
      {suffix}
    </span>
  );
}

function BadgeVisual({
  badge,
  size = "md",
  glow = false,
}: {
  badge: any;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}) {
  const tier =
    tierColors[badge.tier as keyof typeof tierColors];
  const family = familyColors[badge.family];
  const isLocked = !badge.unlocked;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };
  const Icon = badge.icon;

  return (
    <div
      className={`relative flex flex-col items-center gap-2 ${isLocked ? "opacity-50 grayscale" : ""} transition-all duration-300`}
    >
      <div
        className={`
        relative rounded-full flex items-center justify-center
        ${sizeClasses[size]}
        ${isLocked ? "bg-slate-100 border-2 border-slate-200" : `bg-gradient-to-br ${family.theme.gradient} border-[3px] ${tier.border}`}
        ${glow && !isLocked ? `shadow-lg shadow-${family.theme.text.split("-")[1]}-400/40` : ""}
      `}
      >
        {isLocked ? (
          <Lock
            size={iconSizes[size]}
            className="text-slate-400"
          />
        ) : (
          <Icon size={iconSizes[size]} className="text-white" />
        )}

        {!isLocked && (
          <div className="absolute -bottom-1 -right-1 w-1/3 h-1/3 min-w-[20px] min-h-[20px] bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-[10px] font-bold text-slate-700">
            {tier.indicator}
          </div>
        )}
      </div>
      {size !== "sm" && (
        <span
          className={`text-xs text-center leading-tight font-bold max-w-[80px] ${isLocked ? "text-slate-400" : "text-slate-700"}`}
        >
          {isLocked && badge.family === "secret"
            ? "???"
            : badge.name}
        </span>
      )}
    </div>
  );
}

export const ProfileDashboardPage: React.FC = () => {
  const location = useLocation();

  // Parse hash to set initial tab
  const [activeTab, setActiveTab] = useState(() => {
    if (
      location.pathname === "/stats" ||
      location.pathname === "/records" ||
      location.hash === "#stats"
    )
      return "stats";
    if (
      location.pathname === "/challenges" ||
      location.hash === "#challenges"
    )
      return "challenges";
    return "profile";
  });

  const [filterFamily, setFilterFamily] = useState("all");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [challengeSubTab, setChallengeSubTab] =
    useState("monthly");

  const filteredBadges =
    filterFamily === "all"
      ? mockUser.badges
      : mockUser.badges.filter(
          (b) => b.family === filterFamily,
        );

  const unlockedCount = mockUser.badges.filter(
    (b) => b.unlocked,
  ).length;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-24">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />

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

      <div className="relative z-10 container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/solo"
            className="p-3 rounded-2xl bg-white/60 hover:bg-white transition-all border border-white/80 shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Tableau de Bord
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile Hero */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg shadow-blue-900/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30">
                    <OptimizedImage
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      className="w-full h-full rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                    <Star
                      size={10}
                      className="text-yellow-400 fill-yellow-400"
                    />{" "}
                    LVL {mockUser.level}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-none">
                    {mockUser.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 mt-1">
                    <Zap size={14} className="fill-amber-500" />{" "}
                    {mockUser.title}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {mockUser.club} • {mockUser.group}
                  </p>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>{mockUser.xp.toLocaleString()} XP</span>
                  <span>
                    {mockUser.xpNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(mockUser.xp / mockUser.xpNext) * 100}%`,
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Badges Épinglés
                </h3>
                <div className="flex justify-center gap-4">
                  {mockUser.pinnedBadges.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <BadgeVisual
                        badge={{ ...b, unlocked: true }}
                        size="md"
                        glow
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/60 hover:bg-white text-cyan-600 font-bold rounded-2xl border border-white/60 shadow-sm transition-all hover:shadow-md backdrop-blur-xl">
              <Share2 size={18} /> Partager mon profil
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Top Navigation Tabs */}
            <div className="flex p-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-x-auto hide-scrollbar">
              {[
                {
                  id: "profile",
                  label: "Profil & Stats",
                  icon: TrendingUp,
                },
                {
                  id: "stats",
                  label: "Performances",
                  icon: Activity,
                },
                {
                  id: "challenges",
                  label: "Défis & Badges",
                  icon: Trophy,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-cyan-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/20"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: PROFILE & STATS */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Distance Totale",
                      value: mockUser.stats.totalKm,
                      suffix: " km",
                      icon: Waves,
                      color: "text-cyan-500",
                      bg: "bg-cyan-50",
                    },
                    {
                      label: "Assiduité",
                      value: mockUser.stats.assiduite,
                      suffix: "%",
                      icon: Clock,
                      color: "text-emerald-500",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "RPE Moyen",
                      value: mockUser.stats.avgRPE,
                      suffix: "/20",
                      icon: Zap,
                      color: "text-rose-500",
                      bg: "bg-rose-50",
                    },
                    {
                      label: "Feedbacks",
                      value: mockUser.stats.feedbacks,
                      suffix: "",
                      icon: MessageCircle,
                      color: "text-amber-500",
                      bg: "bg-amber-50",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <div
                          className={`p-1.5 rounded-lg ${s.bg}`}
                        >
                          <s.icon
                            size={14}
                            className={s.color}
                          />
                        </div>
                        <span className="text-xs font-bold truncate">
                          {s.label}
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-black ${s.color}`}
                      >
                        <AnimatedNumber
                          value={s.value}
                          suffix={s.suffix}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sources d'XP */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Star
                      className="text-amber-500 fill-amber-500"
                      size={20}
                    />{" "}
                    Sources d'XP
                  </h3>
                  <div className="space-y-4">
                    {xpBreakdown.map((item, i) => {
                      const pct = (item.xp / mockUser.xp) * 100;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-cyan-500">
                            <item.icon size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1.5">
                              <span className="text-sm font-bold text-slate-700">
                                {item.label}
                              </span>
                              <span className="text-sm font-black text-cyan-600">
                                +{item.xp.toLocaleString()} XP
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{
                                  duration: 1,
                                  delay: i * 0.1,
                                }}
                                className="h-full bg-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: STATS & PERFORMANCES */}
            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Evolution Chart Placeholder */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <TrendingUp
                        className="text-cyan-500"
                        size={20}
                      />{" "}
                      Évolution des allures
                    </h3>
                    <select className="bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1.5 outline-none">
                      <option>100m NL</option>
                      <option>50m Pap</option>
                      <option>200m 4N</option>
                    </select>
                  </div>
                  <div className="h-48 w-full bg-gradient-to-b from-cyan-50/50 to-transparent rounded-xl border border-cyan-100/50 flex flex-col items-center justify-center text-slate-400">
                    {/* Replace with Recharts in a real scenario */}
                    <Activity
                      size={32}
                      className="mb-2 text-cyan-200"
                    />
                    <p className="text-sm font-medium">
                      Graphique de progression
                    </p>
                  </div>
                </div>

                {/* Mes Records */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Medal
                      className="text-amber-500"
                      size={20}
                    />{" "}
                    Mes Records
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockRecords.map((record, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-lg">
                              {record.event}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                              {record.type === "short"
                                ? "25m"
                                : "50m"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {record.date}
                          </span>
                        </div>
                        <div className="text-xl font-black text-cyan-600 font-mono tracking-tight group-hover:scale-105 transition-transform">
                          {record.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: CHALLENGES & BADGES */}
            {activeTab === "challenges" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Sub-tabs for Challenges */}
                <div className="flex bg-white/50 p-1.5 rounded-xl border border-slate-200 shadow-inner max-w-sm mx-auto mb-2">
                  <button
                    onClick={() =>
                      setChallengeSubTab("monthly")
                    }
                    className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${challengeSubTab === "monthly" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🎯 Ce Mois
                  </button>
                  <button
                    onClick={() =>
                      setChallengeSubTab("permanent")
                    }
                    className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${challengeSubTab === "permanent" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🏔️ Permanents
                  </button>
                  <button
                    onClick={() =>
                      setChallengeSubTab("collection")
                    }
                    className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${challengeSubTab === "collection" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🏅 Collection
                  </button>
                </div>

                {/* MONTHLY CHALLENGES */}
                {challengeSubTab === "monthly" && (
                  <div className="space-y-4">
                    {/* Collective Challenge */}
                    {mockChallenges.monthly
                      .filter((c) => c.type === "collectif")
                      .map((ch) => (
                        <div
                          key={ch.id}
                          className="relative overflow-hidden bg-gradient-to-br from-white/80 to-cyan-50/80 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-6 shadow-lg shadow-cyan-900/5"
                        >
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl" />

                          <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                                <ch.icon size={28} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-800">
                                  {ch.title}
                                </h3>
                                <p className="text-sm font-medium text-slate-500">
                                  {ch.subtitle}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full border border-cyan-200">
                              Collectif
                            </span>
                          </div>

                          <div className="text-center mb-6">
                            <div className="text-4xl font-black text-cyan-600 font-mono tracking-tighter">
                              <AnimatedNumber
                                value={ch.current}
                              />{" "}
                              <span className="text-xl text-slate-400 font-bold">
                                / {ch.target} {ch.unit}
                              </span>
                            </div>
                            <div className="mt-4 h-3 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(ch.current / ch.target) * 100}%`,
                                }}
                                transition={{
                                  duration: 1.5,
                                  ease: "easeOut",
                                }}
                                className="h-full bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              🏆 Top Contributeurs
                            </h4>
                            <div className="space-y-2">
                              {ch.topContributors?.map(
                                (p, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-2 rounded-xl ${p.isYou ? "bg-amber-50 border border-amber-200/50" : "bg-white/50 border border-transparent"}`}
                                  >
                                    <span
                                      className={`w-6 text-center font-black ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-orange-500"}`}
                                    >
                                      {i + 1}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">
                                      {p.name.charAt(0)}
                                    </div>
                                    <span
                                      className={`flex-1 text-sm font-bold ${p.isYou ? "text-amber-700" : "text-slate-700"}`}
                                    >
                                      {p.name}{" "}
                                      {p.isYou && (
                                        <span className="text-[10px] text-amber-500 ml-1">
                                          ← Toi
                                        </span>
                                      )}
                                    </span>
                                    <span className="font-black text-cyan-600">
                                      {p.value} km
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Other challenges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockChallenges.monthly
                        .filter((c) => c.type !== "collectif")
                        .map((ch) => (
                          <div
                            key={ch.id}
                            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={`w-12 h-12 rounded-xl ${ch.theme.bg} text-white flex items-center justify-center shadow-lg ${ch.theme.glow} shrink-0`}
                              >
                                <ch.icon size={24} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-md font-black text-slate-800 leading-tight mb-1">
                                  {ch.title}
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                  {ch.subtitle}
                                </p>
                              </div>
                            </div>

                            {ch.type === "individuel" ? (
                              <div>
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-2xl font-black text-slate-800">
                                    {ch.current}{" "}
                                    <span className="text-sm text-slate-400">
                                      / {ch.target}
                                    </span>
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                    {Math.round(
                                      (ch.current / ch.target) *
                                        100,
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(ch.current / ch.target) * 100}%`,
                                    }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${ch.theme.bg} rounded-full`}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5 mt-2">
                                {ch.leaderboard?.map((p, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${p.isYou ? "bg-amber-50 text-amber-700 font-bold" : "text-slate-600 font-medium"}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 text-xs font-black opacity-50">
                                        {i + 1}.
                                      </span>
                                      <span>{p.name}</span>
                                    </div>
                                    <span className="font-black">
                                      {p.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* PERMANENT CHALLENGES */}
                {challengeSubTab === "permanent" && (
                  <div className="space-y-4">
                    {mockChallenges.permanent.map((ch) => {
                      const family = familyColors[ch.family];
                      const tier =
                        tierColors[
                          ch.tier as keyof typeof tierColors
                        ];
                      const pct =
                        (ch.current / ch.target) * 100;
                      return (
                        <div
                          key={ch.id}
                          className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-sm flex items-center gap-5"
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 ${tier.border} ${tier.bg}`}
                          >
                            <ch.icon
                              size={24}
                              className={tier.text}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="text-sm font-black text-slate-800">
                                {ch.name}
                              </h3>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${tier.bg} ${tier.text}`}
                              >
                                {tier.label}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                              <span
                                className={`text-lg font-black ${family.theme.text}`}
                              >
                                {ch.current}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                / {ch.target} {ch.unit}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full ${family.theme.bg} rounded-full`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* BADGE COLLECTION */}
                {challengeSubTab === "collection" && (
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-800">
                          Collection
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {unlockedCount} /{" "}
                          {mockUser.badges.length} badges
                          débloqués
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterFamily("all")}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filterFamily === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                        >
                          Tous
                        </button>
                        {Object.entries(familyColors).map(
                          ([key, fam]) => (
                            <button
                              key={key}
                              onClick={() =>
                                setFilterFamily(key)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 border ${
                                filterFamily === key
                                  ? `${fam.theme.bg} text-white border-transparent`
                                  : `bg-white ${fam.theme.text} ${fam.theme.border} hover:${fam.theme.light}`
                              }`}
                            >
                              <fam.icon size={12} />{" "}
                              <span className="hidden sm:inline">
                                {fam.label}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div
                      className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4 ${!showAllBadges ? "max-h-[300px] overflow-hidden" : ""} transition-all duration-500 relative`}
                    >
                      {filteredBadges.map((b, i) => (
                        <motion.div
                          key={b.id + b.family}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-center"
                        >
                          <BadgeVisual badge={b} size="lg" />
                        </motion.div>
                      ))}

                      {!showAllBadges &&
                        filteredBadges.length > 10 && (
                          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-2">
                            <button
                              onClick={() =>
                                setShowAllBadges(true)
                              }
                              className="px-6 py-2 bg-white rounded-full text-sm font-bold text-cyan-600 shadow-md border border-cyan-100 hover:scale-105 transition-transform"
                            >
                              Voir tout
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Coach */}
        <SplashCoach
          floating
          initialState="impressed"
          messageOverride="Impressionnant ce profil. Mais tu n'as pas encore le badge 'Légende des Océans', si je ne m'abuse ?"
        />
      </div>
    </div>
  );
};