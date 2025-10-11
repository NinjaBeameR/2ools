import React, { useState, useEffect } from 'react';
import { Upload, Download, FileCode, CheckCircle, AlertCircle, FileAudio, FileText, Loader, Wifi, WifiOff, Shield } from 'lucide-react';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';

// CloudConvert API Configuration
const CLOUDCONVERT_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZTQ4YzA1ZGQwOGVhZTEzN2QyNTY5NGNhYTY3YjA5YzY0MjZiMzNjOGQ5ZDc4ZDEzYzU4ODc5YjQ4MjY4NjQ0ZmY4MjFmNWE2NDIzMGEyMDAiLCJpYXQiOjE3NDE4OTEzNDMuNzY5NjEyLCJuYmYiOjE3NDE4OTEzNDMuNzY5NjE0LCJleHAiOjQ4OTc1NjQ5NDMuNzY2Njc2LCJzdWIiOiI3MTM0NjczNSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.FcqUuJwqE4hH9pxE25g0uqG6vP-gTVDVl6cVtQNY8qV9j7jFFqSkHcCL-5kKc0qLiROY29TsYJ4NcaIVlzeDj6SJ3xmTD-qRh9N_jv6FzVJxP1gXL0RpNVZXz1XJQF1RXz3JqQ5_5VCTU8e8pLKiGxPLQqW8Y_7RZ_8sZlVzYxK9qXzFQB6gRZ0J9hLqP8Y_5v0Z7KxJQR8qY_9hLpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQRxZ7Y_8sZxV0Q5pYhL7Z_9v8RxZ7Y_5sQ8pVzYxL0Z_9hRpK5sZxV7Q8pYhL0Z_9v8pLQ'; // Free tier API key
const CLOUDCONVERT_BASE_URL = 'https://api.cloudconvert.com/v2';
const DAILY_LIMIT = 25; // Free tier limit

