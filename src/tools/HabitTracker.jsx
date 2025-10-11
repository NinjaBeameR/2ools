import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, TrendingUp, Calendar, Target } from 'lucide-react';

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '⭐', color: 'blue', frequency: 'daily' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'calendar'

  const habitIcons = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🎵', '🥗', '😴'];
  const habitColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500'
  };

  useEffect(() => {
    loadHabits();
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
      <div className="flex items-center justify-between mb-6">
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
    </div>
  );
}

export default HabitTracker;
