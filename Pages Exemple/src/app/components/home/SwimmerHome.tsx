import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Calendar, Trophy, Play, Settings, 
  ChevronRight, ArrowUpRight, Droplets, Target, Medal, Clock, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router';

// Reusing the same beautiful background for consistency
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

export const SwimmerHome: React.FC = () => {
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
             <Link to="/solo" className="p-2 text-xs font-semibold text-teal-600 bg-teal-100 rounded-lg hover:bg-teal-200 transition-colors">
               Vue Solo
             </Link>
             <Link to="/coach" className="p-2 text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
               Vue Coach
             </Link>
             <button className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors text-slate-600 border border-white/60 shadow-sm relative">
                <Settings className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md pl-4 pr-2 py-2 rounded-full border border-white/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="font-semibold text-slate-700 text-sm mr-2">Lucas M.</span>
             </div>
          </motion.div>
        </div>

        {/* Hero Card / Next Session */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20"
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
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[100px]">
                  <p className="text-xs text-indigo-200 uppercase font-semibold">Volume</p>
                  <p className="text-xl font-bold">3.5 km</p>
                </div>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[100px]">
                  <p className="text-xs text-indigo-200 uppercase font-semibold">Intensité</p>
                  <p className="text-xl font-bold">Moyenne</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg group w-full md:w-auto">
                <Play className="w-5 h-5 fill-current" />
                Voir le programme
              </button>
              <button className="bg-indigo-700/50 hover:bg-indigo-700/70 backdrop-blur-md text-white border border-white/20 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                Je serai présent(e)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard 
            title="Mes Performances" 
            subtitle="Voir mes temps et progrès" 
            icon={TrendingUp} 
            to="/stats" 
            color="text-emerald-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Objectifs" 
            subtitle="2 sur 3 atteints cette semaine" 
            icon={Target} 
            to="#" 
            color="text-rose-600"
            delay={0.5}
          />
          <QuickActionCard 
            title="Planning" 
            subtitle="Prochains entraînements" 
            icon={Calendar} 
            to="#" 
            color="text-blue-600"
            delay={0.6}
          />
          <QuickActionCard 
            title="Mes Records" 
            subtitle="Historique des compétitions" 
            icon={Medal} 
            to="#" 
            color="text-amber-500"
            delay={0.7}
          />
        </div>

        {/* Weekly Progress & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Chart (Simplified Visual) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">Ma Semaine</h3>
                 <p className="text-slate-500 text-sm">Volume total : 12.5 km</p>
              </div>
              <div className="flex gap-2">
                 <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                 <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              </div>
            </div>
            
            {/* Fake Bar Chart Visual using CSS Grid */}
            <div className="flex items-end justify-between gap-2 h-40 w-full px-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                const height = [40, 70, 0, 85, 60, 90, 30][i]; // random heights
                return (
                  <div key={i} className="flex flex-col items-center gap-2 w-full group">
                    <div className="w-full relative h-32 bg-slate-200/50 rounded-lg overflow-hidden flex items-end">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${height}%` }}
                         transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                         className={`w-full rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity ${height > 0 ? 'bg-cyan-500' : ''}`}
                       />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{day}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Coach Feedback / Notifications */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5"
          >
             <h3 className="text-xl font-bold text-slate-800 mb-4">Derniers Retours</h3>
             
             <div className="space-y-4">
               <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 relative">
                 <div className="absolute top-4 right-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                   <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-8 h-8 rounded-full" alt="Coach" />
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

      </div>
    </div>
  );
};
