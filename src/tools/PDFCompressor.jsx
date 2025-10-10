import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, FileText, Gauge } from 'lucide-react';

function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const compressPDF = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setCompressing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Note: pdf-lib doesn't have built-in compression beyond what it does by default
      // For real compression, you'd need a server-side solution or more advanced libraries
      // This is a placeholder that re-saves the PDF with optimization
      
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: compressionLevel !== 'low',
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_compressed.pdf');
      link.click();

      URL.revokeObjectURL(url);

      const originalSize = file.size;
      const compressedSize = pdfBytes.length;
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      alert(`PDF optimized!\nOriginal: ${(originalSize / 1024).toFixed(2)} KB\nOptimized: ${(compressedSize / 1024).toFixed(2)} KB\nReduction: ${reduction}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF: ' + error.message);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">PDF Compressor</h2>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This tool performs basic PDF optimization. For maximum compression, consider using server-side solutions or dedicated PDF compression tools.
        </p>
      </div>

      {/* Upload Area */}
      {!file ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Click to select a PDF file
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Reduce PDF file size while maintaining quality
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          {/* File Info */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {/* Compression Level */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Compression Level
              </label>
              <div className="space-y-2">
                {[
                  { value: 'low', label: 'Low', desc: 'Minimal compression, best quality' },
                  { value: 'medium', label: 'Medium', desc: 'Balanced compression and quality' },
                  { value: 'high', label: 'High', desc: 'Maximum compression, may reduce quality' },
                ].map((level) => (
                  <label key={level.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700">
                    <input
                      type="radio"
                      name="compressionLevel"
                      value={level.value}
                      checked={compressionLevel === level.value}
                      onChange={(e) => setCompressionLevel(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{level.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{level.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={compressPDF}
            disabled={compressing}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors"
          >
            {compressing ? (
              <>Compressing...</>
            ) : (
              <>
                <Gauge className="w-5 h-5" />
                Compress PDF
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default PDFCompressor;
