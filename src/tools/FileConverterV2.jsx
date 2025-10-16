import React, { useState, useEffect } from 'react';
import { Upload, Download, FileCode, CheckCircle, AlertCircle, Loader, Wifi, WifiOff, Shield, Zap, Cloud } from 'lucide-react';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import axios from 'axios';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// CloudConvert API Configuration
const CLOUDCONVERT_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZTQ4YzA1ZGQwOGVhZTEzN2QyNTY5NGNhYTY3YjA5YzY0MjZiMzNjOGQ5ZDc4ZDEzYzU4ODc5YjQ4MjY4NjQ0ZmY4MjFmNWE2NDIzMGEyMDAiLCJpYXQiOjE3NDE4OTEzNDMuNzY5NjEyLCJuYmYiOjE3NDE4OTEzNDMuNzY5NjE0LCJleHAiOjQ4OTc1NjQ5NDMuNzY2Njc2LCJzdWIiOiI3MTM0NjczNSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.FcqUuJwqE4hH9pxE25g0uqG6vP-gTVDVl6cVtQNY8qV9j7jFFqSkHcCL-5kKc0qLiROY29TsYJ4NcaIVlzeDj6SJ3xmTD-qRh9N_jv6FzVJxP1gXL0RpNVZXz1XJQF1RXz3JqQ5_5VCTU8e8pLKiGxPLQqW8Y_7RZ_8sZlVzYxK9qXzFQB6gRZ0J9hLqP8Y_5v0Z7KxJQR8qY_9hLpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQ';
const CLOUDCONVERT_BASE_URL = 'https://api.cloudconvert.com/v2';
const DAILY_LIMIT = 25;

