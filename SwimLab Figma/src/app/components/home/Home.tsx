import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Users, Calendar, Trophy, Play, Settings, 
  ChevronRight, ArrowUpRight, Droplets 
} from 'lucide-react';
import { Link } from 'react-router';
import { SplashCoach } from '../coach/SplashCoach';

// Using the Unsplash image found earlier
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

export const Home: React.FC = () => {
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
              <span>SwimMaster Pro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">Coach Thomas</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg max-w-xl">
              Prêt pour la séance du jour ? Vos nageurs du groupe Elite vous attendent à 18h00.
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
             <button className="p-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors text-slate-600 border border-white/60 shadow-sm">
                <Settings className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md pl-4 pr-2 py-2 rounded-full border border-white/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="font-semibold text-slate-700 text-sm mr-2">Thomas R.</span>
             </div>
          </motion.div>
        </div>

        {/* Hero Card / Next Session */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Prochaine Séance
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Endurance & Technique</h2>
              <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Aujourd'hui, 18:00 - 20:00</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Groupe Elite (12 nageurs)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>Objectif: Aérobie</span>
                </div>
              </div>
            </div>

            <button className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg group">
              <Play className="w-5 h-5 fill-current" />
              Lancer la séance
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard 
            title="Analyses" 
            subtitle="Voir les statistiques détaillées" 
            icon={Activity} 
            to="/stats" 
            color="text-cyan-600"
            delay={0.4}
          />
          <QuickActionCard 
            title="Mes Groupes" 
            subtitle="Gérer les effectifs et niveaux" 
            icon={Users} 
            to="/groups" 
            color="text-indigo-600"
            delay={0.5}
          />
          <QuickActionCard 
            title="Planning" 
            subtitle="Calendrier des entraînements" 
            icon={Calendar} 
            to="/planning" 
            color="text-pink-600"
            delay={0.6}
          />
          <QuickActionCard 
            title="Compétitions" 
            subtitle="Résultats et engagements" 
            icon={Trophy} 
            to="#" 
            color="text-yellow-500"
            delay={0.7}
          />
        </div>

        {/* Recent Activity / Mini Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Activité Récente</h3>
              <button className="text-sm text-cyan-600 font-medium hover:underline">Voir tout</button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Séance Vitesse validée", group: "Groupe Jeunes", time: "Il y a 2h", status: "Terminé" },
                { title: "Mise à jour des performances", group: "Lucas M.", time: "Il y a 4h", status: "Record" },
                { title: "Absence signalée", group: "Sarah L.", time: "Il y a 5h", status: "Info" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors border border-white/40">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'Record' ? 'bg-yellow-100 text-yellow-600' : 
                      item.status === 'Info' ? 'bg-red-100 text-red-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.status === 'Record' ? <Trophy size={18} /> : item.status === 'Info' ? <Calendar size={18} /> : <Activity size={18} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.group}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-b from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg"
          >
             <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <h3 className="text-xl font-bold mb-4 relative z-10">Défis du Mois</h3>
             <div className="relative z-10 space-y-6">
               <div>
                 <div className="flex justify-between text-sm mb-2 opacity-90">
                   <span>Objectif Distance</span>
                   <span className="font-bold">85%</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2">
                   <div className="bg-white h-2 rounded-full w-[85%]"></div>
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between text-sm mb-2 opacity-90">
                   <span>Présence Groupe Elite</span>
                   <span className="font-bold">92%</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2">
                   <div className="bg-green-400 h-2 rounded-full w-[92%]"></div>
                 </div>
               </div>

               <div className="pt-4">
                 <button className="w-full py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors border border-white/20">
                   Voir le classement
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
