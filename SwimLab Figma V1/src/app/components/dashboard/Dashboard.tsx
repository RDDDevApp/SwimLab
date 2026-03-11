import React from 'react';
import { Users, Clock, Waves, Activity, TrendingUp, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { OptimizedImage } from '../OptimizedImage';
import { StatCard } from './StatCard';
import { 
  GroupDistributionChart, 
  StrokeDistributionChart, 
  ActivityChart, 
  DifficultyTrendChart 
} from './Charts';
const exampleImage = "https://images.unsplash.com/photo-1687598882895-ea07e3739eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBhYnN0cmFjdCUyMHdhdGVyJTIwYmx1ZXxlbnwxfHx8fDE3NzE2MDc2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export const Dashboard: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Image with Blur Overlay */}
      <div className="fixed inset-0 z-0">
        <OptimizedImage 
          src={exampleImage} 
          alt="Fluid Background" 
          className="w-full h-full object-cover opacity-30 scale-110 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-blue-50/70 to-blue-50/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 md:py-12">
        
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors mb-4 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600">
              Tableau de Bord Coach
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Suivi des performances et statistiques du club
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
            <Calendar className="text-cyan-600 w-5 h-5" />
            <span className="text-sm font-medium text-slate-700">Février 2026</span>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Nageurs Actifs" 
            value="85" 
            subtitle="Total dans le club"
            icon={Users} 
            color="blue"
            trend={{ value: 12, isPositive: true }}
            delay={0.1}
          />
          <StatCard 
            title="Heures Nagées" 
            value="1,240" 
            subtitle="Cumul mensuel"
            icon={Clock} 
            color="pink"
            trend={{ value: 5, isPositive: true }}
            delay={0.2}
          />
          <StatCard 
            title="Km Totaux" 
            value="4,520" 
            subtitle="Distance parcourue"
            icon={Activity} 
            color="yellow"
            trend={{ value: 8, isPositive: true }}
            delay={0.3}
          />
           <StatCard 
            title="Séances Réalisées" 
            value="342" 
            subtitle="Ce mois-ci"
            icon={Waves} 
            color="purple"
            trend={{ value: 2, isPositive: false }}
            delay={0.4}
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Km Moyen / Nageur" 
            value="53 km" 
            icon={Trophy} 
            color="blue"
            className="md:col-span-1"
            delay={0.5}
          />
          <StatCard 
            title="Difficulté Moyenne" 
            value="6.8/10" 
            subtitle="Ressentie par les athlètes"
            icon={TrendingUp} 
            color="pink"
            className="md:col-span-1"
            delay={0.6}
          />
           <StatCard 
            title="Assiduité Moyenne" 
            value="92%" 
            subtitle="Présence aux entraînements"
            icon={Users} 
            color="yellow"
            className="md:col-span-1"
            delay={0.7}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ActivityChart />
          <div className="grid grid-cols-1 gap-8">
             <GroupDistributionChart />
             <StrokeDistributionChart />
          </div>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2">
              <DifficultyTrendChart />
           </div>
           
           {/* Summary / Insight Card */}
           <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Insight du Coach</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Le groupe <span className="font-semibold text-white">Espoir</span> a montré une progression de +15% sur l'endurance cette semaine. Pensez à augmenter l'intensité des séances techniques pour le groupe Elite.
                </p>
              </div>
              
              <button className="relative z-10 w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                Voir le rapport détaillé
              </button>
           </div>
         </div>

      </div>
    </div>
  );
};