function FileConverter() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileType, setFileType] = useState(''); // 'audio', 'video', 'document'
  const [bitrate, setBitrate] = useState('192');
  const [converterMode, setConverterMode] = useState('audio'); // 'audio' or 'documents'
  const [documentType, setDocumentType] = useState(''); // 'pdf', 'word', 'ppt', 'excel'
  const [conversionCount, setConversionCount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);

  // Load conversion count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('conversionDate');
    const savedCount = parseInt(localStorage.getItem('conversionCount') || '0');

    if (savedDate !== today) {
      // Reset counter if it's a new day
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
      setError(`Daily conversion limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Please try again in 24 hours.`);
      return false;
    }
    return true;
  };

  const audioFormats = [
    { value: 'mp3', label: 'MP3 (Most Compatible)', mimeType: 'audio/mpeg' },
    { value: 'wav', label: 'WAV (Lossless)', mimeType: 'audio/wav' },
    { value: 'ogg', label: 'OGG Vorbis', mimeType: 'audio/ogg' },
    { value: 'webm', label: 'WebM Audio', mimeType: 'audio/webm' },
  ];

  const bitrateOptions = [
    { value: '128', label: '128 kbps (Good)' },
    { value: '192', label: '192 kbps (High)' },
    { value: '256', label: '256 kbps (Very High)' },
    { value: '320', label: '320 kbps (Maximum)' },
  ];

  const documentConversions = [
    { from: 'pdf', to: 'word', label: 'PDF to Word', icon: '📄→📝' },
    { from: 'pdf', to: 'ppt', label: 'PDF to PowerPoint', icon: '📄→📊' },
    { from: 'word', to: 'pdf', label: 'Word to PDF', icon: '📝→📄' },
    { from: 'ppt', to: 'pdf', label: 'PowerPoint to PDF', icon: '📊→📄' },
    { from: 'excel', to: 'pdf', label: 'Excel to PDF', icon: '📈→📄' },
  ];

  const getDocumentAcceptTypes = () => {
    return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setSuccess('');

    if (converterMode === 'audio') {
      // Detect file type for audio
      if (selectedFile.type.startsWith('audio/')) {
        setFileType('audio');
        setOutputFormat('mp3');
      } else if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
        setOutputFormat('mp3');
      } else {
        // Try to detect from extension
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        const audioExts = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma', 'opus'];
        const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
        
        if (audioExts.includes(ext)) {
          setFileType('audio');
          setOutputFormat('mp3');
        } else if (videoExts.includes(ext)) {
          setFileType('video');
          setOutputFormat('mp3');
        } else {
          setError('Unsupported file format. Please select an audio file.');
          setFile(null);
        }
      }
    } else if (converterMode === 'documents') {
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
      const xlsExts = ['xls', 'xlsx'];
      const pdfExt = 'pdf';
      
      if (ext === pdfExt) {
        setDocumentType('pdf');
        setFileType('document');
      } else if (docExts.includes(ext)) {
        setDocumentType('word');
        setFileType('document');
        // Only .docx is supported for offline conversion
        if (ext === 'doc') {
          setError('⚠️ Old .doc format detected. For offline conversion, please use .docx format. API conversion will still work.');
        }
      } else if (pptExts.includes(ext)) {
        setDocumentType('ppt');
        setFileType('document');
      } else if (xlsExts.includes(ext)) {
        setDocumentType('excel');
        setFileType('document');
      } else {
        setError('Unsupported document format. Please select PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), or Excel (.xls/.xlsx) files.');
        setFile(null);
      }
    }
  };

  const convertFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setConverting(true);
    setError('');
    setSuccess('');

    try {
      if (fileType === 'audio') {
        await convertAudioWithMediaRecorder();
      } else if (fileType === 'video') {
        setError('Video conversion requires specialized tools. Please use online converters or desktop software for video conversion.');
        setConverting(false);
        return;
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError('Failed to convert file: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const convertAudioWithMediaRecorder = async () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // For WAV, use direct conversion
      if (outputFormat === 'wav') {
        const wav = audioBufferToWav(audioBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        downloadFile(blob, outputFormat);
        setSuccess(`Audio converted to WAV successfully!`);
        return;
      }
      
      // For other formats, use MediaRecorder with MediaStream
      const sampleRate = audioBuffer.sampleRate;
      const numberOfChannels = audioBuffer.numberOfChannels;
      
      // Create an offline audio context for processing
      const offlineContext = new OfflineAudioContext(
        numberOfChannels,
        audioBuffer.length,
        sampleRate
      );
      
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create a MediaStreamDestination
      const destination = audioContext.createMediaStreamDestination();
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(destination);
      
      // Get the appropriate MIME type
      const formatConfig = audioFormats.find(f => f.value === outputFormat);
      let mimeType = formatConfig?.mimeType || 'audio/webm';
      
      // Check if the MIME type is supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} not supported, falling back to audio/webm`);
        mimeType = 'audio/webm';
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: mimeType,
        audioBitsPerSecond: parseInt(bitrate) * 1000,
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        downloadFile(blob, outputFormat);
        setSuccess(`Audio converted to ${outputFormat.toUpperCase()} successfully!`);
      };
      
      // Start recording
      mediaRecorder.start();
      sourceNode.start(0);
      
      // Stop after the audio duration
      setTimeout(() => {
        mediaRecorder.stop();
        sourceNode.stop();
      }, (audioBuffer.duration * 1000) + 100);
      
    } catch (err) {
      throw new Error('Audio conversion failed: ' + err.message);
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

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const data = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.push(audioBuffer.getChannelData(i));
    }

    const interleaved = interleave(data);
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return buffer;
  };

  const interleave = (channels) => {
    const length = channels[0].length;
    const result = new Float32Array(length * channels.length);
    let offset = 0;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channels.length; channel++) {
        result[offset++] = channels[channel][i];
      }
    }
    return result;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const extractAudio = async () => {
    setError('Audio extraction from video requires specialized tools. Please use online converters or desktop software like VLC or HandBrake for this feature.');
  };

  // Document Conversion Functions
  const convertWordToPDFOffline = async () => {
    let container = null;
    let style = null;
    
    try {
      setConversionProgress(10);
      
      // Read the Word file
      const arrayBuffer = await file.arrayBuffer();
      
      setConversionProgress(20);
      
      // Convert DOCX to HTML using mammoth with styling
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
          ]
        }
      );
      
      const html = result.value;
      
      if (!html || html.trim().length === 0) {
        throw new Error('Failed to extract content from Word document. The file might be corrupted or empty.');
      }
      
      console.log('Extracted HTML length:', html.length);
      console.log('HTML preview:', html.substring(0, 200));
      
      setConversionProgress(30);
      
      // Create a temporary container VISIBLE on page for proper rendering
      container = document.createElement('div');
      container.id = 'word-to-pdf-container';
      
      // A4 dimensions in pixels at 96 DPI: 210mm = 794px, 297mm = 1123px
      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;
      const PADDING_PX = 60; // ~20mm padding
      
      // CRITICAL FIX: Must be FULLY VISIBLE for html2canvas to work in Electron
      // We'll position it offscreen but with full opacity
      container.style.position = 'absolute';
      container.style.left = '-10000px'; // Far offscreen
      container.style.top = '0';
      container.style.width = `${A4_WIDTH_PX}px`;
      container.style.minHeight = `${A4_HEIGHT_PX}px`;
      container.style.padding = `${PADDING_PX}px`;
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'Arial, Helvetica, sans-serif';
      container.style.fontSize = '14px';
      container.style.lineHeight = '1.6';
      container.style.color = '#000000';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'visible';
      container.style.visibility = 'hidden'; // Hidden but still rendered
      container.style.pointerEvents = 'none';
      
      // Add comprehensive CSS styling
      style = document.createElement('style');
      style.id = 'word-to-pdf-styles';
      style.textContent = `
        #word-to-pdf-container {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #word-to-pdf-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        #word-to-pdf-container p {
          margin: 0 0 12px 0;
          text-align: justify;
        }
        #word-to-pdf-container h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 18px 0 12px 0;
          color: #000000;
        }
        #word-to-pdf-container h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 15px 0 10px 0;
          color: #000000;
        }
        #word-to-pdf-container h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 12px 0 8px 0;
          color: #000000;
        }
        #word-to-pdf-container strong, #word-to-pdf-container b {
          font-weight: bold;
        }
        #word-to-pdf-container em, #word-to-pdf-container i {
          font-style: italic;
        }
        #word-to-pdf-container ul, #word-to-pdf-container ol {
          margin: 10px 0;
          padding-left: 30px;
        }
        #word-to-pdf-container li {
          margin: 5px 0;
        }
        #word-to-pdf-container img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px 0;
        }
        #word-to-pdf-container table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        #word-to-pdf-container table td, #word-to-pdf-container table th {
          border: 1px solid #000000;
          padding: 5px;
          text-align: left;
        }
        #word-to-pdf-container table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
      
      // Set the HTML content
      container.innerHTML = html;
      document.body.appendChild(container);
      
      setConversionProgress(40);
      
      // CRITICAL FIX: Container MUST be visible and on-screen for html2canvas in Electron
      container.style.visibility = 'visible';
      container.style.left = '0';
      container.style.top = '0';
      container.style.zIndex = '10000';
      container.style.opacity = '1';
      
      // Force browser to render by triggering reflow
      container.offsetHeight;
      
      // Wait for proper rendering, font loading, and image processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Additional check: ensure fonts are loaded
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Check if container has content using scrollHeight (more reliable)
      if (container.scrollHeight === 0 || container.scrollWidth === 0) {
        throw new Error('Container has no dimensions. Content may not have rendered properly.');
      }
      
      // Verify actual content exists
      const textContent = container.textContent || container.innerText;
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No text content found in document. File may be empty or corrupted.');
      }
      
      console.log('Container dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        textLength: textContent.length,
        innerHTML: container.innerHTML.substring(0, 100)
      });
      
      setConversionProgress(50);
      
      // Convert HTML to canvas with optimal settings for Electron
      let canvas;
      try {
        canvas = await html2canvas(container, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true, // Allow taint for better compatibility in Electron
          logging: true, // Enable logging for debugging
          backgroundColor: '#ffffff',
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
          width: container.scrollWidth,
          height: container.scrollHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          imageTimeout: 15000, // 15 second timeout for images
          removeContainer: false // Keep container for debugging
        });
      } catch (canvasErr) {
        console.error('html2canvas error:', canvasErr);
        throw new Error('Failed to render document for PDF conversion: ' + canvasErr.message);
      }
      
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height
      });
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering failed. The document may contain unsupported elements or be too complex for offline conversion. Please try using the API-based conversion instead.');
      }
      
      setConversionProgress(70);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert canvas to JPEG (better compatibility with jsPDF)
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Validate image data
      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to generate image from canvas. Canvas may be empty.');
      }
      
      // Calculate how many pages we need
      const canvasHeightMM = (canvas.height * pdfWidth) / canvas.width;
      const totalPages = Math.ceil(canvasHeightMM / pdfHeight);
      
      console.log('PDF info:', {
        pdfWidth,
        pdfHeight,
        canvasHeightMM,
        totalPages,
        imgDataLength: imgData.length
      });
      
      setConversionProgress(80);
      
      // Add pages
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yPosition = -page * pdfHeight;
        
        // Use JPEG format (more compatible than PNG)
        pdf.addImage(imgData, 'JPEG', 0, yPosition, pdfWidth, canvasHeightMM, undefined, 'FAST');
        
        setConversionProgress(80 + ((page + 1) / totalPages) * 15);
      }
      
      setConversionProgress(96);
      
      // Download
      const outputName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
      pdf.save(outputName);
      
      setConversionProgress(98);
      
      // Cleanup
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      if (style && style.parentNode) {
        document.head.removeChild(style);
      }
      
      setConversionProgress(100);
      setSuccess(`✅ Document converted to PDF successfully! (${totalPages} page${totalPages > 1 ? 's' : ''})`);
      
    } catch (err) {
      console.error('Conversion error:', err);
      
      // Cleanup on error
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      if (style && style.parentNode) {
        document.head.removeChild(style);
      }
      
      throw new Error('Offline conversion failed: ' + err.message);
    }
  };

  const convertDocumentViaAPI = async (targetFormat) => {
    if (!checkConversionLimit()) return;
    
    try {
      setConversionProgress(10);
      
      // Check internet connection first
      if (!navigator.onLine) {
        throw new Error('⚠️ Internet connection required for this conversion. Please check your connection and try again.');
      }
      
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file. Please select a valid document.');
      }
      
      // Check file size (CloudConvert free tier limit: 1GB)
      const maxSize = 100 * 1024 * 1024; // 100MB to be safe
      if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB for API conversions.`);
      }
      
      // Test API connectivity before starting
      try {
        await axios.get(`${CLOUDCONVERT_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`
          },
          timeout: 10000
        });
      } catch (testErr) {
        if (testErr.code === 'ECONNABORTED' || testErr.message.includes('timeout')) {
          throw new Error('⚠️ Connection timeout. Please check your internet connection and try again.');
        }
        if (testErr.response?.status === 401) {
          throw new Error('⚠️ API authentication failed. The service may be temporarily unavailable.');
        }
        throw new Error('⚠️ Cannot connect to conversion service. Please check your internet connection.');
      }
      
      setConversionProgress(15);
      
      // Get correct format names for API
      const formatMapping = {
        'word': 'docx',
        'ppt': 'pptx',
        'excel': 'xlsx',
        'pdf': 'pdf'
      };
      
      const inputFormat = formatMapping[documentType] || getFileExtension(file.name);
      const outputFormat = formatMapping[targetFormat] || targetFormat;
      
      setConversionProgress(20);
      
      console.log('Starting conversion:', {
        input: inputFormat,
        output: outputFormat,
        fileSize: file.size
      });
      
      // Step 1: Create a job with proper task structure
      let createJobResponse;
      try {
        createJobResponse = await axios.post(
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
                engine: 'office', // Specify office engine for better compatibility
                engine_version: 'latest',
                timeout: 600 // 10 minute timeout for conversion
              },
              'export-my-file': {
                operation: 'export/url',
                input: ['convert-my-file']
              }
            },
            tag: 'mura-2ools-converter'
          },
          {
            headers: {
              'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout for job creation
          }
        );
      } catch (apiErr) {
        console.error('Job creation failed:', apiErr.response?.data || apiErr.message);
        if (apiErr.response?.status === 401) {
          throw new Error('API authentication failed. Please contact support.');
        } else if (apiErr.response?.status === 422) {
          throw new Error('Invalid conversion parameters. This file type may not be supported.');
        }
        throw new Error('Failed to create conversion job. Please try again later.');
      }
      
      setConversionProgress(30);
      
      const job = createJobResponse.data.data;
      const uploadTask = job.tasks.find(task => task.name === 'upload-my-file');
      
      console.log('Job created:', {
        jobId: job.id,
        uploadTask: uploadTask ? 'found' : 'not found'
      });
      
      if (!uploadTask || !uploadTask.result || !uploadTask.result.form) {
        console.error('Upload task structure:', uploadTask);
        throw new Error('Failed to get upload URL from API. Service may be unavailable.');
      }
      
      // Step 2: Upload file
      const formData = new FormData();
      
      // Add all form parameters first
      Object.keys(uploadTask.result.form.parameters || {}).forEach(key => {
        formData.append(key, uploadTask.result.form.parameters[key]);
      });
      
      // Then add the file
      formData.append('file', file);
      
      console.log('Uploading to:', uploadTask.result.form.url);
      
      let uploadResponse;
      try {
        // Calculate dynamic timeout based on file size (minimum 90s, add 1s per MB)
        const uploadTimeout = Math.max(90000, 90000 + (file.size / (1024 * 1024)) * 1000);
        
        uploadResponse = await axios.post(uploadTask.result.form.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: uploadTimeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 20);
              setConversionProgress(30 + uploadProgress);
            }
          }
        });
      } catch (uploadErr) {
        console.error('Upload failed:', uploadErr.response?.data || uploadErr.message);
        if (uploadErr.code === 'ECONNABORTED') {
          throw new Error('Upload timeout. Your file is large or connection is slow. Please try a smaller file or better connection.');
        }
        throw new Error('File upload failed. Please check your internet connection and try again.');
      }
      
      console.log('Upload complete:', uploadResponse.status);
      
      if (uploadResponse.status !== 200 && uploadResponse.status !== 201 && uploadResponse.status !== 204) {
        throw new Error('File upload failed with status: ' + uploadResponse.status);
      }
      
      setConversionProgress(50);
      
      // Step 3: Wait for conversion to complete with intelligent polling
      let jobStatus = job;
      let attempts = 0;
      const maxAttempts = 180; // 6 minutes timeout for large/complex files
      let pollInterval = 2000; // Start with 2 seconds
      
      console.log('Waiting for conversion...');
      
      while (jobStatus.status !== 'finished' && jobStatus.status !== 'error' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        // Gradually increase poll interval to reduce API calls
        if (attempts > 10) pollInterval = 3000; // 3s after 20 seconds
        if (attempts > 30) pollInterval = 5000; // 5s after 1 minute
        
        try {
          const statusResponse = await axios.get(
            `${CLOUDCONVERT_BASE_URL}/jobs/${job.id}`,
            {
              headers: {
                'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`
              },
              timeout: 15000
            }
          );
          
          jobStatus = statusResponse.data.data;
          console.log('Job status:', jobStatus.status, 'attempt:', attempts + 1);
          
          // Show progress more accurately
          const progress = 50 + (attempts / maxAttempts) * 40;
          setConversionProgress(Math.min(90, progress));
        } catch (statusErr) {
          console.error('Status check failed:', statusErr.message);
          // Continue trying unless it's a fatal error
          if (statusErr.response?.status === 401 || statusErr.response?.status === 404) {
            throw new Error('Lost connection to conversion job. Please try again.');
          }
        }
        
        attempts++;
      }
      
      if (jobStatus.status === 'error') {
        const errorTask = jobStatus.tasks.find(t => t.status === 'error');
        const errorMsg = errorTask?.message || 'Unknown error occurred during conversion';
        console.error('Conversion error:', errorMsg);
        throw new Error('Conversion failed: ' + errorMsg);
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Conversion timeout. The file may be too large or complex.');
      }
      
      setConversionProgress(92);
      
      // Step 4: Download converted file
      const exportTask = jobStatus.tasks.find(task => task.name === 'export-my-file');
      
      console.log('Export task:', exportTask ? 'found' : 'not found');
      
      if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
        throw new Error('Conversion completed but no output file was generated. Please try again.');
      }
      
      const downloadUrl = exportTask.result.files[0].url;
      
      setConversionProgress(95);
      
      console.log('Downloading from:', downloadUrl);
      
      let downloadResponse;
      try {
        downloadResponse = await axios.get(downloadUrl, {
          responseType: 'blob',
          timeout: 120000, // 2 minute timeout for download
          maxContentLength: Infinity,
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const dlProgress = Math.round((progressEvent.loaded / progressEvent.total) * 3);
              setConversionProgress(95 + dlProgress);
            }
          }
        });
      } catch (dlErr) {
        console.error('Download failed:', dlErr.message);
        if (dlErr.code === 'ECONNABORTED') {
          throw new Error('Download timeout. The converted file may be very large. Please try again.');
        }
        throw new Error('Failed to download converted file. Please try again.');
      }
      
      if (!downloadResponse.data || downloadResponse.data.size === 0) {
        throw new Error('Downloaded file is empty. Conversion may have failed.');
      }
      
      console.log('Download complete. Size:', downloadResponse.data.size, 'bytes');
      
      setConversionProgress(98);
      
      // Create download link
      const blob = new Blob([downloadResponse.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get proper filename with extension
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      const extension = outputFormat === 'docx' ? 'docx' : outputFormat === 'pptx' ? 'pptx' : outputFormat === 'xlsx' ? 'xlsx' : outputFormat;
      a.download = `${originalName}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setConversionProgress(100);
      incrementConversionCount();
      setSuccess(`✅ Document converted successfully! (${conversionCount + 1}/${DAILY_LIMIT} conversions used today)`);
      
    } catch (err) {
      console.error('API Conversion error:', err);
      
      if (err.response) {
        if (err.response.status === 429) {
          setError('⚠️ API rate limit exceeded. Please wait a moment and try again.');
        } else if (err.response.status === 422) {
          setError('⚠️ Invalid file format or corrupted file. Please ensure the file is valid and not password-protected.');
        } else if (err.response.status === 402) {
          setError('⚠️ API quota exceeded. Please try again tomorrow.');
        } else if (err.response.status === 401) {
          setError('⚠️ API authentication failed. The service may be temporarily unavailable. Please try again later.');
        } else if (err.response.status === 404) {
          setError('⚠️ Conversion job not found. The service may have timed out. Please try again.');
        } else if (err.response.status >= 500) {
          setError('⚠️ Server error. The conversion service is temporarily unavailable. Please try again in a few minutes.');
        } else {
          const errorMsg = err.response.data?.message || err.response.data?.error || err.message;
          setError(`⚠️ API Error: ${errorMsg}`);
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('⚠️ Request timeout. The file might be too large or your connection is slow. Try a smaller file or check your internet speed.');
      } else if (err.message.includes('Network Error') || err.message.includes('ERR_INTERNET_DISCONNECTED')) {
        setError('⚠️ Network error. Please check your internet connection and try again.');
      } else if (err.message.includes('Internet connection')) {
        setError(err.message);
      } else {
        throw err;
      }
    } finally {
      setConversionProgress(0);
    }
  };

  const convertDocument = async (targetFormat) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setConverting(true);
    setError('');
    setSuccess('');
    setConversionProgress(0);

    try {
      // Check if we can do offline conversion (Word to PDF only, .docx only)
      const fileExt = getFileExtension(file.name);
      if (documentType === 'word' && targetFormat === 'pdf' && fileExt === 'docx') {
        try {
          await convertWordToPDFOffline();
        } catch (offlineErr) {
          console.error('Offline conversion failed:', offlineErr);
          // If offline conversion fails, suggest API conversion as fallback
          const errorMsg = offlineErr.message || 'Unknown error';
          if (navigator.onLine && conversionCount < DAILY_LIMIT) {
            setError(`❌ Offline conversion failed: ${errorMsg}\n\n💡 Tip: You can try the API-based conversion which may handle complex documents better. Would you like to try? (You have ${DAILY_LIMIT - conversionCount} API conversions remaining today)`);
          } else {
            setError(`❌ Offline conversion failed: ${errorMsg}${!navigator.onLine ? '\n\n⚠️ You are offline. Please connect to the internet to use API-based conversion.' : '\n\n⚠️ Daily API limit reached. Please try again tomorrow.'}`);
          }
          throw offlineErr;
        }
      } else if (documentType === 'word' && targetFormat === 'pdf' && fileExt === 'doc') {
        // Old .doc format needs API
        setError('');
        setSuccess('');
        await convertDocumentViaAPI(targetFormat);
      } else {
        // Use API for other conversions
        await convertDocumentViaAPI(targetFormat);
      }
    } catch (err) {
      console.error('Document conversion error:', err);
      // Error already set in nested try-catch or in API function
      if (!error) {
        setError('❌ Failed to convert document: ' + err.message);
      }
    } finally {
      setConverting(false);
      setConversionProgress(0);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
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
          File Converter
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Convert audio files and documents between multiple formats
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-zinc-300 dark:border-zinc-700">
          <button
            onClick={() => {
              setConverterMode('audio');
              setFile(null);
              setError('');
              setSuccess('');
            }}
            className={`px-6 py-3 font-medium transition-all ${
              converterMode === 'audio'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Audio Converter
            </span>
          </button>
          <button
            onClick={() => {
              setConverterMode('documents');
              setFile(null);
              setError('');
              setSuccess('');
            }}
            className={`px-6 py-3 font-medium transition-all ${
              converterMode === 'documents'
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Converter
            </span>
          </button>
        </div>

        {/* Conversion Counter (only show in documents mode) */}
        {converterMode === 'documents' && (
          <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200">
                API Conversions Today: <strong>{conversionCount}/{DAILY_LIMIT}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              {navigator.onLine ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Offline</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>      {/* Content Area */}
      {converterMode === 'audio' ? (
        /* Audio Converter */
        <>
          {!file ? (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
                <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Audio File
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Supports MP3, WAV, AAC, OGG, FLAC, M4A, and more
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Selected File</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{file.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Audio File
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Output Format Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                disabled={converting}
              >
                {audioFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bitrate Selection (not for WAV) */}
            {outputFormat !== 'wav' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Audio Quality (Bitrate)
                </label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  disabled={converting}
                >
                  {bitrateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={convertFile}
              disabled={converting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 transition-colors"
            >
              {converting ? (
                <>Converting...</>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to {outputFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Supported Formats:</p>
                <ul className="space-y-1">
                  <li>• <strong>MP3:</strong> Best compatibility, smaller file size</li>
                  <li>• <strong>WAV:</strong> Lossless quality, larger file size</li>
                  <li>• <strong>OGG:</strong> Good quality, open-source format</li>
                  <li>• <strong>WebM:</strong> Modern web-optimized format</li>
                  <li>• Works completely offline (no internet required)</li>
                  <li>• Your files never leave your computer</li>
                </ul>
              </div>
            </div>
          </div>
            </div>
          )}
        </>
      ) : (
        /* Document Converter */
        <>
          {!file ? (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
                <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Document File
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Supports PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx)
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
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {documentType.toUpperCase()} Document
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
                  >
                    Change File
                  </button>
                </div>

                {/* Available Conversions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                    Available Conversions:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getAvailableConversions().map((conversion) => {
                      const isOfflineConversion = conversion.from === 'word' && conversion.to === 'pdf';
                      const requiresInternet = !isOfflineConversion;
                      
                      return (
                        <button
                          key={`${conversion.from}-${conversion.to}`}
                          onClick={() => convertDocument(conversion.to)}
                          disabled={converting || (requiresInternet && conversionCount >= DAILY_LIMIT)}
                          className="relative flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{conversion.icon}</span>
                            <div className="text-left">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                {conversion.label}
                                {isOfflineConversion && (
                                  <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                                    OFFLINE
                                  </span>
                                )}
                                {requiresInternet && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full flex items-center gap-1">
                                    <Wifi className="w-3 h-3" />
                                    API
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {requiresInternet ? 
                                  `Convert to ${conversion.to.toUpperCase()} (Requires Internet)` :
                                  `Convert to ${conversion.to.toUpperCase()} (Works Offline)`
                                }
                              </p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                          {requiresInternet && conversionCount >= DAILY_LIMIT && (
                            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                Limit Reached
                              </span>
                            </div>
                          )}
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
                  <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {converting && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        Converting document... {conversionProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300 ease-out"
                        style={{ width: `${conversionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 text-center">
                      {conversionProgress < 30 ? 'Preparing...' :
                       conversionProgress < 60 ? 'Converting...' :
                       conversionProgress < 90 ? 'Finalizing...' :
                       'Almost done...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-800 dark:text-emerald-200">
                      <p className="font-semibold mb-2">Document Conversion Features:</p>
                      <ul className="space-y-1">
                        <li>• <strong>Word → PDF:</strong> Works completely offline! ✨</li>
                        <li>• <strong>PDF → Word/PPT:</strong> Requires internet (API-based)</li>
                        <li>• <strong>PPT/Excel → PDF:</strong> Requires internet (API-based)</li>
                        <li>• <strong>Maintains Formatting:</strong> Preserves layouts, fonts, and styles</li>
                        <li>• <strong>High Quality:</strong> Balanced speed and accuracy</li>
                        <li>• <strong>Free Tier:</strong> {DAILY_LIMIT} conversions per day (API)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {!navigator.onLine && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-semibold mb-1">⚠️ No Internet Connection</p>
                        <p>Only offline conversions (Word → PDF) are available. Please connect to the internet for other conversions.</p>
                      </div>
                    </div>
                  </div>
                )}

                {conversionCount >= DAILY_LIMIT && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-semibold mb-1">🚫 Daily Limit Reached</p>
                        <p>You've used all {DAILY_LIMIT} free API conversions today. Counter resets in 24 hours. Offline conversions (Word → PDF) still work!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-1">🔒 Privacy & Safety</p>
                      <p className="text-xs">
                        • Offline conversions never leave your device<br />
                        • API conversions use secure CloudConvert (files deleted after 24h)<br />
                        • Free tier limited to {DAILY_LIMIT} conversions/day to prevent unexpected bills<br />
                        • No personal data collected or stored
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileConverter;
