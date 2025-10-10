import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, X, Download, FileText } from 'lucide-react';

function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const moveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge');
      return;
    }

    setMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();

      URL.revokeObjectURL(url);
      alert('PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs: ' + error.message);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">PDF Merger</h2>

      {/* Upload Area */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 mb-6">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3" />
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Click to select PDF files
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            or drag and drop PDF files here
          </span>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <FileText className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No PDF files selected</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">Upload at least 2 PDF files to merge</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Selected Files ({files.length})
              </h3>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={mergePDFs}
            disabled={files.length < 2 || merging}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors"
          >
            {merging ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Merge {files.length} PDFs
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default PDFMerger;
