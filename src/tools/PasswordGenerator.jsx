import React, { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';

function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character type');
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let strength = 0;
    if (length >= 12) strength++;
    if (length >= 16) strength++;
    if (options.uppercase) strength++;
    if (options.lowercase) strength++;
    if (options.numbers) strength++;
    if (options.symbols) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Password Generator</h2>

      {/* Password Display */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={password}
            readOnly
            placeholder="Click generate to create password"
            className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-lg"
          />
          <button
            onClick={copyToClipboard}
            disabled={!password}
            className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={generatePassword}
            className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            title="Generate new password"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Strength Indicator */}
        {password && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Strength:</span>
            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all`}
                style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%' }}
              />
            </div>
            <span className={`text-sm font-semibold ${
              strength.label === 'Weak' ? 'text-red-500' :
              strength.label === 'Medium' ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Password Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'uppercase', label: 'Uppercase (A-Z)' },
            { key: 'lowercase', label: 'Lowercase (a-z)' },
            { key: 'numbers', label: 'Numbers (0-9)' },
            { key: 'symbols', label: 'Symbols (!@#$...)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generatePassword}
          className="w-full mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          Generate Password
        </button>
      </div>
    </div>
  );
}

export default PasswordGenerator;
