import React, { useState, useEffect } from 'react';
import { Save, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

function DailyJournal() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState({});
  const [currentEntry, setCurrentEntry] = useState('');
  const [mood, setMood] = useState('neutral');

  useEffect(() => {
    const saved = localStorage.getItem('dailyJournal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyJournal', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const entry = entries[selectedDate];
    setCurrentEntry(entry?.text || '');
    setMood(entry?.mood || 'neutral');
  }, [selectedDate, entries]);

  const saveEntry = () => {
    setEntries({
      ...entries,
      [selectedDate]: {
        text: currentEntry,
        mood,
        updatedAt: new Date().toISOString(),
      },
    });
    alert('Entry saved!');
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const moods = [
    { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'bg-green-500' },
    { value: 'good', emoji: '😊', label: 'Good', color: 'bg-emerald-500' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
    { value: 'bad', emoji: '😔', label: 'Bad', color: 'bg-orange-500' },
    { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'bg-red-500' },
  ];

  const wordCount = currentEntry.trim().split(/\s+/).filter(Boolean).length;
  const hasEntry = entries[selectedDate]?.text;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpen className="w-7 h-7" />
          Daily Journal
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Date Display */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDate(selectedDate)}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {hasEntry ? 'Entry saved' : 'No entry yet'}
              </p>
            </div>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Mood Selector */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">How are you feeling today?</h3>
        <div className="flex gap-3">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                mood === m.value
                  ? `${m.color} border-transparent text-white`
                  : 'bg-zinc-100 dark:bg-zinc-700 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="text-3xl mb-1">{m.emoji}</div>
              <div className={`text-sm font-medium ${mood === m.value ? 'text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {m.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Journal Entry */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Your Entry</h3>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        </div>
        <textarea
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
          className="w-full h-96 p-6 bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none"
        />
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
          <button
            onClick={saveEntry}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            Save Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {Object.keys(entries).length}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Entries</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Object.values(entries).reduce((sum, e) => sum + (e.text?.split(/\s+/).filter(Boolean).length || 0), 0)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Words</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-2xl">
            {entries[selectedDate]?.mood ? moods.find(m => m.value === entries[selectedDate].mood)?.emoji : '📝'}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Today's Mood</p>
        </div>
      </div>
    </div>
  );
}

export default DailyJournal;
