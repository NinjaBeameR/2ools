import React, { useState, useRef } from 'react';
import { Upload, FileImage, Copy, Download, Loader } from 'lucide-react';
import Tesseract from 'tesseract.js';

function OCRTextExtractor() {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setExtractedText('');

    try {
      const result = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setExtractedText(result.data.text);
    } catch (error) {
      alert('Error extracting text: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert('Text copied to clipboard!');
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">OCR Text Extractor</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload size={20} />
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {image && !isProcessing && (
          <button
            onClick={extractText}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileImage size={20} />
            Extract Text
          </button>
        )}

        {extractedText && (
          <>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Copy size={20} />
              Copy
            </button>
            <button
              onClick={downloadText}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download size={20} />
              Download
            </button>
          </>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Image Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Image Preview</h2>
          {image ? (
            <img src={image} alt="Preview" className="max-w-full rounded" />
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded">
              <div className="text-center text-gray-400">
                <FileImage size={48} className="mx-auto mb-2" />
                <p>Upload an image to extract text</p>
              </div>
            </div>
          )}
        </div>

        {/* Extracted Text */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
          
          {isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader size={48} className="animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 mb-2">Processing image...</p>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{progress}%</p>
            </div>
          )}

          {!isProcessing && extractedText && (
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Extracted text will appear here..."
            />
          )}

          {!isProcessing && !extractedText && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-400">No text extracted yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> For best results, use clear, high-contrast images with readable text.
          Supports English text recognition.
        </p>
      </div>
    </div>
  );
}

export default OCRTextExtractor;