function FileConverterV2() {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionCount, setConversionCount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState('');
  const [convertedPdfBlob, setConvertedPdfBlob] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [conversionMethod, setConversionMethod] = useState(''); // 'offline' or 'api'
  const [documentComplexity, setDocumentComplexity] = useState(null);

  // Load conversion count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('conversionDate');
    const savedCount = parseInt(localStorage.getItem('conversionCount') || '0');

    if (savedDate !== today) {
      localStorage.setItem('conversionDate', today);
      localStorage.setItem('conversionCount', '0');
      setConversionCount(0);
      setLastResetDate(today);
    } else {
      setConversionCount(savedCount);
      setLastResetDate(savedDate);
    }
  }, []);

  const incrementConversionCount = () => {
    const newCount = conversionCount + 1;
    setConversionCount(newCount);
    localStorage.setItem('conversionCount', newCount.toString());
  };

  const checkConversionLimit = () => {
    if (conversionCount >= DAILY_LIMIT) {
      setError(`Daily API limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Offline conversions still work!`);
      return false;
    }
    return true;
  };

  const documentConversions = [
    { from: 'word', to: 'pdf', label: 'Word to PDF', icon: '📝→📄', supportsOffline: true },
    { from: 'pdf', to: 'word', label: 'PDF to Word', icon: '📄→📝', supportsOffline: false },
    { from: 'ppt', to: 'pdf', label: 'PowerPoint to PDF', icon: '📊→📄', supportsOffline: false },
    { from: 'pdf', to: 'ppt', label: 'PDF to PowerPoint', icon: '📄→📊', supportsOffline: false },
  ];

  const getDocumentAcceptTypes = () => {
    return '.pdf,.doc,.docx,.ppt,.pptx';
  };

  // Analyze document complexity
  const analyzeDocumentComplexity = async (file) => {
    try {
      if (!file.name.match(/\.docx?$/i)) {
        return { isSimple: false, reason: 'Not a Word document' };
      }

      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Check for complex elements
      const hasImages = Object.keys(zip.files).some(name => name.startsWith('word/media/'));
      const hasEmbeddings = Object.keys(zip.files).some(name => name.includes('embeddings'));
      const hasDrawings = Object.keys(zip.files).some(name => name.includes('drawings'));
      
      // Check document.xml for complex formatting
      const documentXml = await zip.file('word/document.xml')?.async('string');
      if (!documentXml) {
        return { isSimple: false, reason: 'Invalid document structure' };
      }

      // Count complex elements
      const hasComplexTables = (documentXml.match(/<w:tbl/g) || []).length > 5;
      const hasTextBoxes = documentXml.includes('<w:txbxContent');
      const hasShapes = documentXml.includes('<wps:wsp');
      const hasComplexFormatting = documentXml.includes('w:shade') || documentXml.includes('w:border');
      
      // Calculate file size (larger = more complex)
      const isLarge = file.size > 1024 * 1024; // > 1MB

      const complexityFactors = {
        hasImages,
        hasEmbeddings,
        hasDrawings,
        hasComplexTables,
        hasTextBoxes,
        hasShapes,
        hasComplexFormatting,
        isLarge,
        fileSize: (file.size / 1024).toFixed(2) + ' KB'
      };

      const complexityScore = [
        hasImages, hasEmbeddings, hasDrawings, 
        hasComplexTables, hasTextBoxes, hasShapes, 
        hasComplexFormatting, isLarge
      ].filter(Boolean).length;

      const isSimple = complexityScore <= 2; // Allow up to 2 complexity factors

      return {
        isSimple,
        score: complexityScore,
        factors: complexityFactors,
        recommendation: isSimple ? 'offline' : 'api'
      };
    } catch (err) {
      console.error('Complexity analysis failed:', err);
      return { isSimple: false, reason: 'Analysis failed', recommendation: 'api' };
    }
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setConvertedPdfBlob(null);
    setShowPreview(false);
    setDocumentComplexity(null);

    // Validate file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setError(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
      setFile(null);
      return;
    }

    if (selectedFile.size === 0) {
      setError('File is empty. Please select a valid document.');
      setFile(null);
      return;
    }

    // Detect document type
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const docExts = ['doc', 'docx'];
    const pptExts = ['ppt', 'pptx'];
    const pdfExt = 'pdf';

    if (ext === pdfExt) {
      setDocumentType('pdf');
    } else if (docExts.includes(ext)) {
      setDocumentType('word');
      
      // Analyze complexity for Word documents
      if (ext === 'docx') {
        const complexity = await analyzeDocumentComplexity(selectedFile);
        setDocumentComplexity(complexity);
      }
    } else if (pptExts.includes(ext)) {
      setDocumentType('ppt');
    } else {
      setError('Unsupported document format. Please select PDF, Word (.docx), or PowerPoint (.pptx) files.');
      setFile(null);
    }
  };

  // IMPROVED: Offline Word to PDF conversion (NO CANVAS!)
  const convertWordToPDFOffline = async () => {
    try {
      setConversionProgress(10);
      
      // Read the Word file
      const arrayBuffer = await file.arrayBuffer();
      
      setConversionProgress(20);
      
      // Extract text and basic formatting using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      if (!html || html.trim().length === 0) {
        throw new Error('Document appears to be empty or corrupted.');
      }
      
      setConversionProgress(40);
      
      // Create PDF using pdf-lib (NO CANVAS!)
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Parse HTML and extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const textContent = doc.body.textContent || doc.body.innerText || '';
      
      setConversionProgress(60);
      
      // Create pages and add text
      let page = pdfDoc.addPage([595, 842]); // A4 size
      const { width, height } = page.getSize();
      const margin = 50;
      const lineHeight = 18;
      let y = height - margin;
      
      const lines = textContent.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([595, 842]);
          y = height - margin;
        }
        
        const trimmedLine = line.trim();
        if (trimmedLine) {
          // Simple text wrapping
          const words = trimmedLine.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = font.widthOfTextAtSize(testLine, 12);
            
            if (textWidth > width - (margin * 2) && currentLine) {
              // Draw current line and start new one
              page.drawText(currentLine, {
                x: margin,
                y,
                size: 12,
                font,
                color: rgb(0, 0, 0),
              });
              y -= lineHeight;
              currentLine = word;
              
              if (y < margin + lineHeight) {
                page = pdfDoc.addPage([595, 842]);
                y = height - margin;
              }
            } else {
              currentLine = testLine;
            }
          }
          
          // Draw remaining text
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            });
            y -= lineHeight;
          }
        } else {
          y -= lineHeight / 2; // Empty line spacing
        }
      }
      
      setConversionProgress(80);
      
      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setConversionProgress(100);
      setConvertedPdfBlob(pdfBlob);
      setConversionMethod('offline');
      setSuccess(`✅ Document converted successfully using offline mode! (Free, no API usage)`);
      
      return pdfBlob;
    } catch (err) {
      console.error('Offline conversion error:', err);
      throw new Error('Offline conversion failed: ' + err.message);
    }
  };

  // API-based conversion
  const convertDocumentViaAPI = async (targetFormat) => {
    if (!checkConversionLimit()) return;
    
    try {
      setConversionProgress(10);
      
      if (!navigator.onLine) {
        throw new Error('Internet connection required for this conversion.');
      }
      
      setConversionProgress(20);
      
      const formatMapping = {
        'word': 'docx',
        'ppt': 'pptx',
        'pdf': 'pdf'
      };
      
      const inputFormat = formatMapping[documentType] || file.name.split('.').pop();
      const outputFormat = formatMapping[targetFormat] || targetFormat;
      
      // Create conversion job
      const createJobResponse = await axios.post(
        `${CLOUDCONVERT_BASE_URL}/jobs`,
        {
          tasks: {
            'upload-my-file': {
              operation: 'import/upload'
            },
            'convert-my-file': {
              operation: 'convert',
              input: ['upload-my-file'],
              output_format: outputFormat,
              engine: 'office',
              timeout: 600
            },
            'export-my-file': {
              operation: 'export/url',
              input: ['convert-my-file']
            }
          },
          tag: 'mura-2ools-v2'
        },
        {
          headers: {
            'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      setConversionProgress(30);
      
      const job = createJobResponse.data.data;
      const uploadTask = job.tasks.find(task => task.name === 'upload-my-file');
      
      if (!uploadTask?.result?.form) {
        throw new Error('Failed to get upload URL from API.');
      }
      
      // Upload file
      const formData = new FormData();
      Object.keys(uploadTask.result.form.parameters || {}).forEach(key => {
        formData.append(key, uploadTask.result.form.parameters[key]);
      });
      formData.append('file', file);
      
      await axios.post(uploadTask.result.form.url, formData, {
        timeout: Math.max(120000, (file.size / (1024 * 1024)) * 2000),
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = 30 + Math.round((progressEvent.loaded / progressEvent.total) * 20);
            setConversionProgress(progress);
          }
        }
      });
      
      setConversionProgress(50);
      
      // Wait for conversion
      let jobStatus = job;
      let attempts = 0;
      const maxAttempts = 180;
      
      while (jobStatus.status !== 'finished' && jobStatus.status !== 'error' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await axios.get(
          `${CLOUDCONVERT_BASE_URL}/jobs/${job.id}`,
          {
            headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
            timeout: 15000
          }
        );
        
        jobStatus = statusResponse.data.data;
        setConversionProgress(50 + Math.min(40, (attempts / maxAttempts) * 40));
        attempts++;
      }
      
      if (jobStatus.status === 'error') {
        throw new Error('Conversion failed on server.');
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Conversion timeout.');
      }
      
      setConversionProgress(95);
      
      // Download result
      const exportTask = jobStatus.tasks.find(task => task.name === 'export-my-file');
      const downloadUrl = exportTask.result.files[0].url;
      
      const downloadResponse = await axios.get(downloadUrl, {
        responseType: 'blob',
        timeout: 120000
      });
      
      setConversionProgress(100);
      
      incrementConversionCount();
      
      if (outputFormat === 'pdf') {
        setConvertedPdfBlob(downloadResponse.data);
      }
      
      setConversionMethod('api');
      setSuccess(`✅ Document converted successfully! (API: ${conversionCount + 1}/${DAILY_LIMIT} used today)`);
      
      return downloadResponse.data;
    } catch (err) {
      console.error('API conversion error:', err);
      throw err;
    }
  };

  // Main conversion function
  const convertDocument = async (targetFormat) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setConverting(true);
    setError('');
    setSuccess('');
    setConversionProgress(0);
    setConvertedPdfBlob(null);
    setShowPreview(false);

    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      // Word to PDF - Try offline first if simple
      if (documentType === 'word' && targetFormat === 'pdf' && fileExt === 'docx') {
        if (documentComplexity?.isSimple) {
          try {
            await convertWordToPDFOffline();
            return;
          } catch (offlineErr) {
            console.warn('Offline conversion failed, trying API:', offlineErr);
            setError('');
          }
        }
        
        // Use API for complex documents or if offline failed
        const result = await convertDocumentViaAPI(targetFormat);
        if (!convertedPdfBlob && result) {
          const blob = new Blob([result], { type: 'application/pdf' });
          downloadFile(blob, 'pdf');
        }
      } else {
        // All other conversions use API
        const result = await convertDocumentViaAPI(targetFormat);
        if (result) {
          const extension = targetFormat === 'word' ? 'docx' : targetFormat === 'ppt' ? 'pptx' : targetFormat;
          downloadFile(result, extension);
        }
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError(`❌ Conversion failed: ${err.message}`);
    } finally {
      setConverting(false);
      setConversionProgress(0);
    }
  };

  const downloadFile = (blob, format) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^/.]+$/, `.${format}`);
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preview PDF
  const handlePreview = async () => {
    if (!convertedPdfBlob) return;
    
    setShowPreview(true);
    
    try {
      const arrayBuffer = await convertedPdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const container = document.getElementById('pdf-preview-container');
      container.innerHTML = '';
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        canvas.className = 'mb-4 border border-zinc-300 dark:border-zinc-600 rounded';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport
        }).promise;
        
        container.appendChild(canvas);
      }
      
      if (pdf.numPages > 5) {
        const notice = document.createElement('p');
        notice.className = 'text-sm text-zinc-500 text-center';
        notice.textContent = `Showing first 5 pages of ${pdf.numPages} total pages`;
        container.appendChild(notice);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError('Preview failed. You can still download the file.');
    }
  };

  const getAvailableConversions = () => {
    if (!documentType) return [];
    return documentConversions.filter(conv => conv.from === documentType);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <FileCode className="w-8 h-8 text-blue-600" />
          File Converter V2
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Smart offline + API hybrid conversion system
        </p>
      </div>

      {/* Status Bar */}
      <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            API: <strong>{conversionCount}/{DAILY_LIMIT}</strong> used today
          </span>
        </div>
        <div className="flex items-center gap-2">
          {navigator.onLine ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500 font-medium">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* File Upload */}
      {!file ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Select Document
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              PDF, Word (.docx), PowerPoint (.pptx)
            </span>
            <input
              type="file"
              accept={getDocumentAcceptTypes()}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Selected File</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{file.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {documentType.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setDocumentComplexity(null);
                  setConvertedPdfBlob(null);
                  setShowPreview(false);
                }}
                className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Complexity Analysis */}
            {documentComplexity && (
              <div className={`mb-6 p-4 rounded-lg border ${
                documentComplexity.isSimple 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  {documentComplexity.isSimple ? (
                    <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className={`text-sm ${
                    documentComplexity.isSimple 
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    <p className="font-semibold mb-1">
                      {documentComplexity.isSimple 
                        ? '⚡ Simple Document - Offline Conversion Available!' 
                        : '☁️ Complex Document - API Recommended'}
                    </p>
                    <p className="text-xs opacity-90">
                      Complexity Score: {documentComplexity.score}/8 
                      {documentComplexity.isSimple 
                        ? ' - Fast, free, no internet needed'
                        : ' - Better quality with API'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Conversions */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Available Conversions:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getAvailableConversions().map((conversion) => {
                  const canUseOffline = conversion.supportsOffline && documentComplexity?.isSimple;
                  const requiresAPI = !canUseOffline;
                  const apiLimitReached = requiresAPI && conversionCount >= DAILY_LIMIT;
                  
                  return (
                    <button
                      key={`${conversion.from}-${conversion.to}`}
                      onClick={() => convertDocument(conversion.to)}
                      disabled={converting || apiLimitReached}
                      className="relative flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{conversion.icon}</span>
                        <div className="text-left">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {conversion.label}
                            {canUseOffline && (
                              <span className="text-xs px-2 py-0.5 bg-emerald-600 text-white rounded-full flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                OFFLINE
                              </span>
                            )}
                            {requiresAPI && (
                              <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full flex items-center gap-1">
                                <Cloud className="w-3 h-3" />
                                API
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {canUseOffline && 'Fast & Free'}
                            {requiresAPI && !apiLimitReached && 'High Quality'}
                            {apiLimitReached && 'Limit Reached'}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm whitespace-pre-line">{error}</div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}

            {/* Progress */}
            {converting && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Converting... {conversionProgress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300"
                    style={{ width: `${conversionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Preview Button */}
            {convertedPdfBlob && !showPreview && (
              <button
                onClick={handlePreview}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileCode className="w-5 h-5" />
                Preview PDF
              </button>
            )}
          </div>

          {/* Preview Area */}
          {showPreview && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">PDF Preview</h3>
              <div id="pdf-preview-container" className="max-h-[600px] overflow-y-auto"></div>
              <button
                onClick={() => convertedPdfBlob && downloadFile(convertedPdfBlob, 'pdf')}
                className="mt-4 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">✨ Smart Hybrid Conversion:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Simple Word docs:</strong> Fast offline conversion (FREE, instant)</li>
                  <li>• <strong>Complex docs:</strong> High-quality API conversion (uses quota)</li>
                  <li>• <strong>Auto-detection:</strong> System chooses best method for you</li>
                  <li>• <strong>Daily limit:</strong> {DAILY_LIMIT} API conversions/day (resets daily)</li>
                  <li>• <strong>100% offline:</strong> Simple docs never need internet!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileConverterV2;
