import React, { useState, useEffect } from 'react';
import { Target, CheckSquare, Timer, TrendingUp, Calendar, Plus, Trash2 } from 'lucide-react';

function DailyGoalDashboard() {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load data from localStorage
  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = () => {
    // Load goals
    const savedGoals = JSON.parse(localStorage.getItem('dailyGoals') || '{}');
    setGoals(savedGoals[selectedDate] || []);

    // Load habits
    const savedHabits = JSON.parse(localStorage.getItem('habitTracker') || '[]');
    setHabits(savedHabits);

    // Load Pomodoro sessions
    const savedPomodoro = JSON.parse(localStorage.getItem('pomodoroHistory') || '[]');
    const todaySessions = savedPomodoro.filter(session => 
      session.date === selectedDate
    );
    setPomodoroSessions(todaySessions);
  };

  const addGoal = () => {
    if (!newGoalText.trim()) return;

    const newGoal = {
      id: Date.now(),
      text: newGoalText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const savedGoals = JSON.parse(localStorage.getItem('dailyGoals') || '{}');
    savedGoals[selectedDate] = [...(savedGoals[selectedDate] || []), newGoal];
    localStorage.setItem('dailyGoals', JSON.stringify(savedGoals));

    setGoals(savedGoals[selectedDate]);
    setNewGoalText('');
    setShowAddGoal(false);
  };

  const toggleGoal = (id) => {
    const savedGoals = JSON.parse(localStorage.getItem('dailyGoals') || '{}');
    const dateGoals = savedGoals[selectedDate] || [];
    const updated = dateGoals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    savedGoals[selectedDate] = updated;
    localStorage.setItem('dailyGoals', JSON.stringify(savedGoals));
    setGoals(updated);
  };

  const deleteGoal = (id) => {
    const savedGoals = JSON.parse(localStorage.getItem('dailyGoals') || '{}');
    const dateGoals = savedGoals[selectedDate] || [];
    savedGoals[selectedDate] = dateGoals.filter(goal => goal.id !== id);
    localStorage.setItem('dailyGoals', JSON.stringify(savedGoals));
    setGoals(savedGoals[selectedDate]);
  };

  const calculateProgress = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  const getHabitProgress = (habit) => {
    if (!habit.completedDates) return 0;
    const completed = habit.completedDates.includes(selectedDate);
    return completed ? 100 : 0;
  };

  const getPomodoroStats = () => {
    const totalMinutes = pomodoroSessions.reduce((sum, session) => {
      return sum + (session.duration || 25);
    }, 0);
    return {
      sessions: pomodoroSessions.length,
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(1)
    };
  };

  const getDayProgress = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const elapsed = now - midnight;
    const total = endOfDay - midnight;
    return Math.round((elapsed / total) * 100);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const pomodoroStats = getPomodoroStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Daily Goal Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {isToday && (
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Goals Progress */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{calculateProgress()}%</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Goals Progress</h3>
          <p className="text-xs opacity-75">
            {goals.filter(g => g.completed).length} of {goals.length} completed
          </p>
        </div>

        {/* Pomodoro Sessions */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Timer className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{pomodoroStats.sessions}</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Pomodoro Sessions</h3>
          <p className="text-xs opacity-75">
            {pomodoroStats.hours} hours focused
          </p>
        </div>

        {/* Habits */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              {habits.filter(h => h.completedDates?.includes(selectedDate)).length}
            </span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Habits Completed</h3>
          <p className="text-xs opacity-75">
            of {habits.length} tracked habits
          </p>
        </div>

        {/* Day Progress */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{isToday ? getDayProgress() : 100}%</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Day Progress</h3>
          <p className="text-xs opacity-75">
            {isToday ? 'Time elapsed today' : 'Day completed'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Goals */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Daily Goals
            </h3>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {showAddGoal && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                placeholder="Enter your goal..."
                className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                No goals set for this day. Click + to add one!
              </p>
            ) : (
              goals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleGoal(goal.id)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-zinc-900 dark:text-zinc-100 ${
                      goal.completed ? 'line-through opacity-50' : ''
                    }`}
                  >
                    {goal.text}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habits Overview */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Habit Tracker
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {habits.length === 0 ? (
              <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                No habits being tracked.
                <br />
                <span className="text-sm">Create habits in the Habit Tracker tool.</span>
              </p>
            ) : (
              habits.map(habit => {
                const isCompleted = habit.completedDates?.includes(selectedDate);
                return (
                  <div key={habit.id} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {habit.name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {isCompleted ? '✓ Done' : 'Pending'}
                      </span>
                    </div>
                    {habit.streak > 0 && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        🔥 {habit.streak} day streak
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pomodoro Summary */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 lg:col-span-2">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-600" />
            Pomodoro Sessions
          </h3>

          {pomodoroSessions.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
              No Pomodoro sessions recorded for this day.
            </p>
          ) : (
            <div className="space-y-2">
              {pomodoroSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <Timer className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        Session {index + 1}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(session.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {session.duration || 25} min
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyGoalDashboard;
