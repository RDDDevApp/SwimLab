import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import {
  Trophy, TrendingUp, Calendar, Plus, Droplets,
  Zap, Target, Award, ChevronRight, Clock, Flame,
  Star, Activity, Home as HomeIcon, Settings, ArrowUpRight,
  Play, Sparkles, Timer, Users, Medal
} from 'lucide-react';
import { SplashCoach } from '../coach/SplashCoach';

// Consistent background
const bgImage = "https://images.unsplash.com/photo-1593935882214-7c9568ad5cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBtaW5pbWFsaXN0JTIwYmx1ZSUyMHdhdGVyJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjYzNTUyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

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
    className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 p-6 shadow-lg shadow-blue-900/5 transition-all hover:shadow-xl hover:bg-white/60 cursor-pointer"
  >
    <Link to={to} className="absolute inset-0 z-10" />
    
    <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity`}>
      <ArrowUpRight className={`w-5 h-5 ${color}`} />
    </div>

    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    
    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500">{subtitle}</p>
    
    {/* Decorative blob */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color.replace('text-', 'bg-').replace('600', '400')}`} />
  </motion.div>
);

export const SoloSwimmerHome: React.FC = () => {
  const navigate = useNavigate();
  const [coachState, setCoachState] = useState("idle");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-blue-50 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Water Background" 
          className="w-full h-full object-cover opacity-20 scale-105 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-blue-100/40 to-white/60" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 md:py-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-cyan-600 font-semibold mb-2">
              <Droplets className="w-5 h-5" />
              <span>SwimMaster</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">Alex</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg max-w-xl">
              Prêt à nager ? Ton objectif hebdomadaire est atteint à 65%.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
             <Link to="/" className="p-2 text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
               Vue Club
             </Link>
             <button className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors text-slate-600 border border-white/60 shadow-sm relative">
                <Settings className="w-6 h-6" />
             </button>
             <Link to="/profil-nageur" className="flex items-center gap-3 bg-white/60 backdrop-blur-md pl-4 pr-2 py-2 rounded-full border border-white/60 shadow-sm hover:bg-white/80 transition-colors cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="font-semibold text-slate-700 text-sm mr-2">Alex B.</span>
             </Link>
          </motion.div>
        </div>

        {/* Hero Card / AI Workout Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-teal-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Suggestion IA
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Séance Pyramide - 2000m</h2>
              <p className="text-teal-100 mb-6 max-w-lg">
                Basé sur ta dernière séance de vitesse. Objectif : Travailler l'allure sur des distances croissantes puis décroissantes.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[100px]">
                  <p className="text-xs text-teal-200 uppercase font-semibold">Durée estimée</p>
                  <p className="text-xl font-bold">55 min</p>
                </div>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[100px]">
                  <p className="text-xs text-teal-200 uppercase font-semibold">Calories</p>
                  <p className="text-xl font-bold">~650 kcal</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button className="bg-white text-teal-700 hover:bg-teal-50 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg group w-full md:w-auto">
                <Play className="w-5 h-5 fill-current" />
                Démarrer la séance
              </button>
              <button className="bg-teal-700/50 hover:bg-teal-700/70 backdrop-blur-md text-white border border-white/20 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                <Settings className="w-4 h-4" />
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
            color="text-teal-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Planning" 
            subtitle="Prochains entraînements" 
            icon={Calendar} 
            to="/planning-nageur" 
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
            className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">Mes Prochaines Séances</h3>
                 <p className="text-slate-500 text-sm">Semaine en cours</p>
              </div>
              <Link to="/planning-nageur" className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50/50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">Voir le planning</Link>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[
                { date: 'Aujourd\'hui', day: 'MAR', title: 'Seuil Aérobie', time: '07h00 - 08h15', dist: '2.5 km', color: 'bg-teal-500', bg: 'bg-teal-50/50', border: 'border-teal-100' },
                { date: 'Demain', day: 'MER', title: 'VMA Courte', time: '12h30 - 13h30', dist: '1.8 km', color: 'bg-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100' },
                { date: '31 Jan', day: 'VEN', title: 'Récup Active', time: '18h00 - 19h00', dist: '1.5 km', color: 'bg-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100' }
              ].map((slot, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className={`rounded-xl p-5 border ${slot.border} ${slot.bg} backdrop-blur-sm flex flex-col relative overflow-hidden shadow-sm`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${slot.color}`} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-500">{slot.day} <span className="font-medium">{slot.date}</span></span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-2 leading-tight">{slot.title}</h4>
                  <div className="mt-auto pt-3 flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-1.5"><Timer size={14}/> {slot.time}</span>
                    <span className="font-bold whitespace-nowrap">{slot.dist}</span>
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
            className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5"
          >
             <h3 className="text-xl font-bold text-slate-800 mb-4">Mes Records</h3>
             
             <div className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                     <Trophy size={20} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">100m Libre</p>
                     <p className="text-xs text-slate-500">28 Oct 2025</p>
                   </div>
                 </div>
                 <span className="font-mono font-bold text-slate-800 text-lg">58.4s</span>
               </div>

               <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                     <Medal size={20} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">400m Libre</p>
                     <p className="text-xs text-slate-500">15 Sep 2025</p>
                   </div>
                 </div>
                 <span className="font-mono font-bold text-slate-800 text-lg">4:42.0</span>
               </div>
               
               <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                 <div className="flex items-start gap-2">
                   <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                   <p className="text-sm text-indigo-800">
                     <span className="font-bold">Astuce :</span> Pour améliorer ton 100m, essaie d'augmenter ta fréquence de bras sur les derniers 25m.
                   </p>
                 </div>
               </div>
             </div>
             
             <button className="w-full mt-4 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
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