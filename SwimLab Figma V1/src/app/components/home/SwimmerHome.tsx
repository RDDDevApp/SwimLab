import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Calendar, Trophy, Play, Settings, 
  ChevronRight, ArrowUpRight, Droplets, Target, Medal, Clock, TrendingUp, Users
} from 'lucide-react';
import { Link } from 'react-router';
import { OptimizedImage } from '../OptimizedImage';
import { SplashCoach } from '../coach/SplashCoach';

// Reusing the same beautiful background for consistency


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

    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    
    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500">{subtitle}</p>
    
    {/* Decorative blob */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color.replace('text-', 'bg-').replace('600', '400')}`} />
  </motion.div>
);

export const SwimmerHome: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: 'transform' }}
          className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"
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
            <div className="flex items-center gap-2 text-cyan-600 font-semibold mb-2">
              <Droplets className="w-5 h-5" />
              <span>SwimMaster Athlete</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Salut, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">Lucas</span> !
            </h1>
            <p className="text-slate-500 mt-2 text-lg max-w-xl">
              Prêt à battre ton record ? Ton coach a laissé un commentaire sur ta dernière séance.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
             <Link to="/solo" className="p-2 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors">
               Vue Solo
             </Link>
             <Link to="/coach" className="p-2 text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
               Vue Coach
             </Link>
             <button className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors text-slate-600 border border-white/60 shadow-sm relative">
                <Settings className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <Link to="/swimmer-profile" className="flex flex-1 md:flex-none justify-between items-center gap-3 bg-white/50 backdrop-blur-xl pl-4 pr-2 py-2 rounded-2xl border border-white/80 shadow-sm hover:bg-white/80 transition-colors cursor-pointer">
                <span className="font-semibold text-slate-700 text-sm">Lucas M.</span>
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
             </Link>
          </motion.div>
        </div>

        {/* Hero Card / Next Session */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 rounded-[32px] p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                <Clock className="w-3 h-3 text-yellow-300" />
                Dans 2 heures
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Technique Papillon & Virages</h2>
              <p className="text-indigo-100 mb-6 max-w-lg">
                Focus sur l'ondulation sous-marine. N'oublie pas tes palmes courtes et ton tuba frontal.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                  <p className="text-xs text-indigo-100 uppercase font-bold mb-1">Volume</p>
                  <p className="text-2xl font-black">3.5 km</p>
                </div>
                 <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                  <p className="text-xs text-indigo-100 uppercase font-bold mb-1">Intensité</p>
                  <p className="text-2xl font-black">Moyenne</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button className="bg-white text-indigo-700 hover:bg-slate-50 transition-colors px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl group w-full md:w-auto text-lg">
                <Play className="w-6 h-6 fill-current" />
                Voir le programme
              </button>
              <button className="bg-indigo-700/50 hover:bg-indigo-700/70 backdrop-blur-md text-white border border-white/20 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                Je serai présent(e)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <QuickActionCard 
            title="Planning" 
            subtitle="Prochains entraînements" 
            icon={Calendar} 
            to="/swimmer-planning" 
            color="text-blue-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Mon activité" 
            subtitle="Analyse et Défis" 
            icon={Activity} 
            to="/stats" 
            color="text-cyan-600"
            delay={0.5}
          />
          <QuickActionCard 
            title="Le Bassin" 
            subtitle="Communauté et amis" 
            icon={Users} 
            to="/social" 
            color="text-indigo-500"
            delay={0.6}
          />
        </div>

        {/* Weekly Progress & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Workouts Club */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 shadow-xl shadow-indigo-900/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">Mes Prochains Entraînements</h3>
                 <p className="text-slate-500 text-sm">Groupe Compétition — Cette semaine</p>
              </div>
              <Link to="/swimmer-planning" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Voir le planning</Link>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { date: 'Aujourd\'hui', day: 'LUN', title: 'Endurance', time: '18h00 - 19h30', dist: '3.0 km', color: 'bg-indigo-500', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
                { date: 'Demain', day: 'MAR', title: 'Sprint Séries', time: '18h00 - 19h30', dist: '2.5 km', color: 'bg-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100' },
                { date: '30 Jan', day: 'JEU', title: 'Technique', time: '19h00 - 20h30', dist: '2.0 km', color: 'bg-indigo-500', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
                { date: '1 Fév', day: 'SAM', title: 'Compétition', time: '09h00 - 12h00', dist: '4.0 km', color: 'bg-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' }
              ].map((slot, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className={`rounded-xl p-4 border ${slot.border} ${slot.bg} backdrop-blur-sm flex flex-col relative overflow-hidden shadow-sm`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${slot.color}`} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">{slot.day} <span className="font-medium">{slot.date}</span></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight">{slot.title}</h4>
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Clock size={12}/> {slot.time}</span>
                    <span className="font-bold whitespace-nowrap">{slot.dist}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Coach Feedback / Notifications */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 shadow-xl shadow-indigo-900/5"
          >
             <h3 className="text-xl font-bold text-slate-800 mb-4">Derniers Retours</h3>
             
             <div className="space-y-4">
               <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 relative">
                 <div className="absolute top-4 right-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                   <OptimizedImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-8 h-8 rounded-full" alt="Coach" />
                   <div>
                     <p className="text-sm font-bold text-slate-800">Coach Thomas</p>
                     <p className="text-xs text-slate-500">Il y a 2 heures</p>
                   </div>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   "Très bonne séance d'aérobie hier. Attention à ne pas creuser le dos sur la fatigue en fin de série."
                 </p>
               </div>

               <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <Trophy size={20} />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Nouveau Record !</p>
                   <p className="text-xs text-slate-500">50m Nage Libre - 25.4s</p>
                 </div>
               </div>
             </div>
             
             <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
               Voir tout l'historique
             </button>
          </motion.div>
        </div>

        {/* Splash Coach Integration */}
        <SplashCoach floating initialState="processing" />

      </div>
    </div>
  );
};
