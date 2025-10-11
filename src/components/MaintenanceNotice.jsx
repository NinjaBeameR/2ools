import React from 'react';
import { Wrench, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function MaintenanceNotice({ toolName = 'This Tool' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        {/* Icon */}
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-amber-200 dark:bg-amber-600 rounded-full blur-xl opacity-50"></div>
            <Wrench className="w-20 h-20 text-amber-600 dark:text-amber-400 relative" />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Under Maintenance
        </h2>

        {/* Message */}
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          {toolName} is currently undergoing maintenance and improvements.
        </p>

        {/* Info Box */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-2">We're working on it!</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Fixing offline Word to PDF conversion</li>
                <li>Improving API-based conversions</li>
                <li>Enhancing stability and performance</li>
                <li>Better error handling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-blue-600 rounded-full"
          />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            Expected to be back soon
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.close()}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}

export default MaintenanceNotice;
