import React, { useState } from 'react';
import { Trash2, FolderOpen, Loader, AlertCircle, CheckCircle } from 'lucide-react';

function TemporaryFileCleaner() {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectFolder = async () => {
    try {
      const result = await window.electron.selectFolder();
      if (result) {
        setFolderPath(result);
        setError('');
        setSuccess('');
      }
    } catch (err) {
      setError('Failed to select folder');
    }
  };

  const scanFolder = async () => {
    if (!folderPath) {
      setError('Please select a folder first');
      return;
    }

    setScanning(true);
    setError('');
    setSuccess('');
    try {
      const result = await window.electron.scanTempFiles(folderPath);
      setFiles(result.files);
      setTotalSize(result.totalSize);
    } catch (err) {
      setError('Failed to scan: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const cleanFiles = async () => {
    setCleaning(true);
    setError('');
    try {
      const result = await window.electron.cleanTempFiles(folderPath);
      setSuccess(`Cleaned ${result.deletedCount} files (${formatSize(result.freedSpace)})`);
      setFiles([]);
      setTotalSize(0);
    } catch (err) {
      setError('Failed to clean: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Temporary File Cleaner</h2>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-4 mb-4">
          <button onClick={selectFolder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <FolderOpen className="w-5 h-5" />
            Select Folder
          </button>
          <input type="text" value={folderPath} readOnly placeholder="No folder selected"
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
          <button onClick={scanFolder} disabled={!folderPath || scanning}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white rounded-lg">
            {scanning ? <Loader className="w-5 h-5 animate-spin" /> : 'Scan'}
          </button>
        </div>

        {error && <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
        {success && <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Quick Access Temp Folders:</p>
              <ul className="space-y-1">
                <li>• Press Win + R, type <code className="px-1 bg-yellow-100 dark:bg-yellow-800 rounded">%temp%</code></li>
                <li>• Downloads folder</li>
                <li>• Recycle Bin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Files Found</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{files.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Size</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{formatSize(totalSize)}</p>
              </div>
              <button onClick={cleanFiles} disabled={cleaning}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-400 text-white rounded-lg text-lg">
                {cleaning ? <><Loader className="w-5 h-5 animate-spin" />Cleaning...</> : <><Trash2 className="w-5 h-5" />Clean All</>}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700"><h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Files to Clean</h3></div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700 max-h-96 overflow-auto">
              {files.map((file, idx) => (
                <div key={idx} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex justify-between">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate flex-1">{file.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-4">{formatSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {files.length === 0 && !scanning && (
        <div className="text-center py-12"><Trash2 className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Select a folder to scan for temporary files</p></div>
      )}
    </div>
  );
}

export default TemporaryFileCleaner;
