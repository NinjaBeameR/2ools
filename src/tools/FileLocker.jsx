import React, { useState } from 'react';
import { Lock, FileUp, FileDown, Key, AlertCircle, CheckCircle, Loader } from 'lucide-react';

function FileLocker() {
  const [mode, setMode] = useState('encrypt');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectFile = async () => {
    try {
      const result = await window.electron.selectFile();
      if (result) {
        setSelectedFile(result);
        setError('');
      }
    } catch (err) {
      setError('Failed to select file');
    }
  };

  const processFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (mode === 'encrypt' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const result = await window.electron.processFile({
        filePath: selectedFile,
        password,
        mode
      });
      setSuccess(`File ${mode === 'encrypt' ? 'encrypted' : 'decrypted'} successfully: ${result.outputPath}`);
      setPassword('');
      setConfirmPassword('');
      setSelectedFile('');
    } catch (err) {
      setError(`Failed to ${mode}: ` + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">File Locker</h2>

      {/* Mode Selection */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setMode('encrypt')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}>
            <Lock className="w-5 h-5" />
            Encrypt File
          </button>
          <button onClick={() => setMode('decrypt')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'decrypt' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}>
            <Key className="w-5 h-5" />
            Decrypt File
          </button>
        </div>

        {/* File Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select File</label>
          <div className="flex gap-2">
            <button onClick={selectFile} className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2">
              {mode === 'encrypt' ? <FileUp className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}
              Browse
            </button>
            <input type="text" value={selectedFile} readOnly placeholder="No file selected"
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
        </div>

        {/* Confirm Password (Encrypt only) */}
        {mode === 'encrypt' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
          </div>
        )}

        {/* Messages */}
        {error && <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
        {success && <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-5 h-5" /><span className="text-sm">{success}</span></div>}

        {/* Process Button */}
        <button onClick={processFile} disabled={processing || !selectedFile || !password}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            mode === 'encrypt' ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400' : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400'
          }`}>
          {processing ? (
            <><Loader className="w-5 h-5 animate-spin" />Processing...</>
          ) : (
            <>{mode === 'encrypt' ? <><Lock className="w-5 h-5" />Encrypt File</> : <><Key className="w-5 h-5" />Decrypt File</>}</>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="space-y-1">
              <li>• Encrypted files get `.locked` extension</li>
              <li>• Uses AES-256 encryption</li>
              <li>• Original files are preserved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileLocker;
