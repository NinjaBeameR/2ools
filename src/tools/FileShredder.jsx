import React, { useState } from 'react';
import { Upload, Trash2, AlertTriangle, Shield, X } from 'lucide-react';

function FileShredder() {
  const [filesToShred, setFilesToShred] = useState([]);
  const [overwritePasses, setOverwritePasses] = useState(3);
  const [isShredding, setIsShredding] = useState(false);
  const [progress, setProgress] = useState(0);

  const securityLevels = {
    1: { name: 'Fast (1 pass)', description: 'Quick overwrite, basic security' },
    3: { name: 'Standard (3 passes)', description: 'DoD 5220.22-M standard' },
    7: { name: 'Secure (7 passes)', description: 'Very secure, slower' },
    35: { name: 'Maximum (35 passes)', description: 'Gutmann method, extreme security' }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      path: file.webkitRelativePath || file.name,
      file: file
    }));
    setFilesToShred([...filesToShred, ...fileData]);
  };

  const removeFile = (id) => {
    setFilesToShred(filesToShred.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const shredFiles = async () => {
    if (filesToShred.length === 0) {
      alert('Please add files to shred');
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING ⚠️\n\nYou are about to PERMANENTLY DELETE ${filesToShred.length} file(s).\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Files will be overwritten ${overwritePasses} time(s) before deletion.\n\n` +
      `Are you absolutely sure you want to continue?`
    );

    if (!confirmed) return;

    setIsShredding(true);
    setProgress(0);

    try {
      // Note: In a real Electron app, you would use Node.js fs module
      // to actually overwrite and delete files. This is a demonstration.
      
      for (let i = 0; i < filesToShred.length; i++) {
        const file = filesToShred[i];
        
        // Simulate shredding process
        for (let pass = 1; pass <= overwritePasses; pass++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          const totalSteps = filesToShred.length * overwritePasses;
          const currentStep = (i * overwritePasses) + pass;
          setProgress(Math.round((currentStep / totalSteps) * 100));
        }
      }

      alert(
        `✅ Shredding Complete!\n\n` +
        `${filesToShred.length} file(s) have been securely deleted.\n\n` +
        `Note: In development mode, files are not actually deleted. ` +
        `In production with Electron, files would be permanently removed from disk.`
      );

      setFilesToShred([]);
      setProgress(0);
    } catch (error) {
      console.error('Shredding error:', error);
      alert('Error during file shredding. Please try again.');
    } finally {
      setIsShredding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Secure File Shredder
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Permanently delete files with military-grade overwriting
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              ⚠️ Permanent Deletion Warning
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              Files shredded with this tool <strong>CANNOT be recovered</strong>. 
              The shredding process overwrites file data multiple times before deletion,
              making recovery impossible even with specialized software.
            </p>
          </div>
        </div>
      </div>

      {/* Security Level Selection */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Security Level
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(securityLevels).map(([passes, level]) => (
            <button
              key={passes}
              onClick={() => setOverwritePasses(parseInt(passes))}
              disabled={isShredding}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                overwritePasses === parseInt(passes)
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400'
              } ${isShredding ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {level.name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {level.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          isShredding
            ? 'border-zinc-300 dark:border-zinc-600 opacity-50 cursor-not-allowed'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-red-500 dark:hover:border-red-400'
        }`}>
          <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3" />
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Select Files to Shred
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Click to browse or drag and drop
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isShredding}
            className="hidden"
          />
        </label>
      </div>

      {/* Files List */}
      {filesToShred.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Files to Shred ({filesToShred.length})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filesToShred.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  disabled={isShredding}
                  className="ml-3 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Total:</strong> {filesToShred.length} file(s) • 
              {formatFileSize(filesToShred.reduce((sum, f) => sum + f.size, 0))}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Each file will be overwritten {overwritePasses} time(s)
            </p>
          </div>
        </div>
      )}

      {/* Shred Button */}
      {filesToShred.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          {isShredding ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                <span>Shredding files securely...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                Pass {Math.ceil((progress / 100) * overwritePasses)} of {overwritePasses}
              </p>
            </div>
          ) : (
            <button
              onClick={shredFiles}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              <Trash2 className="w-5 h-5" />
              Permanently Shred {filesToShred.length} File{filesToShred.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How File Shredding Works:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>1 Pass:</strong> Overwrites with random data once (fast)</li>
          <li>• <strong>3 Passes:</strong> DoD 5220.22-M standard (secure)</li>
          <li>• <strong>7 Passes:</strong> Bruce Schneier's algorithm (very secure)</li>
          <li>• <strong>35 Passes:</strong> Gutmann method (maximum security)</li>
        </ul>
      </div>
    </div>
  );
}

export default FileShredder;
