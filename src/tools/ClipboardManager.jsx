import React, { useState } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';

function ClipboardManager() {
  const [clipboardHistory, setClipboardHistory] = useState([
    { id: 1, text: 'Example clipboard item 1', timestamp: new Date().toLocaleTimeString() },
    { id: 2, text: 'Example clipboard item 2', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = (id) => {
    setClipboardHistory(clipboardHistory.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (confirm('Clear all clipboard history?')) {
      setClipboardHistory([]);
    }
  };

  const addItem = () => {
    navigator.clipboard.readText().then(text => {
      if (text.trim()) {
        const newItem = {
          id: Date.now(),
          text: text,
          timestamp: new Date().toLocaleTimeString(),
        };
        setClipboardHistory([newItem, ...clipboardHistory]);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Clipboard Manager</h2>
        <div className="flex gap-2">
          <button
            onClick={addItem}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Add Current Clipboard
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Full clipboard monitoring requires Electron integration. Currently showing manual clipboard management.
        </p>
      </div>

      {clipboardHistory.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No clipboard items yet</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">Click "Add Current Clipboard" to save an item</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clipboardHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-900 dark:text-zinc-100 break-words">{item.text}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{item.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.text, item.id)}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
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
