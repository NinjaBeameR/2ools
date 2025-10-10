import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, Clock } from 'lucide-react';

function ReminderAlerts() {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }

    // Set default date/time
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));

    // Check for due reminders
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderTime = new Date(reminder.datetime);
        if (!reminder.triggered && reminderTime <= now) {
          showNotification(reminder);
          markAsTriggered(reminder.id);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  const showNotification = (reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Reminder', {
        body: reminder.title,
        icon: '/icon.png',
      });
    } else {
      alert(`Reminder: ${reminder.title}`);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const addReminder = () => {
    if (!title.trim() || !date || !time) {
      alert('Please fill in all fields');
      return;
    }

    const datetime = `${date}T${time}`;
    const newReminder = {
      id: Date.now(),
      title: title.trim(),
      datetime,
      triggered: false,
      createdAt: new Date().toISOString(),
    };

    setReminders([...reminders, newReminder].sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    ));
    setTitle('');
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const markAsTriggered = (id) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, triggered: true } : r
    ));
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const isUpcoming = (datetime) => {
    return new Date(datetime) > new Date();
  };

  const upcomingReminders = reminders.filter(r => !r.triggered && isUpcoming(r.datetime));
  const pastReminders = reminders.filter(r => r.triggered || !isUpcoming(r.datetime));

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Reminder Alerts</h2>

      {/* Notification Permission */}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            Enable notifications to receive reminders
          </p>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Add Reminder */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">New Reminder</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to be reminded about?"
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            onClick={addReminder}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Reminder
          </button>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Upcoming ({upcomingReminders.length})
        </h3>
        {upcomingReminders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-700 text-center">
            <Bell className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">No upcoming reminders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3"
              >
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{reminder.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(reminder.datetime)}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
            Past ({pastReminders.length})
          </h3>
          <div className="space-y-2">
            {pastReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 opacity-60"
              >
                <Bell className="w-5 h-5 text-zinc-400" />
                <div className="flex-1">
                  <p className="font-medium text-zinc-600 dark:text-zinc-400 line-through">{reminder.title}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {formatDateTime(reminder.datetime)}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderAlerts;
