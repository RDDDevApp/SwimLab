import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { OptimizedImage } from '../OptimizedImage';
import {
  Trophy, TrendingUp, Calendar, Plus, Droplets,
  Zap, Target, Award, ChevronRight, Clock, Flame,
  Star, Activity, Home as HomeIcon, Settings, ArrowUpRight,
  Play, Sparkles, Timer, Users, Medal
} from 'lucide-react';
import { SplashCoach } from '../coach/SplashCoach';

// Consistent background


interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  to: string;
  color: string;
  delay?: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, subtitle, icon: Icon, to, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-indigo-900/5 transition-all hover:shadow-2xl hover:bg-white/60 cursor-pointer"
  >
    <Link to={to} className="absolute inset-0 z-10" />
    
    <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity`}>
      <ArrowUpRight className={`w-5 h-5 ${color}`} />
    </div>

    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    
    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{title}</h3>
    <p className="text-sm font-medium text-slate-500">{subtitle}</p>
    
    {/* Decorative blob */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color.replace('text-', 'bg-').replace('600', '400').replace('500', '400')}`} />
  </motion.div>
);

export const SoloSwimmerHome: React.FC = () => {
  const navigate = useNavigate();
  const [coachState, setCoachState] = useState("idle");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: 'transform' }}
          className="absolute top-20 left-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 md:py-12 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
              <Droplets className="w-5 h-5" />
              <span>SwimMaster</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Alex</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg max-w-xl">
              Prêt à nager ? Ton objectif hebdomadaire est atteint à 65%.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 w-full md:w-auto"
          >
             <Link to="/" className="p-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
               Vue Club
             </Link>
             <button className="p-3 rounded-xl bg-white/50 hover:bg-white transition-colors text-slate-600 border border-white/80 shadow-sm backdrop-blur-md relative">
                <Settings className="w-6 h-6" />
             </button>
             <Link to="/swimmer-profile" className="flex flex-1 md:flex-none justify-between items-center gap-3 bg-white/50 backdrop-blur-xl pl-4 pr-2 py-2 rounded-2xl border border-white/80 shadow-sm hover:bg-white/80 transition-colors cursor-pointer">
                <span className="font-bold text-slate-700 text-sm">Alex B.</span>
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
                />
             </Link>
          </motion.div>
        </div>

        {/* Hero Card / AI Workout Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 rounded-[32px] p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-5 border border-white/10 shadow-sm">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Suggestion IA
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Séance Pyramide - 2000m</h2>
              <p className="text-indigo-50 mb-8 max-w-lg font-medium text-lg">
                Basé sur ta dernière séance de vitesse. Objectif : Travailler l'allure sur des distances croissantes puis décroissantes.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                  <p className="text-xs text-indigo-100 uppercase font-bold mb-1">Durée estimée</p>
                  <p className="text-2xl font-black">55 min</p>
                </div>
                 <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                  <p className="text-xs text-indigo-100 uppercase font-bold mb-1">Calories</p>
                  <p className="text-2xl font-black">~650 kcal</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button className="bg-white text-indigo-700 hover:bg-slate-50 transition-colors px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl group w-full md:w-auto text-lg">
                <Play className="w-6 h-6 fill-current" />
                Démarrer la séance
              </button>
              <button className="bg-indigo-700/40 hover:bg-indigo-700/60 backdrop-blur-md text-white border border-white/20 transition-colors px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                <Settings className="w-5 h-5" />
                Personnaliser
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard 
            title="Nouvelle Séance" 
            subtitle="Créer un entraînement libre" 
            icon={Timer} 
            to="/workout" 
            color="text-indigo-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Planning" 
            subtitle="Prochains entraînements" 
            icon={Calendar} 
            to="/swimmer-planning" 
            color="text-blue-600"
            delay={0.5}
          />
          <QuickActionCard 
            title="Mon activité" 
            subtitle="Analyse et Défis" 
            icon={Activity} 
            to="/stats" 
            color="text-cyan-600"
            delay={0.6}
          />
          <QuickActionCard 
            title="Le Bassin" 
            subtitle="Communauté et amis" 
            icon={Users} 
            to="/social" 
            color="text-indigo-500"
            delay={0.7}
          />
        </div>

        {/* Weekly Stats & Personal Bests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Workouts Solo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">Mes Prochaines Séances</h3>
                 <p className="text-slate-500 text-sm font-medium">Semaine en cours</p>
              </div>
              <Link to="/swimmer-planning" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors text-center">Voir le planning</Link>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[
                { date: 'Aujourd\'hui', day: 'MAR', title: 'Seuil Aérobie', time: '07h00 - 08h15', dist: '2.5 km', color: 'bg-indigo-500', bg: 'bg-white/60', border: 'border-white/80' },
                { date: 'Demain', day: 'MER', title: 'VMA Courte', time: '12h30 - 13h30', dist: '1.8 km', color: 'bg-rose-500', bg: 'bg-white/60', border: 'border-white/80' },
                { date: '31 Jan', day: 'VEN', title: 'Récup Active', time: '18h00 - 19h00', dist: '1.5 km', color: 'bg-indigo-500', bg: 'bg-white/60', border: 'border-white/80' }
              ].map((slot, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`rounded-2xl p-5 border ${slot.border} ${slot.bg} backdrop-blur-sm flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-all`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${slot.color}`} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{slot.day} <span className="font-semibold text-slate-400">{slot.date}</span></span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-4 leading-tight">{slot.title}</h4>
                  <div className="mt-auto pt-3 flex items-center justify-between text-sm text-slate-600 font-medium border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><Timer size={16} className="text-slate-400"/> {slot.time}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{slot.dist}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Personal Records / Motivation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 shadow-xl shadow-indigo-900/5"
          >
             <h3 className="text-xl font-bold text-slate-800 mb-6">Mes Records</h3>
             
             <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 hover:bg-white transition-all shadow-sm border border-white/80">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shadow-inner">
                     <Trophy size={22} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">100m Libre</p>
                     <p className="text-xs font-medium text-slate-500">28 Oct 2025</p>
                   </div>
                 </div>
                 <span className="font-mono font-bold text-indigo-600 text-xl bg-indigo-50 px-3 py-1 rounded-lg">58.4s</span>
               </div>

               <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 hover:bg-white transition-all shadow-sm border border-white/80">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center shadow-inner">
                     <Medal size={22} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">400m Libre</p>
                     <p className="text-xs font-medium text-slate-500">15 Sep 2025</p>
                   </div>
                 </div>
                 <span className="font-mono font-bold text-indigo-600 text-xl bg-indigo-50 px-3 py-1 rounded-lg">4:42.0</span>
               </div>
               
               <div className="mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 bg-white/40 blur-2xl rounded-full"></div>
                 <div className="flex items-start gap-3 relative z-10">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                     <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                   </div>
                   <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                     <span className="font-bold block mb-1">Astuce du Coach</span> 
                     Pour améliorer ton 100m, essaie d'augmenter ta fréquence de bras sur les derniers 25m.
                   </p>
                 </div>
               </div>
             </div>
             
             <button className="w-full mt-6 py-3.5 text-sm font-bold text-indigo-600 bg-white/60 hover:bg-white border border-white/80 shadow-sm hover:shadow-md rounded-xl transition-all">
               Voir tous mes temps
             </button>
          </motion.div>
        </div>
        
        {/* Splash Coach Integration */}
        <SplashCoach floating initialState="idle" />

      </div>
    </div>
  );
};