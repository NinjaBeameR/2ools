import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, FileText, Scissors } from 'lucide-react';

function PDFSplitter() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitOption, setSplitOption] = useState('all'); // 'all', 'range', 'custom'
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [customPages, setCustomPages] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      
      // Get page count
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setPageCount(count);
        setPageRange({ start: 1, end: count });
      } catch (error) {
        console.error('Error reading PDF:', error);
        alert('Error reading PDF file');
      }
    }
  };

  const splitPDF = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (splitOption === 'all') {
        // Split into individual pages
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `page_${i + 1}.pdf`;
          link.click();
          
          URL.revokeObjectURL(url);
        }
        alert(`Split into ${pageCount} files successfully!`);
      } else if (splitOption === 'range') {
        // Extract page range
        const newPdf = await PDFDocument.create();
        const pages = [];
        for (let i = pageRange.start - 1; i < pageRange.end; i++) {
          pages.push(i);
        }
        const copiedPages = await newPdf.copyPages(pdfDoc, pages);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `pages_${pageRange.start}-${pageRange.end}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        alert('Pages extracted successfully!');
      } else if (splitOption === 'custom') {
        // Custom pages (e.g., "1,3,5-7")
        const pageNumbers = parseCustomPages(customPages, pageCount);
        if (pageNumbers.length === 0) {
          alert('Invalid page numbers');
          setProcessing(false);
          return;
        }
        
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'custom_pages.pdf';
        link.click();
        
        URL.revokeObjectURL(url);
        alert('Custom pages extracted successfully!');
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const parseCustomPages = (input, maxPages) => {
    const pages = new Set();
    const parts = input.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (start && end && start <= end && start >= 1 && end <= maxPages) {
          for (let i = start; i <= end; i++) {
            pages.add(i - 1); // 0-indexed
          }
        }
      } else {
        const num = parseInt(part);
        if (num >= 1 && num <= maxPages) {
          pages.add(num - 1); // 0-indexed
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">PDF Splitter</h2>

      {/* Upload Area */}
      {!file ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Click to select a PDF file
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Split PDF into separate pages or extract specific pages
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
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {pageCount} pages • {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {/* Split Options */}
            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Split Options</h3>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="splitOption"
                  value="all"
                  checked={splitOption === 'all'}
                  onChange={(e) => setSplitOption(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Split into individual pages ({pageCount} files)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="splitOption"
                  value="range"
                  checked={splitOption === 'range'}
                  onChange={(e) => setSplitOption(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Extract page range</span>
              </label>

              {splitOption === 'range' && (
                <div className="ml-7 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={pageRange.start}
                    onChange={(e) => setPageRange({ ...pageRange, start: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-zinc-500">to</span>
                  <input
                    type="number"
                    min={pageRange.start}
                    max={pageCount}
                    value={pageRange.end}
                    onChange={(e) => setPageRange({ ...pageRange, end: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="splitOption"
                  value="custom"
                  checked={splitOption === 'custom'}
                  onChange={(e) => setSplitOption(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Custom pages</span>
              </label>

              {splitOption === 'custom' && (
                <div className="ml-7">
                  <input
                    type="text"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="e.g., 1,3,5-7,10"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Enter page numbers separated by commas. Use hyphens for ranges.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={splitPDF}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                Split PDF
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default PDFSplitter;
