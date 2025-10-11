import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, TrendingUp, Calendar, Target, Skull, DollarSign, Clock, Edit, AlertTriangle, Award } from 'lucide-react';

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '⭐', color: 'blue', frequency: 'daily' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'calendar'
  const [trackerMode, setTrackerMode] = useState('habits'); // 'habits' or 'addictions'
  
  // Addiction Tracker States
  const [addictions, setAddictions] = useState([]);
  const [showAddAddiction, setShowAddAddiction] = useState(false);
  const [editingAddiction, setEditingAddiction] = useState(null);
  const [newAddiction, setNewAddiction] = useState({
    name: '',
    icon: '🚬',
    costType: 'money', // 'money' or 'time'
    amount: '',
    frequency: 'week', // 'day' or 'week'
    lastUsed: new Date().toISOString(),
    notes: ''
  });

  const habitIcons = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🎵', '🥗', '😴'];
  const habitColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500'
  };

  const addictionIcons = ['🚬', '🍺', '📱', '🎮', '🍰', '☕', '🎰', '🛒', '💊', '🍔'];
  const motivationalQuotes = [
    "Every day clean is a victory.",
    "You're stronger than your urges.",
    "Progress, not perfection.",
    "One day at a time.",
    "You've got this!",
    "Your future self will thank you.",
    "Breaking free, one moment at a time.",
    "Recovery is a journey, not a destination.",
    "You're worth fighting for.",
    "Small steps lead to big changes."
  ];

  useEffect(() => {
    loadHabits();
    loadAddictions();
  }, []);

  const loadHabits = () => {
    const saved = localStorage.getItem('habitTracker');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  };

  const saveHabits = (updatedHabits) => {
    localStorage.setItem('habitTracker', JSON.stringify(updatedHabits));
    setHabits(updatedHabits);
  };

  // Addiction Tracker Functions
  const loadAddictions = () => {
    const saved = localStorage.getItem('addictionTracker');
    if (saved) {
      setAddictions(JSON.parse(saved));
    }
  };

  const saveAddictions = (updatedAddictions) => {
    localStorage.setItem('addictionTracker', JSON.stringify(updatedAddictions));
    setAddictions(updatedAddictions);
  };

  const addAddiction = () => {
    if (!newAddiction.name.trim() || !newAddiction.amount) return;

    const addiction = {
      id: Date.now(),
      name: newAddiction.name,
      icon: newAddiction.icon,
      costType: newAddiction.costType,
      amount: parseFloat(newAddiction.amount),
      frequency: newAddiction.frequency,
      lastUsed: newAddiction.lastUsed,
      notes: newAddiction.notes,
      createdAt: new Date().toISOString(),
      relapseHistory: []
    };

    saveAddictions([...addictions, addiction]);
    setNewAddiction({
      name: '',
      icon: '🚬',
      costType: 'money',
      amount: '',
      frequency: 'week',
      lastUsed: new Date().toISOString(),
      notes: ''
    });
    setShowAddAddiction(false);
  };

  const updateAddiction = () => {
    if (!editingAddiction) return;

    const updated = addictions.map(a =>
      a.id === editingAddiction.id ? { ...editingAddiction } : a
    );
    saveAddictions(updated);
    setEditingAddiction(null);
  };

  const deleteAddiction = (id) => {
    if (confirm('Are you sure you want to delete this tracker?')) {
      saveAddictions(addictions.filter(a => a.id !== id));
    }
  };

  const markRelapse = (id) => {
    const updated = addictions.map(addiction => {
      if (addiction.id !== id) return addiction;

      const relapseHistory = addiction.relapseHistory || [];
      return {
        ...addiction,
        lastUsed: new Date().toISOString(),
        relapseHistory: [...relapseHistory, { date: new Date().toISOString() }]
      };
    });

    saveAddictions(updated);
  };

  const getDaysClean = (lastUsed) => {
    const now = new Date();
    const last = new Date(lastUsed);
    const diffTime = Math.abs(now - last);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getHoursClean = (lastUsed) => {
    const now = new Date();
    const last = new Date(lastUsed);
    const diffTime = Math.abs(now - last);
    return Math.floor(diffTime / (1000 * 60 * 60));
  };

  const getMinutesClean = (lastUsed) => {
    const now = new Date();
    const last = new Date(lastUsed);
    const diffTime = Math.abs(now - last);
    return Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  };

  const calculateSavings = (addiction) => {
    const daysClean = getDaysClean(addiction.lastUsed);
    const amount = addiction.amount;
    
    if (addiction.costType === 'money') {
      const dailyCost = addiction.frequency === 'day' ? amount : amount / 7;
      return {
        daily: (dailyCost * Math.min(daysClean, 1)).toFixed(2),
        weekly: (dailyCost * Math.min(daysClean, 7)).toFixed(2),
        monthly: (dailyCost * Math.min(daysClean, 30)).toFixed(2),
        yearly: (dailyCost * Math.min(daysClean, 365)).toFixed(2),
        total: (dailyCost * daysClean).toFixed(2)
      };
    } else {
      // Time in hours
      const dailyHours = addiction.frequency === 'day' ? amount : amount / 7;
      return {
        daily: (dailyHours * Math.min(daysClean, 1)).toFixed(1),
        weekly: (dailyHours * Math.min(daysClean, 7)).toFixed(1),
        monthly: (dailyHours * Math.min(daysClean, 30)).toFixed(1),
        yearly: (dailyHours * Math.min(daysClean, 365)).toFixed(1),
        total: (dailyHours * daysClean).toFixed(1)
      };
    }
  };

  const getMilestoneProgress = (daysClean) => {
    const milestones = [
      { days: 7, label: '1 Week' },
      { days: 21, label: '3 Weeks' },
      { days: 30, label: '1 Month' },
      { days: 90, label: '3 Months' },
      { days: 180, label: '6 Months' },
      { days: 365, label: '1 Year' }
    ];

    const current = milestones.find(m => daysClean < m.days);
    if (!current) return { next: '1 Year+', progress: 100, days: 0 };

    const prevMilestone = milestones[milestones.indexOf(current) - 1];
    const startDays = prevMilestone ? prevMilestone.days : 0;
    const progress = ((daysClean - startDays) / (current.days - startDays)) * 100;

    return {
      next: current.label,
      progress: Math.min(progress, 100),
      days: current.days - daysClean
    };
  };

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;

    const habit = {
      id: Date.now(),
      name: newHabit.name,
      icon: newHabit.icon,
      color: newHabit.color,
      frequency: newHabit.frequency,
      createdAt: new Date().toISOString(),
      completedDates: [],
      streak: 0,
      bestStreak: 0
    };

    saveHabits([...habits, habit]);
    setNewHabit({ name: '', icon: '⭐', color: 'blue', frequency: 'daily' });
    setShowAddHabit(false);
  };

  const deleteHabit = (id) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      saveHabits(habits.filter(h => h.id !== id));
    }
  };

  const toggleHabitCompletion = (id, date) => {
    const updated = habits.map(habit => {
      if (habit.id !== id) return habit;

      const completedDates = habit.completedDates || [];
      const isCompleted = completedDates.includes(date);

      let newCompletedDates;
      if (isCompleted) {
        newCompletedDates = completedDates.filter(d => d !== date);
      } else {
        newCompletedDates = [...completedDates, date].sort();
      }

      // Calculate streak
      const streak = calculateStreak(newCompletedDates);
      const bestStreak = Math.max(streak, habit.bestStreak || 0);

      return {
        ...habit,
        completedDates: newCompletedDates,
        streak,
        bestStreak
      };
    });

    saveHabits(updated);
  };

  const calculateStreak = (completedDates) => {
    if (completedDates.length === 0) return 0;

    const sorted = completedDates.sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today or yesterday is completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (sorted[0] !== today && sorted[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(sorted[0]);

    for (const dateStr of sorted) {
      const date = new Date(dateStr);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (dateStr === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getCompletionRate = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const daysSinceCreated = Math.ceil(
      (new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const daysToCount = Math.min(daysSinceCreated, 30);
    
    return Math.round((habit.completedDates.length / daysToCount) * 100);
  };

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {trackerMode === 'habits' ? 'Habit Tracker' : 'Addiction Recovery Tracker'}
          </h2>
          <button
            onClick={() => trackerMode === 'habits' ? setShowAddHabit(!showAddHabit) : setShowAddAddiction(!showAddAddiction)}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
              trackerMode === 'habits' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-900 hover:bg-red-800'
            }`}
          >
            <Plus className="w-5 h-5" />
            {trackerMode === 'habits' ? 'Add Habit' : 'Add Tracker'}
          </button>
        </div>

        <div className="flex gap-2 border-b border-zinc-300 dark:border-zinc-700">
          <button
            onClick={() => setTrackerMode('habits')}
            className={`px-6 py-3 font-medium transition-all ${
              trackerMode === 'habits'
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Habits
            </span>
          </button>
          <button
            onClick={() => setTrackerMode('addictions')}
            className={`px-6 py-3 font-medium transition-all ${
              trackerMode === 'addictions'
                ? 'text-red-700 dark:text-red-400 border-b-2 border-red-700 dark:border-red-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Skull className="w-5 h-5" />
              Addiction Tracker
            </span>
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      {trackerMode === 'habits' ? (
        <>
          <div className="flex items-center justify-between mb-6" style={{ display: 'none' }}>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Habit Tracker
            </h2>
            <button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Habit
            </button>
          </div>

      {/* Add Habit Form */}
      {showAddHabit && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Create New Habit
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="e.g., Morning Meditation"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {habitIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewHabit({ ...newHabit, icon })}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                      newHabit.icon === icon
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {Object.entries(habitColors).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setNewHabit({ ...newHabit, color: name })}
                    className={`w-10 h-10 rounded-lg ${color} ${
                      newHabit.color === name ? 'ring-4 ring-zinc-400 dark:ring-zinc-500' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addHabit}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Habit
              </button>
              <button
                onClick={() => setShowAddHabit(false)}
                className="px-4 py-2 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{habits.length}</span>
            </div>
            <h3 className="text-sm opacity-90">Active Habits</h3>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {Math.max(...habits.map(h => h.streak || 0), 0)}
              </span>
            </div>
            <h3 className="text-sm opacity-90">Longest Streak</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length}
              </span>
            </div>
            <h3 className="text-sm opacity-90">Completed Today</h3>
          </div>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <Target className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No habits yet. Click "Add Habit" to start tracking!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => {
            const calendarDays = getCalendarDays();
            const completionRate = getCompletionRate(habit);
            
            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${habitColors[habit.color]} rounded-lg flex items-center justify-center text-2xl`}>
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          🔥 {habit.streak || 0} day streak
                        </span>
                        <span>
                          📊 {completionRate}% completion
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 7-Day Calendar */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map(date => {
                    const isCompleted = habit.completedDates?.includes(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={date}
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                        className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                          isCompleted
                            ? `${habitColors[habit.color]} border-transparent text-white`
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                        } ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
                      >
                        <span className="text-xs font-medium opacity-75">
                          {getDayName(date)}
                        </span>
                        <span className="text-sm font-bold">
                          {new Date(date).getDate()}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>30-day progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${habitColors[habit.color]} transition-all duration-300`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      ) : (
        /* Addiction Tracker Mode */
        <div className="transition-all duration-300">
          {/* Skull Animation Header */}
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 opacity-5 dark:opacity-10 flex items-center justify-center">
              <Skull className="w-64 h-64 text-red-900 animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            <div className="relative bg-gradient-to-br from-red-950 to-red-900 dark:from-red-950/50 dark:to-red-900/50 rounded-lg p-6 border border-red-800 dark:border-red-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-red-100 mb-2">Recovery Journey</h3>
                  <p className="text-red-200/80 text-sm italic">"{getRandomQuote()}"</p>
                </div>
                <Skull className="w-12 h-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Add Addiction Form */}
          {showAddAddiction && (
            <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-2xl p-6 mb-6 border-2 border-red-900">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Recovery Tracker
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Addiction Name
                  </label>
                  <input
                    type="text"
                    value={newAddiction.name}
                    onChange={(e) => setNewAddiction({ ...newAddiction, name: e.target.value })}
                    placeholder="e.g., Smoking, Social Media, Gaming"
                    className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-red-900/50 rounded-lg text-zinc-100 focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {addictionIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewAddiction({ ...newAddiction, icon })}
                        className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                          newAddiction.icon === icon
                            ? 'border-red-600 bg-red-900/30'
                            : 'border-zinc-700 hover:border-red-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Cost Type
                    </label>
                    <select
                      value={newAddiction.costType}
                      onChange={(e) => setNewAddiction({ ...newAddiction, costType: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-red-900/50 rounded-lg text-zinc-100"
                    >
                      <option value="money">Money ($)</option>
                      <option value="time">Time (hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAddiction.amount}
                      onChange={(e) => setNewAddiction({ ...newAddiction, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-red-900/50 rounded-lg text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewAddiction({ ...newAddiction, frequency: 'day' })}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        newAddiction.frequency === 'day'
                          ? 'bg-red-800 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      Per Day
                    </button>
                    <button
                      onClick={() => setNewAddiction({ ...newAddiction, frequency: 'week' })}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        newAddiction.frequency === 'week'
                          ? 'bg-red-800 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      Per Week
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Last Used
                  </label>
                  <input
                    type="datetime-local"
                    value={newAddiction.lastUsed.slice(0, 16)}
                    onChange={(e) => setNewAddiction({ ...newAddiction, lastUsed: new Date(e.target.value).toISOString() })}
                    className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-red-900/50 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Notes / Triggers (Optional)
                  </label>
                  <textarea
                    value={newAddiction.notes}
                    onChange={(e) => setNewAddiction({ ...newAddiction, notes: e.target.value })}
                    placeholder="What triggers this? Why are you quitting?"
                    rows="3"
                    className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-red-900/50 rounded-lg text-zinc-100 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addAddiction}
                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Start Tracking
                  </button>
                  <button
                    onClick={() => setShowAddAddiction(false)}
                    className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Stats */}
          {addictions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{addictions.length}</span>
                </div>
                <h3 className="text-sm opacity-90">Active Trackers</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">
                    {Math.max(...addictions.map(a => getDaysClean(a.lastUsed)), 0)}
                  </span>
                </div>
                <h3 className="text-sm opacity-90">Longest Streak (Days)</h3>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    ${addictions.reduce((sum, a) => {
                      if (a.costType === 'money') {
                        return sum + parseFloat(calculateSavings(a).total);
                      }
                      return sum;
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <h3 className="text-sm opacity-90">Total Money Saved</h3>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    {addictions.reduce((sum, a) => {
                      if (a.costType === 'time') {
                        return sum + parseFloat(calculateSavings(a).total);
                      }
                      return sum;
                    }, 0).toFixed(0)}h
                  </span>
                </div>
                <h3 className="text-sm opacity-90">Total Time Recovered</h3>
              </div>
            </div>
          )}

          {/* Addiction Cards */}
          {addictions.length === 0 ? (
            <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-red-900 text-center">
              <Skull className="w-16 h-16 text-red-700 mx-auto mb-4" />
              <p className="text-zinc-400">
                No trackers yet. Click "Add Tracker" to start your recovery journey!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addictions.map(addiction => {
                const daysClean = getDaysClean(addiction.lastUsed);
                const hoursClean = getHoursClean(addiction.lastUsed);
                const minutesClean = getMinutesClean(addiction.lastUsed);
                const savings = calculateSavings(addiction);
                const milestone = getMilestoneProgress(daysClean);
                
                return (
                  <div
                    key={addiction.id}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-lg shadow-2xl p-6 border-2 border-red-900/50 hover:border-red-800 transition-all"
                  >
                    {editingAddiction?.id === addiction.id ? (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-zinc-100">Edit Tracker</h3>
                          <button
                            onClick={() => setEditingAddiction(null)}
                            className="text-zinc-400 hover:text-zinc-200"
                          >
                            ✕
                          </button>
                        </div>

                        <input
                          type="text"
                          value={editingAddiction.name}
                          onChange={(e) => setEditingAddiction({ ...editingAddiction, name: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-800 border border-red-900/50 rounded-lg text-zinc-100"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            step="0.01"
                            value={editingAddiction.amount}
                            onChange={(e) => setEditingAddiction({ ...editingAddiction, amount: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-red-900/50 rounded-lg text-zinc-100"
                          />
                          <select
                            value={editingAddiction.frequency}
                            onChange={(e) => setEditingAddiction({ ...editingAddiction, frequency: e.target.value })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-red-900/50 rounded-lg text-zinc-100"
                          >
                            <option value="day">Per Day</option>
                            <option value="week">Per Week</option>
                          </select>
                        </div>

                        <textarea
                          value={editingAddiction.notes}
                          onChange={(e) => setEditingAddiction({ ...editingAddiction, notes: e.target.value })}
                          rows="3"
                          className="w-full px-4 py-2 bg-zinc-800 border border-red-900/50 rounded-lg text-zinc-100 resize-none"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={updateAddiction}
                            className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingAddiction(null)}
                            className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-900/30 rounded-lg flex items-center justify-center text-4xl border-2 border-red-800">
                              {addiction.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-zinc-100 mb-1">
                                {addiction.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                {addiction.notes && (
                                  <span className="flex items-center gap-1">
                                    💭 {addiction.notes.substring(0, 30)}{addiction.notes.length > 30 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingAddiction(addiction)}
                              className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteAddiction(addiction.id)}
                              className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Days Clean Counter */}
                        <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 border border-emerald-700/50 rounded-lg p-6 mb-4">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-emerald-400 mb-2">
                              {daysClean}
                            </div>
                            <div className="text-emerald-300 text-lg font-semibold mb-1">
                              Days Clean
                            </div>
                            <div className="text-emerald-400/70 text-sm">
                              {hoursClean} hours, {minutesClean} minutes
                            </div>
                            <div className="text-zinc-400 text-xs mt-2">
                              Since {new Date(addiction.lastUsed).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Milestone Progress */}
                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 border border-zinc-700">
                          <div className="flex items-center justify-between text-sm text-zinc-300 mb-2">
                            <span className="flex items-center gap-1">
                              🎯 Next Milestone: <span className="font-bold text-zinc-100">{milestone.next}</span>
                            </span>
                            <span className="text-zinc-400">{milestone.days} days to go</span>
                          </div>
                          <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Savings Display */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                            <div className="text-xs text-zinc-400 mb-1">Total Saved</div>
                            <div className="text-lg font-bold text-emerald-400">
                              {addiction.costType === 'money' ? `$${savings.total}` : `${savings.total}h`}
                            </div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                            <div className="text-xs text-zinc-400 mb-1">Weekly</div>
                            <div className="text-lg font-bold text-blue-400">
                              {addiction.costType === 'money' ? `$${savings.weekly}` : `${savings.weekly}h`}
                            </div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                            <div className="text-xs text-zinc-400 mb-1">Monthly</div>
                            <div className="text-lg font-bold text-purple-400">
                              {addiction.costType === 'money' ? `$${savings.monthly}` : `${savings.monthly}h`}
                            </div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                            <div className="text-xs text-zinc-400 mb-1">Yearly</div>
                            <div className="text-lg font-bold text-yellow-400">
                              {addiction.costType === 'money' ? `$${savings.yearly}` : `${savings.yearly}h`}
                            </div>
                          </div>
                        </div>

                        {/* Cost Info */}
                        <div className="bg-zinc-800/30 rounded-lg p-3 mb-4 border border-zinc-700/50">
                          <div className="text-xs text-zinc-400 flex items-center gap-2">
                            {addiction.costType === 'money' ? (
                              <><DollarSign className="w-4 h-4" /> Cost: ${addiction.amount} per {addiction.frequency}</>
                            ) : (
                              <><Clock className="w-4 h-4" /> Time: {addiction.amount}h per {addiction.frequency}</>
                            )}
                          </div>
                        </div>

                        {/* Relapse History */}
                        {addiction.relapseHistory && addiction.relapseHistory.length > 0 && (
                          <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-4">
                            <div className="text-xs text-amber-400 font-semibold mb-1">
                              Relapse History ({addiction.relapseHistory.length})
                            </div>
                            <div className="text-xs text-amber-300/70">
                              Last relapse: {new Date(addiction.relapseHistory[addiction.relapseHistory.length - 1].date).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {/* Relapse Button */}
                        <button
                          onClick={() => {
                            if (confirm('Mark a relapse? Progress isn\'t linear. Let\'s start again.')) {
                              markRelapse(addiction.id);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-800/30 hover:bg-amber-800/50 border border-amber-700 text-amber-300 rounded-lg transition-colors"
                        >
                          <AlertTriangle className="w-5 h-5" />
                          Mark Relapse
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HabitTracker;
