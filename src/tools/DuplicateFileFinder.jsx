import React, { useState } from 'react';
import { Upload, Search, Trash2, Copy } from 'lucide-react';

function DuplicateFileFinder() {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setScanning(true);

    // Group files by size and name for duplicate detection
    const fileMap = new Map();
    
    for (const file of selectedFiles) {
      const key = `${file.name}-${file.size}`;
      if (fileMap.has(key)) {
        fileMap.get(key).push(file);
      } else {
        fileMap.set(key, [file]);
      }
    }

    // Find duplicates
    const dupes = [];
    for (const [key, fileList] of fileMap) {
      if (fileList.length > 1) {
        dupes.push({
          id: Date.now() + Math.random(),
          name: fileList[0].name,
          size: fileList[0].size,
          count: fileList.length,
          files: fileList,
        });
      }
    }

    setFiles(selectedFiles);
    setDuplicates(dupes);
    setScanning(false);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalWastedSpace = duplicates.reduce((sum, dup) => 
    sum + (dup.size * (dup.count - 1)), 0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Duplicate File Finder</h2>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This tool checks for duplicates based on filename and size. For full system scanning with content comparison, consider using dedicated desktop applications.
        </p>
      </div>

      {/* Upload Area */}
      {files.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Select files to scan for duplicates
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose multiple files from a folder
            </span>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{files.length}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Files Scanned</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{duplicates.length}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Duplicate Groups</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatSize(totalWastedSpace)}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Wasted Space</p>
            </div>
          </div>

          {/* Results */}
          {duplicates.length === 0 ? (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
              <Search className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <p className="text-zinc-900 dark:text-zinc-100 text-lg font-semibold mb-2">No duplicates found!</p>
              <p className="text-zinc-500 dark:text-zinc-400">All files are unique</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Found {duplicates.length} duplicate groups
                </h3>
                <button
                  onClick={() => {
                    setFiles([]);
                    setDuplicates([]);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                >
                  Scan New Files
                </button>
              </div>

              {duplicates.map((dup) => (
                <div
                  key={dup.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{dup.name}</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatSize(dup.size)} • {dup.count} copies • Wasted: {formatSize(dup.size * (dup.count - 1))}
                      </p>
                    </div>
                    <Copy className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded p-2">
                    Keep 1 copy, delete {dup.count - 1} duplicate{dup.count > 2 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DuplicateFileFinder;
