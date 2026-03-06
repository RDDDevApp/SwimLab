import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  delay = 0,
  color = "blue"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={clsx(
        "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-white/60 shadow-lg shadow-blue-900/5",
        "bg-white/40 text-slate-800 hover:bg-white/60 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-800">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          
          {trend && (
            <div className={clsx(
              "flex items-center mt-2 text-xs font-bold px-2 py-0.5 rounded-full w-fit",
              trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            )}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="ml-1 opacity-70 font-normal">vs mois dernier</span>
            </div>
          )}
        </div>
        
        <div className={clsx(
          "p-3 rounded-xl backdrop-blur-md shadow-sm border border-white/50",
          "bg-white/60"
        )}>
          <Icon size={24} className="text-slate-700" />
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className={clsx(
        "absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-30 pointer-events-none",
        color === "blue" && "bg-cyan-400",
        color === "yellow" && "bg-yellow-400",
        color === "pink" && "bg-pink-500",
        color === "purple" && "bg-purple-500",
      )} />
    </motion.div>
  );
};
