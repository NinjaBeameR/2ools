import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';

function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todoTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">To-Do List</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Active</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">{stats.completed}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed</p>
        </div>
      </div>

      {/* Add Task */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {stats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="ml-auto px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear Completed
          </button>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            {tasks.length === 0 
              ? 'No tasks yet. Add one to get started!' 
              : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-600'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'text-zinc-400 dark:text-zinc-500 line-through'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ToDoList;
