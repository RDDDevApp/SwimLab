import React from 'react';
import { motion } from 'motion/react';

interface GlowBadgeProps {
  color: string;
  children: React.ReactNode;
  pulse?: boolean;
}

export function GlowBadge({ color, children, pulse = false }: GlowBadgeProps) {
  const content = (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
        boxShadow: `0 0 14px ${color}18, inset 0 0 8px ${color}08`,
      }}
    >
      {children}
    </span>
  );

  if (pulse) {
    return (
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="inline-block"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
