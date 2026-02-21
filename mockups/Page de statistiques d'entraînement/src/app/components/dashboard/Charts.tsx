import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion } from 'motion/react';

// Color palette optimized for light theme
const COLORS = ['#06b6d4', '#ec4899', '#eab308', '#6366f1']; // Cyan, Pink, Yellow, Indigo

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5 flex flex-col ${className}`}
  >
    <h3 className="text-lg font-semibold text-slate-800 mb-6">{title}</h3>
    <div className="flex-1 w-full min-h-[300px]">
      {children}
    </div>
  </motion.div>
);

// Mock Data
const groupData = [
  { name: 'Elite', swimmers: 12 },
  { name: 'Espoir', swimmers: 18 },
  { name: 'Jeunes', swimmers: 25 },
  { name: 'Masters', swimmers: 15 },
  { name: 'Loisirs', swimmers: 30 },
];

const strokeData = [
  { name: 'Crawl', value: 45 },
  { name: 'Dos', value: 20 },
  { name: 'Brasse', value: 25 },
  { name: 'Papillon', value: 10 },
];

const activityData = [
  { name: 'Lun', hours: 2.5, km: 5.2 },
  { name: 'Mar', hours: 3.0, km: 6.1 },
  { name: 'Mer', hours: 2.0, km: 4.5 },
  { name: 'Jeu', hours: 3.5, km: 7.0 },
  { name: 'Ven', hours: 2.5, km: 5.5 },
  { name: 'Sam', hours: 4.0, km: 8.2 },
  { name: 'Dim', hours: 1.5, km: 3.0 },
];

const difficultyData = [
  { name: 'Sem 1', value: 4 },
  { name: 'Sem 2', value: 5 },
  { name: 'Sem 3', value: 7 },
  { name: 'Sem 4', value: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-lg shadow-xl text-slate-800 text-xs">
        <p className="font-bold mb-1 text-slate-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const GroupDistributionChart = () => (
  <ChartCard title="Nageurs par Groupe" delay={0.2}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={groupData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.5} />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#00000005' }} />
        <Bar dataKey="swimmers" name="Nageurs" radius={[6, 6, 0, 0]}>
          {groupData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const StrokeDistributionChart = () => (
  <ChartCard title="Répartition par Nage" delay={0.3}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={strokeData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {strokeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ color: '#64748b', fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const ActivityChart = () => (
  <ChartCard title="Volume d'Entraînement (Heures & Km)" className="col-span-1 lg:col-span-2" delay={0.4}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activityData}>
        <defs>
          <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.5} />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px', paddingTop: '10px' }} />
        <Area 
          type="monotone" 
          dataKey="km" 
          name="Kilomètres" 
          stroke="#06b6d4" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorKm)" 
        />
        <Area 
          type="monotone" 
          dataKey="hours" 
          name="Heures" 
          stroke="#ec4899" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorHours)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const DifficultyTrendChart = () => (
  <ChartCard title="Difficulté Ressentie Moyenne" delay={0.5}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={difficultyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.5} />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="value" 
          name="Difficulté (1-10)" 
          stroke="#eab308" 
          strokeWidth={4} 
          dot={{ r: 6, fill: "#eab308", strokeWidth: 2, stroke: "#fff" }} 
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);
