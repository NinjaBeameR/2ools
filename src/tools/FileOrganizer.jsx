import React, { useState } from 'react';
import { Upload, FolderOpen, Download, FileText, Image, Music, Video, Archive } from 'lucide-react';

function FileOrganizer() {
  const [files, setFiles] = useState([]);
  const [organized, setOrganized] = useState(null);

  const fileCategories = {
    Documents: { extensions: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx', '.csv'], icon: FileText, color: 'blue' },
    Images: { extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'], icon: Image, color: 'emerald' },
    Videos: { extensions: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv'], icon: Video, color: 'purple' },
    Music: { extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'], icon: Music, color: 'pink' },
    Archives: { extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'], icon: Archive, color: 'orange' },
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    organizeFiles(selectedFiles);
  };

  const organizeFiles = (fileList) => {
    const categories = {};
    const uncategorized = [];

    fileList.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      let categorized = false;

      for (const [category, data] of Object.entries(fileCategories)) {
        if (data.extensions.includes(ext)) {
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(file);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        uncategorized.push(file);
      }
    });

    setOrganized({ categories, uncategorized });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getTotalSize = (fileList) => {
    return fileList.reduce((sum, file) => sum + file.size, 0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">File Organizer</h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Organize your files:</strong> This tool categorizes your files by type. In a real implementation, it would create folders and move files automatically.
        </p>
      </div>

      {/* Upload Area */}
      {files.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Select files to organize
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Files will be categorized by type
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
          {/* Summary */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {files.length} files organized
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total size: {formatSize(getTotalSize(files))}
                </p>
              </div>
              <button
                onClick={() => {
                  setFiles([]);
                  setOrganized(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Organize New Files
              </button>
            </div>
          </div>

          {/* Categories */}
          {organized && (
            <div className="space-y-4">
              {Object.entries(organized.categories).map(([category, fileList]) => {
                const categoryData = fileCategories[category];
                const Icon = categoryData.icon;
                return (
                  <div
                    key={category}
                    className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                  >
                    <div className={`bg-${categoryData.color}-50 dark:bg-${categoryData.color}-900/20 p-4 border-b border-zinc-200 dark:border-zinc-700`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 text-${categoryData.color}-600 dark:text-${categoryData.color}-400`} />
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{category}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {fileList.length} files • {formatSize(getTotalSize(fileList))}
                            </p>
                          </div>
                        </div>
                        <FolderOpen className={`w-5 h-5 text-${categoryData.color}-600 dark:text-${categoryData.color}-400`} />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2 max-h-48 overflow-auto">
                        {fileList.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded"
                          >
                            <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate flex-1">
                              {file.name}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                              {formatSize(file.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized */}
              {organized.uncategorized.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Other Files ({organized.uncategorized.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {organized.uncategorized.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded"
                      >
                        <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                          {formatSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileOrganizer;
