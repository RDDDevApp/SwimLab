import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CalendarPlus, Wand2, Dumbbell } from 'lucide-react';
import { COLORS } from '../../../constants/colors';

const FAB_ACTIONS = [
  { icon: <Dumbbell size={16} />,    label: 'Créer entraînement', color: COLORS.turquoise },
  { icon: <CalendarPlus size={16} />, label: 'Créer créneau',      color: COLORS.yellow    },
  { icon: <Wand2 size={16} />,        label: 'IA Générer',          color: COLORS.purple    },
];

export function FAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(239,246,255,0.60)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB container */}
      <div className="relative z-50 flex flex-col items-end gap-3">
        {/* Action items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5 items-end mb-1"
            >
              {FAB_ACTIONS.map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.85 }}
                  transition={{
                    delay: i * 0.06,
                    type: 'spring',
                    stiffness: 400,
                    damping: 26,
                  }}
                  whileHover={{ scale: 1.04, x: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-3 border rounded-2xl pl-4 pr-2 py-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.80)',
                    borderColor: `${item.color}35`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${item.color}18`,
                  }}
                >
                  <span className="text-xs font-semibold tracking-wide whitespace-nowrap" style={{ color: COLORS.textPrimary }}>
                    {item.label}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}EE, ${item.color}99)`,
                      color: COLORS.white,
                      boxShadow: `0 0 14px ${item.color}50`,
                    }}
                  >
                    {item.icon}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          animate={{ rotate: isOpen ? 45 : 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="w-14 h-14 rounded-full flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${COLORS.turquoise}, ${COLORS.turquoiseGlow})`,
            color: COLORS.white,
            boxShadow: `0 0 28px ${COLORS.turquoise}50, 0 8px 24px rgba(0,0,0,0.12)`,
          }}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ backgroundColor: COLORS.turquoise }}
            />
          )}
          <Plus size={26} strokeWidth={2.5} className="relative z-10" />
        </motion.button>
      </div>
    </>
  );
}
