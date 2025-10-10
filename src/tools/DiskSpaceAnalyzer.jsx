import React from 'react';
import { HardDrive, AlertCircle } from 'lucide-react';

function DiskSpaceAnalyzer() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <HardDrive className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Temporarily Unavailable - Im working on it
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This tool requires system-level file access.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200 text-left">
              <p className="font-semibold mb-1">Recommended:</p>
              <ul className="space-y-1">
                <li>• WinDirStat</li>
                <li>• TreeSize Free</li>
                <li>• SpaceSniffer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiskSpaceAnalyzer;
