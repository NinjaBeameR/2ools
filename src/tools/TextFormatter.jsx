import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function TextFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatters = [
    {
      name: 'UPPERCASE',
      fn: (text) => text.toUpperCase(),
    },
    {
      name: 'lowercase',
      fn: (text) => text.toLowerCase(),
    },
    {
      name: 'Title Case',
      fn: (text) => text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    },
    {
      name: 'Sentence case',
      fn: (text) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    },
    {
      name: 'camelCase',
      fn: (text) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()),
    },
    {
      name: 'snake_case',
      fn: (text) => text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    },
    {
      name: 'kebab-case',
      fn: (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    },
    {
      name: 'Remove Extra Spaces',
      fn: (text) => text.replace(/\s+/g, ' ').trim(),
    },
    {
      name: 'Remove Line Breaks',
      fn: (text) => text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(),
    },
    {
      name: 'Reverse Text',
      fn: (text) => text.split('').reverse().join(''),
    },
    {
      name: 'Count Words',
      fn: (text) => {
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        return `Words: ${words} | Characters: ${chars} | Characters (no spaces): ${charsNoSpaces}`;
      },
    },
  ];

  const applyFormat = (formatter) => {
    if (!input.trim()) {
      alert('Please enter some text first');
      return;
    }
    setOutput(formatter.fn(input));
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Text Formatter</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Input Text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-64 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Output
            </label>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white transition-colors text-sm flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted text will appear here..."
            className="w-full h-64 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>
      </div>

      {/* Format Buttons */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Text Transformations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {formatters.map((formatter, index) => (
            <button
              key={index}
              onClick={() => applyFormat(formatter)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {formatter.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TextFormatter;
