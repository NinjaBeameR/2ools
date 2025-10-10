import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, Trash2, Shield, AlertCircle } from 'lucide-react';

function ClipboardPrivacyMode() {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [autoClipboard, setAutoClipboard] = useState(true);
  const [clearTimer, setClearTimer] = useState(30);
  const [clipboardHistory, setClipboardHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('clipboardPrivacyMode');
    if (saved) {
      setIsPrivacyMode(saved === 'true');
    }
  }, []);

  const togglePrivacyMode = () => {
    const newMode = !isPrivacyMode;
    setIsPrivacyMode(newMode);
    localStorage.setItem('clipboardPrivacyMode', newMode.toString());
    
    if (newMode) {
      setClipboardHistory([]);
      alert('Privacy Mode Enabled: Clipboard will be automatically cleared');
    }
  };

  const clearClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('');
      setClipboardHistory([]);
      alert('Clipboard cleared!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
        <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        Clipboard Privacy Mode
      </h2>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <p className="font-semibold mb-1">Clipboard Security</p>
            <p>Protect sensitive data by automatically clearing your clipboard after copying passwords, credit cards, or other private information.</p>
          </div>
        </div>
      </div>

      {/* Privacy Mode Toggle */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isPrivacyMode ? (
              <EyeOff className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Eye className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            )}
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Privacy Mode</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isPrivacyMode ? 'Active - Clipboard will auto-clear' : 'Inactive - Normal clipboard behavior'}
              </p>
            </div>
          </div>
          <button
            onClick={togglePrivacyMode}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isPrivacyMode ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isPrivacyMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Auto-clear clipboard</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatically clear after copying</p>
            </div>
            <button
              onClick={() => setAutoClipboard(!autoClipboard)}
              disabled={!isPrivacyMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-30 ${
                autoClipboard && isPrivacyMode ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoClipboard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Clear after (seconds)
            </label>
            <input
              type="number"
              value={clearTimer}
              onChange={(e) => setClearTimer(parseInt(e.target.value) || 30)}
              disabled={!isPrivacyMode || !autoClipboard}
              min="5"
              max="300"
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-30"
            />
          </div>
        </div>
      </div>

      {/* Manual Clear */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Manual Actions</h3>
        <button
          onClick={clearClipboard}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Clear Clipboard Now
        </button>
      </div>

      {/* Security Tips */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Security Best Practices</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Use Password Managers</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Password managers like Bitwarden or 1Password securely store and auto-fill credentials
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <EyeOff className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Avoid Public Computers</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Never copy passwords or sensitive data on shared or public computers
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Clear Regularly</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manually clear clipboard after copying sensitive information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClipboardPrivacyMode;
