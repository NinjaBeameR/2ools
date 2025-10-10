import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // work, break, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playSound();
    
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      if (newSessions % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('break');
        setTimeLeft(settings.breakDuration * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const playSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (mode === 'break') {
      setTimeLeft(settings.breakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (newMode === 'break') {
      setTimeLeft(settings.breakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work'
    ? (1 - timeLeft / (settings.workDuration * 60)) * 100
    : mode === 'break'
    ? (1 - timeLeft / (settings.breakDuration * 60)) * 100
    : (1 - timeLeft / (settings.longBreakDuration * 60)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Pomodoro Timer</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Work Duration (min)</label>
              <input
                type="number"
                value={settings.workDuration}
                onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Break Duration (min)</label>
              <input
                type="number"
                value={settings.breakDuration}
                onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Long Break (min)</label>
              <input
                type="number"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Sessions Until Long Break</label>
              <input
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'work', label: 'Work' },
          { key: 'break', label: 'Short Break' },
          { key: 'longBreak', label: 'Long Break' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              mode === key
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-12 border border-zinc-200 dark:border-zinc-700 mb-8">
        <div className="text-center mb-8">
          <div className="text-8xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatTime(timeLeft)}
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-4">
            {mode === 'work' ? 'Focus Time' : mode === 'break' ? 'Short Break' : 'Long Break'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-emerald-600 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold text-lg"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="p-4 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Session Counter */}
      <div className="text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Completed Sessions: <span className="font-bold text-emerald-600 dark:text-emerald-400">{sessions}</span>
        </p>
      </div>
    </div>
  );
}

export default PomodoroTimer;
