import React from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle } from 'react-icons/md';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center relative z-10">
            <motion.div
              animate={i === current ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-lg"
              style={
                i < current  ? { background: 'linear-gradient(135deg, #16A34A, #22C55E)', color: 'white', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }
                : i === current ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '2px solid #22C55E' }
                : { background: 'rgba(255,255,255,0.03)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }
              }>
              {i < current ? <MdCheckCircle className="text-xl" /> : i + 1}
            </motion.div>
            <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap transition-colors duration-300 hidden sm:block ${i === current ? 'text-green-400' : i < current ? 'text-gray-300' : 'text-gray-600'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 sm:mx-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                animate={{ width: i < current ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
