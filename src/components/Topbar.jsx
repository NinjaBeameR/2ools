import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// All available tools across categories
const allTools = [
  // General Tools
  { name: 'Calculator', category: 'General Tools', path: 'calculator' },
  { name: 'Unit Converter', category: 'General Tools', path: 'unit-converter' },
  { name: 'Clipboard Manager', category: 'General Tools', path: 'clipboard-manager' },
  { name: 'QR Code Generator', category: 'General Tools', path: 'qr-code-generator' },
  { name: 'Text Formatter', category: 'General Tools', path: 'text-formatter' },
  { name: 'Password Generator', category: 'General Tools', path: 'password-generator' },
  // Media Tools
  { name: 'Audio Trimmer & Joiner', category: 'Media Tools', path: 'audio-trimmer-and-joiner' },
  { name: 'Image Converter', category: 'Media Tools', path: 'image-converter' },
  { name: 'Image Resizer & Cropper', category: 'Media Tools', path: 'image-resizer-and-cropper' },
  { name: 'Text to Speech', category: 'Media Tools', path: 'text-to-speech' },
  { name: 'Video Compressor', category: 'Media Tools', path: 'video-compressor' },
  { name: 'Screen Recorder', category: 'Media Tools', path: 'screen-recorder' },
  // PDF & Image Tools
  { name: 'PDF Merger', category: 'PDF & Image Tools', path: 'pdf-merger' },
  { name: 'PDF Splitter', category: 'PDF & Image Tools', path: 'pdf-splitter' },
  { name: 'PDF Compressor', category: 'PDF & Image Tools', path: 'pdf-compressor' },
  { name: 'Image to PDF', category: 'PDF & Image Tools', path: 'image-to-pdf' },
  // Productivity Tools
  { name: 'To-Do List', category: 'Productivity Tools', path: 'to-do-list' },
  { name: 'Notes', category: 'Productivity Tools', path: 'notes' },
  { name: 'Pomodoro Timer', category: 'Productivity Tools', path: 'pomodoro-timer' },
  { name: 'Reminder Alerts', category: 'Productivity Tools', path: 'reminder-alerts' },
  { name: 'Daily Journal', category: 'Productivity Tools', path: 'daily-journal' },
  { name: 'Daily Goal Dashboard', category: 'Productivity Tools', path: 'daily-goal-dashboard' },
  { name: 'Habit Tracker', category: 'Productivity Tools', path: 'habit-tracker' },
  { name: 'Reading Mode', category: 'Productivity Tools', path: 'reading-mode' },
  // File & System Tools
  { name: 'Duplicate File Finder', category: 'File & System Tools', path: 'duplicate-file-finder' },
  { name: 'File Organizer', category: 'File & System Tools', path: 'file-organizer' },
  { name: 'Temporary File Cleaner', category: 'File & System Tools', path: 'temporary-file-cleaner' },
  { name: 'Disk Space Analyzer', category: 'File & System Tools', path: 'disk-space-analyzer' },
  { name: 'Startup Program Manager', category: 'File & System Tools', path: 'startup-program-manager' },
  { name: 'System Info Dashboard', category: 'File & System Tools', path: 'system-info-dashboard' },
  // Security & Privacy
  { name: 'File Locker', category: 'Security & Privacy', path: 'file-locker' },
  { name: 'Two-Layer Vault', category: 'Security & Privacy', path: 'two-layer-vault' },
  { name: 'Clipboard Privacy Mode', category: 'Security & Privacy', path: 'clipboard-privacy-mode' },
  { name: 'Secure Notes', category: 'Security & Privacy', path: 'secure-notes' },
];

function Topbar() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('mura-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allTools.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToolClick = (toolPath) => {
    if (window.electronAPI) {
      window.electronAPI.openToolWindow(toolPath);
    } else {
      window.open(`#/tool/${toolPath}`, '_blank', 'width=800,height=600');
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <header className="bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tools</div>
        </div>
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-10 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {searchResults.map((tool, index) => {
                  const isFavorite = favorites.includes(tool.name);
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleToolClick(tool.path)}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-b border-zinc-100 dark:border-zinc-700 last:border-0 flex items-start justify-between gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {tool.name}
                          {isFavorite && (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {tool.category}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {showResults && searchQuery && searchResults.length === 0 && (
              <motion.div
                className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No tools found for "{searchQuery}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /> : <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;