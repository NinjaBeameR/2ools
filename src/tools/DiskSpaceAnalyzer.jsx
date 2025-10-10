import React, { useState } from 'react';
import { HardDrive, FolderOpen, Loader, AlertCircle } from 'lucide-react';

function DiskSpaceAnalyzer() {
  const [scanning, setScanning] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  const [results, setResults] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState('');

  const selectFolder = async () => {
    try {
      const result = await window.electron.selectFolder();
      if (result) {
        setFolderPath(result);
        setError('');
      }
    } catch (err) {
      setError('Failed to select folder');
    }
  };

  const analyzeDisk = async () => {
    if (!folderPath) {
      setError('Please select a folder first');
      return;
    }

    setScanning(true);
    setError('');
    try {
      const analysis = await window.electron.analyzeDiskSpace(folderPath);
      setResults(analysis.items);
      setTotalSize(analysis.totalSize);
    } catch (err) {
      setError('Failed to analyze: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-orange-500', 'bg-red-500'];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Disk Space Analyzer</h2>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-4">
          <button onClick={selectFolder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <FolderOpen className="w-5 h-5" />
            Select Folder
          </button>
          <input type="text" value={folderPath} readOnly placeholder="No folder selected"
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
          <button onClick={analyzeDisk} disabled={!folderPath || scanning}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white rounded-lg">
            {scanning ? <><Loader className="w-5 h-5 animate-spin" />Analyzing...</> : <><HardDrive className="w-5 h-5" />Analyze</>}
          </button>
        </div>
        {error && <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
      </div>

      {results.length > 0 && (
        <>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex justify-between">
              <div><p className="text-sm text-zinc-600 dark:text-zinc-400">Total Size</p><p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{formatSize(totalSize)}</p></div>
              <div className="text-right"><p className="text-sm text-zinc-600 dark:text-zinc-400">Items</p><p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{results.length}</p></div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700"><h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Top Items</h3></div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700 max-h-96 overflow-auto">
              {results.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex justify-between">
                    <div className="flex gap-3 flex-1"><div className={`w-3 h-3 rounded ${colors[idx % colors.length]}`}></div>
                      <div><p className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">{item.type}</p></div>
                    </div>
                    <div className="text-right"><p className="font-semibold text-zinc-900 dark:text-zinc-100">{formatSize(item.size)}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{((item.size/totalSize)*100).toFixed(1)}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {results.length === 0 && !scanning && (
        <div className="text-center py-12"><HardDrive className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Select a folder to analyze disk usage</p></div>
      )}
    </div>
  );
}

export default DiskSpaceAnalyzer;
