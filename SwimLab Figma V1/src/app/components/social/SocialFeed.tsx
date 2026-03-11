import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { OptimizedImage } from '../OptimizedImage';
import { 
  Heart, MessageCircle, Share2, Search, MapPin, 
  Trophy, Timer, ArrowLeft, Users, Verified, MoreHorizontal, Filter,
  TrendingUp, Target, Medal, Droplets, Flame, Plus, CheckCircle2, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { SplashCoach } from '../coach/SplashCoach';



const reactionsList = [
  { id: "like", emoji: "❤️", label: "J'aime" },
  { id: "splash", emoji: "💦", label: "Splash" },
  { id: "fire", emoji: "🔥", label: "En feu" },
  { id: "muscle", emoji: "💪", label: "Force" },
  { id: "wave", emoji: "🌊", label: "Respect" },
];

const users = {
  sophie: { name: "Sophie Dupont", title: "La Machine", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", level: 24, color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-400", club: "Swim Club Paris", following: true },
  marc: { name: "Marc Lefebvre", title: "Le Diesel", avatar: "https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9?auto=format&fit=crop&w=150&q=80", level: 18, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-400", club: "Swim Club Paris", following: true },
  claire: { name: "Claire Rousseau", title: "Le Phénix", avatar: "https://images.unsplash.com/photo-1642876311043-deeb88de6903?auto=format&fit=crop&w=150&q=80", level: 31, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-400", club: "Swim Club Paris", following: false },
  thomas: { name: "Thomas Karimi", title: "Le Requin", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", level: 42, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-400", club: "Aqua Lyon", following: false },
  alice: { name: "Alice Bertrand", title: "Le Têtard", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", level: 8, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-400", club: "Swim Club Paris", following: true },
  emma: { name: "Emma Vidal", title: "L'Analyste", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", level: 15, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-400", club: "Dauphins Marseille", following: true },
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
    challenge: { name: "Mois du Papillon", icon: "🦋", target: "10 km", color: "pink", duration: "En 18 jours" },
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
    id: 6, type: "challenge_collective", time: "Il y a 6h", scope: "club",
    club: "Swim Club Paris",
    challenge: { name: "Marathon Collectif Mars", icon: "🏊", target: "500 km", achieved: "500.3 km", color: "cyan", participants: 27 },
    description: "Le club a atteint l'objectif collectif de 500 km ce mois !",
    reactions: { like: 27, splash: 27, fire: 19, muscle: 22, wave: 27 },
    comments: [
      { user: "marc", text: "ON L'A FAIT 🎉" },
      { user: "alice", text: "Fière de ce club ❤️" },
    ],
  },
];

const tierStyles: Record<string, { bg: string; text: string; border: string; label: string; glow: string }> = {
  bronze: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Bronze", glow: "shadow-orange-500/20" },
  silver: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", label: "Argent", glow: "shadow-slate-500/20" },
  gold: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", label: "Or", glow: "shadow-yellow-500/30" },
  diamond: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-300", label: "Diamant", glow: "shadow-cyan-500/40" },
};

// ─── UTILS ───
function totalReactions(r: Record<string, number>) { 
  return Object.values(r).reduce((a, b) => a + b, 0); 
}

// ─── COMPONENTS ───

const Avatar = ({ user, size = "w-10 h-10", showRing = false }: { user: any; size?: string; showRing?: boolean }) => (
  <div className="relative shrink-0">
    <OptimizedImage 
      src={user?.avatar} 
      alt={user?.name || "User"} 
      className={`${size} rounded-full object-cover border-2 border-white shadow-sm ${showRing && user?.border ? `ring-2 ring-offset-2 ${user.border.replace('border-', 'ring-')}` : ''}`}
    />
    {user.level && (
      <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-[1.5px] border-white shadow-sm">
        {user.level}
      </div>
    )}
  </div>
);

const ReactionBar = ({ postReactions, postId, activeReactions, onToggle }: any) => {
  const [showPicker, setShowPicker] = useState(false);
  const myReactions = activeReactions[postId] || [];
  const total = totalReactions(postReactions);
  const topReactions = Object.entries(postReactions).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="relative mt-3">
      <div className="flex items-center gap-3">
        {/* Quick like */}
        <button 
          onClick={() => onToggle(postId, "like")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm font-bold ${
            myReactions.includes("like") 
              ? 'bg-rose-50 border-rose-200 text-rose-600' 
              : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>❤️</span>
          <span>{postReactions.like + (myReactions.includes("like") ? 1 : 0)}</span>
        </button>

        {/* Reaction picker trigger */}
        <div className="relative">
          <button 
            onClick={() => setShowPicker(!showPicker)} 
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white/60 hover:bg-slate-50 text-slate-500 transition-colors shadow-sm"
          >
            <Plus size={14} strokeWidth={3} />
          </button>

          {/* Picker dropdown */}
          <AnimatePresence>
            {showPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl p-1.5 flex gap-1 shadow-xl border border-slate-100"
              >
                {reactionsList.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => { onToggle(postId, r.id); setShowPicker(false); }}
                    title={r.label}
                    className={`p-2 rounded-xl text-xl hover:scale-125 transition-transform ${
                      myReactions.includes(r.id) ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My active reactions */}
        {myReactions.filter((r: string) => r !== "like").map((rId: string) => {
          const r = reactionsList.find(x => x.id === rId);
          return r ? (
            <button 
              key={rId} 
              onClick={() => onToggle(postId, rId)} 
              className="bg-cyan-50 border border-cyan-100 px-2 py-1 rounded-full text-sm hover:bg-cyan-100 transition-colors"
            >
              {r.emoji}
            </button>
          ) : null;
        })}

        {/* Total reactions summary */}
        <div className="ml-auto flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <div className="flex -space-x-1">
            {topReactions.map(([id]: any) => {
              const r = reactionsList.find(x => x.id === id);
              return <span key={id} className="text-xs">{r?.emoji}</span>;
            })}
          </div>
          <span className="text-xs font-bold text-slate-500 ml-1">{total}</span>
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ comments, expanded = false }: any) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  if (!comments || !comments.length) return null;
  
  const shown = isExpanded ? comments : comments.slice(0, 1);
  
  return (
    <div className="mt-4 pt-4 border-t border-slate-100/50 space-y-3">
      {shown.map((c: any, i: number) => {
        const u = (users as any)[c.user];
        return (
          <div key={i} className="flex gap-2 items-start">
            <Avatar user={u} size="w-6 h-6" />
            <div className="bg-white/60 rounded-2xl rounded-tl-none px-3 py-2 border border-slate-100 text-sm">
              <span className="font-bold text-slate-800 mr-2">{u.name.split(" ")[0]}</span>
              <span className="text-slate-600">{c.text}</span>
            </div>
          </div>
        );
      })}
      {!isExpanded && comments.length > 1 && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-xs font-bold text-slate-400 hover:text-cyan-600 pl-8 transition-colors"
        >
          Voir {comments.length - 1} autre{comments.length > 2 ? "s" : ""} commentaire{comments.length > 2 ? "s" : ""}
        </button>
      )}
    </div>
  );
};


// ─── MAIN COMPONENT ───
export const SocialFeed: React.FC = () => {
  const [feedFilter, setFeedFilter] = useState<'general' | 'club'>('general');
  const [activeReactions, setActiveReactions] = useState<Record<number, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleReaction = (postId: number, reactionId: string) => {
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

  const filteredPosts = feedFilter === "club"
    ? feedPosts.filter(p => p.scope === "club")
    : feedPosts;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-24">
      
      {/* Liquid Glass Background */}
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

      <div className="relative z-10 container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/solo" 
              className="p-3 rounded-2xl bg-white/60 hover:bg-white transition-all border border-white/80 shadow-sm backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Le Bassin <Droplets className="text-indigo-500" size={24} />
              </h1>
              <p className="text-sm text-slate-500 font-medium">Activité de la communauté</p>
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:bg-white shadow-sm transition-all border border-white/40 md:hidden">
            <Search size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="hidden md:flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un nageur, un record..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-700 font-medium placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Toggle & Stories */}
        <div className="mb-8">
          <div className="flex bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-1 shadow-sm mb-6 inline-flex">
            {[
              { id: 'general', label: '🌍 Général', count: feedPosts.length },
              { id: 'club', label: '🏠 Mon Club', count: feedPosts.filter(p => p.scope === "club").length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFeedFilter(tab.id as any)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  feedFilter === tab.id 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  feedFilter === tab.id ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Stories Bar */}
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {Object.values(users).map((u, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[64px]">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500">
                  <div className="bg-white p-0.5 rounded-full">
                    <OptimizedImage src={u.avatar} alt={u.name} className="w-14 h-14 rounded-full object-cover" />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 truncate w-full text-center">{u.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {/* 1. BADGE POST */}
                {(post.type === "badge" || post.type === "badge_secret") && (
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-blue-900/5 group relative">
                    
                    {/* Header Glow Area */}
                    <div className={`p-5 pb-0 relative overflow-hidden ${post.type === "badge_secret" ? 'bg-gradient-to-br from-purple-50 to-pink-50' : tierStyles[post.badge!.tier].bg}`}>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 blur-2xl rounded-full" />
                      
                      <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className="flex gap-3 items-center">
                          <Avatar user={(users as any)[post.user]} showRing />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-800">{(users as any)[post.user].name}</h3>
                              {post.type === "badge_secret" && (
                                <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Secret</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {post.time} • {(users as any)[post.user].club}
                            </div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400">
                          <Medal size={16} />
                        </div>
                      </div>

                      {/* Badge Display */}
                      <div className="flex flex-col items-center justify-center py-4 relative z-10">
                        <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl mb-3 shadow-xl ${tierStyles[post.badge!.tier].border} border-4 ${tierStyles[post.badge!.tier].glow}`}>
                          {post.badge?.icon}
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">{post.badge?.name}</h2>
                        <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-1.5 border border-white shadow-sm">
                          <span className={`text-xs font-black uppercase ${tierStyles[post.badge!.tier].text}`}>{tierStyles[post.badge!.tier].label}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-600">"{post.badge?.title}"</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 relative z-10 bg-white/50">
                      <p className="text-slate-700 text-sm font-medium mb-2">{post.description}</p>
                      <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={toggleReaction} />
                      <CommentSection comments={post.comments} />
                    </div>
                  </div>
                )}

                {/* 2. RECORD POST */}
                {post.type === "record" && (
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-blue-900/5 p-5 group">
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-3 items-center">
                        <Avatar user={(users as any)[post.user]} />
                        <div>
                          <h3 className="font-bold text-slate-800">{(users as any)[post.user].name}</h3>
                          <div className="text-xs text-slate-500 font-medium">{post.time} • {(users as any)[post.user].club}</div>
                        </div>
                      </div>
                      <div className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Record
                      </div>
                    </div>

                    {/* Record Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
                      <div className="text-4xl">{post.record?.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-amber-800/60 uppercase tracking-wide mb-1">{post.record?.label}</div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black text-amber-600">{post.record?.value}</span>
                          <span className="text-sm font-bold text-slate-400 line-through decoration-slate-300">{post.record?.previous}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl">
                        {post.record?.improvement}
                      </div>
                    </div>

                    <p className="text-slate-700 text-sm font-medium mb-2">{post.description}</p>
                    <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={toggleReaction} />
                    <CommentSection comments={post.comments} />
                  </div>
                )}

                {/* Insert Suggested Follows after the first post */}
                {i === 0 && feedFilter === 'general' && (
                  <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-100 rounded-3xl p-5 shadow-sm mt-6 mb-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users size={16} className="text-cyan-500" /> Nageurs à découvrir
                    </h3>
                    <div className="flex flex-col gap-3">
                      {[users.thomas, users.claire].map((u, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/60 rounded-2xl p-2.5 border border-white">
                          <div className="flex items-center gap-3">
                            <Avatar user={u} size="w-10 h-10" />
                            <div>
                              <div className="text-sm font-bold text-slate-800">{u.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{u.club} • {idx === 0 ? '3' : '5'} amis en commun</div>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-cyan-700 bg-white hover:bg-cyan-50 px-4 py-1.5 rounded-full border border-cyan-100 shadow-sm transition-colors">
                            Suivre
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CHALLENGE POST */}
                {(post.type === "challenge" || post.type === "challenge_collective") && (
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-blue-900/5 group relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/40 blur-3xl rounded-full pointer-events-none" />
                    
                    <div className="p-5 relative z-10">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex gap-3 items-center">
                          {post.user ? (
                            <Avatar user={(users as any)[post.user]} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white border-2 border-white shadow-sm">
                              <Users size={20} />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {post.user ? (users as any)[post.user].name : post.club}
                            </h3>
                            <div className="text-xs text-slate-500 font-medium">
                              {post.time} {post.user && `• ${(users as any)[post.user].club}`}
                            </div>
                          </div>
                        </div>
                        <div className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {post.type === "challenge_collective" ? "Club" : "Défi"}
                        </div>
                      </div>

                      {/* Challenge Card */}
                      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-center mb-4 relative overflow-hidden">
                        <div className="text-4xl mb-3">{post.challenge?.icon}</div>
                        <h4 className="text-lg font-black text-slate-800 mb-3">{post.challenge?.name}</h4>
                        
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Objectif</div>
                            <div className="text-lg font-black text-slate-700">{post.challenge?.target}</div>
                          </div>
                          {post.challenge?.achieved && (
                            <>
                              <div className="text-slate-300"><TrendingUp size={20} /></div>
                              <div className="text-left">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Atteint</div>
                                <div className="text-lg font-black text-emerald-500">{post.challenge.achieved}</div>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                          {post.challenge?.participants && (
                            <span className="flex items-center gap-1"><Users size={14} className="text-cyan-500"/> {post.challenge.participants} participants</span>
                          )}
                          {post.challenge?.duration && (
                            <span className="flex items-center gap-1"><Timer size={14} className="text-purple-500"/> {post.challenge.duration}</span>
                          )}
                        </div>

                        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                          <CheckCircle2 size={16} strokeWidth={3} />
                        </div>
                      </div>

                      <p className="text-slate-700 text-sm font-medium mb-2">{post.description}</p>
                      <ReactionBar postReactions={post.reactions} postId={post.id} activeReactions={activeReactions} onToggle={toggleReaction} />
                      <CommentSection comments={post.comments} expanded={post.type === "challenge_collective"} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Splash Coach */}
        <SplashCoach floating initialState="idle" messageOverride="Une vraie communauté de passionnés. Continue de nager, et bientôt ce sera toi sur le feed avec un badge secret !" />
      </div>
    </div>
  );
};
