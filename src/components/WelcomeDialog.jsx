import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the dialog before
    const dontShowAgain = localStorage.getItem('welcomeDialogDismissed');
    if (!dontShowAgain) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = (dontShow = false) => {
    if (dontShow) {
      localStorage.setItem('welcomeDialogDismissed', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={() => handleClose(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome to Múra-2ools!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Your everyday productivity toolkit
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
            This software is developed by a <strong>solo developer</strong> as a passion project. 
            While I strive for quality, you may encounter some bugs or rough edges.
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Thank you for trying Múra-2ools! Your feedback and patience are greatly appreciated. 🙏
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => handleClose(false)}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => handleClose(true)}
            className="w-full px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Don't show this again
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeDialog;
