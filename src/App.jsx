import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WelcomeDialog from './components/WelcomeDialog';
import UpdateDialog from './components/UpdateDialog';
import Home from './pages/Home';
import Settings from './pages/Settings';
import ToolWindow from './pages/ToolWindow';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-3 rounded-lg bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors z-50"
      title="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-zinc-600" />}
    </button>
  );
}

function AppContent() {
  const location = useLocation();
  const isToolWindow = location.pathname.startsWith('/tool/');

  // For tool windows, show only the tool without sidebar/topbar
  if (isToolWindow) {
    return (
      <div className="h-screen bg-zinc-50 dark:bg-zinc-900 p-6 overflow-auto">
        <ThemeToggle />
        <Routes>
          <Route path="/tool/:toolName" element={<ToolWindow />} />
        </Routes>
      </div>
    );
  }

  // For main window, show full layout with sidebar and topbar
  return (
    <>
      <WelcomeDialog />
      <UpdateDialog />
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto bg-zinc-50 dark:bg-zinc-900">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:category" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;