import React from 'react';
import { motion } from 'motion/react';
import { Filter } from 'lucide-react';
import { GROUPS, COLORS } from '../../../constants/colors';

interface FilterBarProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function FilterBar({ activeFilters, onFilterChange }: FilterBarProps) {
  const toggleFilter = (id: string) => {
    if (activeFilters.length === 0) {
      onFilterChange([id]);
    } else if (activeFilters.includes(id)) {
      onFilterChange(activeFilters.filter((f) => f !== id));
    } else {
      onFilterChange([...activeFilters, id]);
    }
  };

  return (
    <div
      className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.40)',
        borderColor: COLORS.cardBorder,
      }}
    >
      {/* Filter icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.60)',
          borderColor: COLORS.cardBorder,
          color: COLORS.textMuted,
        }}
      >
        <Filter size={13} />
      </div>

      {GROUPS.map((g) => {
        const isActive =
          activeFilters.length === 0 || activeFilters.includes(g.id);
        return (
          <motion.button
            key={g.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => toggleFilter(g.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: isActive ? `rgba(255,255,255,0.65)` : 'transparent',
              borderColor: isActive ? `${g.color}40` : 'rgba(0,0,0,0.08)',
              color: isActive ? COLORS.textPrimary : COLORS.textMuted,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: g.color,
                boxShadow: isActive ? `0 0 6px ${g.color}` : 'none',
              }}
            />
            {g.name}
          </motion.button>
        );
      })}

      {/* Reset */}
      {activeFilters.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, width: 0 }}
          animate={{ opacity: 1, scale: 1, width: 'auto' }}
          exit={{ opacity: 0, scale: 0.8, width: 0 }}
          onClick={() => onFilterChange([])}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.60)',
            borderColor: `${COLORS.turquoise}40`,
            color: COLORS.turquoise,
          }}
        >
          Tous
        </motion.button>
      )}
    </div>
  );
}