import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Users, Calendar, Trophy, Play, Settings, 
  ChevronRight, ArrowUpRight, Droplets 
} from 'lucide-react';
import { Link } from 'react-router';
import { OptimizedImage } from '../OptimizedImage';
import { SplashCoach } from '../coach/SplashCoach';

// Using the Unsplash image found earlier


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
    <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
    
    {/* Decorative blob */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color.replace('text-', 'bg-').replace('600', '400').replace('500', '400')}`} />
  </motion.div>
);

export const Home: React.FC = () => {
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
              <span>SwimMaster Pro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Coach Thomas</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg max-w-xl">
              Prêt pour la séance du jour ? Vos nageurs du groupe Elite vous attendent à 18h00.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 w-full md:w-auto"
          >
             <Link to="/solo" className="p-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
               Vue Solo
             </Link>
             <button className="p-3 rounded-xl bg-white/50 hover:bg-white transition-colors text-slate-600 border border-white/80 shadow-sm backdrop-blur-md">
                <Settings className="w-6 h-6" />
             </button>
             <div className="flex flex-1 md:flex-none justify-between items-center gap-3 bg-white/50 backdrop-blur-xl pl-4 pr-2 py-2 rounded-2xl border border-white/80 shadow-sm">
                <span className="font-bold text-slate-700 text-sm">Thomas R.</span>
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
                />
             </div>
          </motion.div>
        </div>

        {/* Hero Card / Next Session */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[32px] p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Prochaine Séance
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Endurance & Technique</h2>
              <div className="flex flex-wrap items-center gap-4 text-blue-50 text-sm md:text-base font-medium">
                <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Aujourd'hui, 18:00 - 20:00</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Users className="w-4 h-4" />
                  <span>Groupe Elite (12 nageurs)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Trophy className="w-4 h-4" />
                  <span>Objectif: Aérobie</span>
                </div>
              </div>
            </div>

            <button className="w-full md:w-auto bg-white text-indigo-600 hover:bg-slate-50 transition-colors px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl group">
              <Play className="w-5 h-5 fill-current" />
              Lancer la séance
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard 
            title="Analyses" 
            subtitle="Voir les statistiques détaillées" 
            icon={Activity} 
            to="/stats" 
            color="text-indigo-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Mes Groupes" 
            subtitle="Gérer les effectifs et niveaux" 
            icon={Users} 
            to="/groups" 
            color="text-blue-600"
            delay={0.5}
          />
          <QuickActionCard 
            title="Planning" 
            subtitle="Calendrier des entraînements" 
            icon={Calendar} 
            to="/planning" 
            color="text-violet-600"
            delay={0.6}
          />
          <QuickActionCard 
            title="Compétitions" 
            subtitle="Résultats et engagements" 
            icon={Trophy} 
            to="#" 
            color="text-amber-500"
            delay={0.7}
          />
        </div>

        {/* Recent Activity / Mini Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 shadow-xl shadow-indigo-900/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">Activité Récente</h3>
              <button className="text-sm text-indigo-600 font-bold hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">Voir tout</button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Séance Vitesse validée", group: "Groupe Jeunes", time: "Il y a 2h", status: "Terminé" },
                { title: "Mise à jour des performances", group: "Lucas M.", time: "Il y a 4h", status: "Record" },
                { title: "Absence signalée", group: "Sarah L.", time: "Il y a 5h", status: "Info" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/60 hover:bg-white transition-all shadow-sm hover:shadow-md border border-white/80 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                      item.status === 'Record' ? 'bg-amber-100 text-amber-600' : 
                      item.status === 'Info' ? 'bg-rose-100 text-rose-600' : 
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {item.status === 'Record' ? <Trophy size={20} /> : item.status === 'Info' ? <Calendar size={20} /> : <Activity size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-sm font-medium text-slate-500">{item.group}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg self-start sm:self-auto border border-slate-100">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-b from-indigo-500 to-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10"
          >
             <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-300" />
               Défis du Mois
             </h3>
             <div className="relative z-10 space-y-6">
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                 <div className="flex justify-between text-sm mb-3 font-medium text-blue-50">
                   <span>Objectif Distance</span>
                   <span className="font-bold text-white">85%</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '85%' }}
                     transition={{ duration: 1, delay: 1 }}
                     className="bg-white h-full rounded-full" 
                   />
                 </div>
               </div>
               
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                 <div className="flex justify-between text-sm mb-3 font-medium text-blue-50">
                   <span>Présence Groupe Elite</span>
                   <span className="font-bold text-white">92%</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '92%' }}
                     transition={{ duration: 1, delay: 1.2 }}
                     className="bg-green-400 h-full rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                   />
                 </div>
               </div>

               <div className="pt-4">
                 <button className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-lg">
                   Voir le classement complet
                 </button>
               </div>
             </div>
          </motion.div>
        </div>

        {/* Splash Coach Integration */}
        <SplashCoach floating initialState="satisfied" />

      </div>
    </div>
  );
};
