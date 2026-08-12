import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Notification: React.FC = () => {
  const { notification } = usePortfolio();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200 dark:bg-red-900/90 dark:border-red-700'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-100 dark:bg-zinc-800/90 dark:border-zinc-600'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <p className="text-sm font-medium pr-2">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
