import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Check, Play, Pause, AlertCircle } from 'lucide-react';

function ClipboardManager() {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [monitoring, setMonitoring] = useState(false);
  const [maxItems, setMaxItems] = useState(50);

  useEffect(() => {
    // Load saved history
    const saved = localStorage.getItem('clipboardHistory');
    if (saved) {
      setClipboardHistory(JSON.parse(saved));
    }

    // Setup clipboard monitoring
    if (window.electron?.startClipboardMonitoring) {
      window.electron.onClipboardChange((text) => {
        if (text && text.trim()) {
          addToHistory(text);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Save history to localStorage
    localStorage.setItem('clipboardHistory', JSON.stringify(clipboardHistory));
  }, [clipboardHistory]);

  const addToHistory = (text) => {
    // Don't add duplicates of the most recent item
    if (clipboardHistory[0]?.text === text) return;

    const newItem = {
      id: Date.now(),
      text: text.substring(0, 5000), // Limit text length
      timestamp: new Date().toLocaleString(),
    };

    setClipboardHistory(prev => {
      const updated = [newItem, ...prev];
      return updated.slice(0, maxItems);
    });
  };

  const toggleMonitoring = async () => {
    if (window.electron?.toggleClipboardMonitoring) {
      const isMonitoring = await window.electron.toggleClipboardMonitoring(!monitoring);
      setMonitoring(isMonitoring);
    } else {
      // Fallback: manual add
      addCurrentClipboard();
    }
  };

  const addCurrentClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        addToHistory(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deleteItem = (id) => {
    setClipboardHistory(clipboardHistory.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (confirm('Clear all clipboard history?')) {
      setClipboardHistory([]);
      localStorage.removeItem('clipboardHistory');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Clipboard Manager</h2>
        <div className="flex gap-2">
          <button
            onClick={toggleMonitoring}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              monitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {monitoring ? <><Pause className="w-4 h-4" />Stop</> : <><Play className="w-4 h-4" />Start</>}
          </button>
          <button
            onClick={addCurrentClipboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Add Current
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${monitoring ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></div>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">
              {monitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
            </span>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {clipboardHistory.length} / {maxItems} items
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">How to use:</p>
            <ul className="space-y-1">
              <li>• Click "Start" to automatically track clipboard changes</li>
              <li>• Or use "Add Current" to manually save clipboard</li>
              <li>• Click any item to copy it back to clipboard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* History */}
      {clipboardHistory.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <Copy className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No clipboard items yet</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">
            {monitoring ? 'Copy something to start tracking' : 'Click "Start" or "Add Current"'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clipboardHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-wrap">
                    {item.text.length > 300 ? item.text.substring(0, 300) + '...' : item.text}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{item.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.text, item.id)}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClipboardManager;
