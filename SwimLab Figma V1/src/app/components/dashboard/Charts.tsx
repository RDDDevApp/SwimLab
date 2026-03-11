import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { motion } from 'motion/react';

// Color palette optimized for light theme
const CHART_COLORS = ['#06b6d4', '#ec4899', '#eab308', '#6366f1', '#10b981'];

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
  { name: 'Elite',    swimmers: 12 },
  { name: 'Espoir',   swimmers: 18 },
  { name: 'Jeunes',   swimmers: 25 },
  { name: 'Masters',  swimmers: 15 },
  { name: 'Loisirs',  swimmers: 30 },
];

const strokeData = [
  { name: 'Crawl',    value: 45 },
  { name: 'Dos',      value: 20 },
  { name: 'Brasse',   value: 25 },
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
        {payload.map((entry: any, i: number) => (
          <p key={`tooltip-item-${i}-${entry.name}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend to avoid recharts' internal duplicate-key issue
const CustomLegend = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className="flex flex-wrap justify-center gap-4 mt-4">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-xs text-slate-500">{item.label}</span>
      </div>
    ))}
  </div>
);

export const GroupDistributionChart: React.FC = () => {
  const uid = React.useMemo(() => Math.random().toString(36).substring(7), []);
  return (
  <ChartCard title="Nageurs par Groupe" delay={0.2}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={groupData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.5} />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#00000005' }} />
        <Bar dataKey="swimmers" name="Nageurs" radius={[6, 6, 0, 0]} isAnimationActive={false}>
          {groupData.map((entry, index) => (
            <Cell key={`bar-cell-${uid}-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
)};

export const StrokeDistributionChart: React.FC = () => {
  const uid = React.useMemo(() => Math.random().toString(36).substring(7), []);
  return (
  <ChartCard title="Répartition par Nage" delay={0.3}>
    <div className="flex flex-col h-full">
      <div className="flex-1">
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
              nameKey="name"
              isAnimationActive={false}
            >
              {strokeData.map((entry, index) => (
                <Cell
                  key={`pie-cell-${uid}-${entry.name}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend
        items={strokeData.map((d, i) => ({
          label: d.name,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))}
      />
    </div>
  </ChartCard>
)};

export const ActivityChart: React.FC = () => {
  // useId ensures gradient IDs are unique per component instance,
  // preventing SVG ID collisions in the DOM that cause recharts key warnings.
  const uid = React.useMemo(() => Math.random().toString(36).substring(7), []);
  const gradKmId   = `grad-km-${uid}`;
  const gradHrsId  = `grad-hrs-${uid}`;

  return (
    <ChartCard title="Volume d'Entraînement (Heures & Km)" className="col-span-1 lg:col-span-2" delay={0.4}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id={gradKmId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={gradHrsId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="km"
                name="Kilomètres"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradKmId})`}
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                name="Heures"
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradHrsId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend
          items={[
            { label: 'Kilomètres', color: '#06b6d4' },
            { label: 'Heures',     color: '#ec4899' },
          ]}
        />
      </div>
    </ChartCard>
  );
};

export const DifficultyTrendChart: React.FC = () => (
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
          dot={{ r: 6, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 8 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);
