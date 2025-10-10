import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    generateQR();
  }, [text]);

  const generateQR = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">QR Code Generator</h2>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Enter Text or URL
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text, URL, phone number, or any data..."
          className="w-full h-32 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none mb-4"
        />

        {/* QR Code Display */}
        {qrDataUrl ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-72 h-72" />
            </div>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-72 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
            <p className="text-zinc-500 dark:text-zinc-400">Enter text to generate QR code</p>
          </div>
        )}
      </div>

      {/* Quick Examples */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Quick Examples</h3>
        <div className="space-y-2">
          {[
            { label: 'Website URL', value: 'https://www.example.com' },
            { label: 'Email', value: 'mailto:contact@example.com' },
            { label: 'Phone', value: 'tel:+1234567890' },
            { label: 'SMS', value: 'sms:+1234567890' },
            { label: 'WiFi', value: 'WIFI:T:WPA;S:NetworkName;P:Password;;' },
          ].map((example) => (
            <button
              key={example.label}
              onClick={() => setText(example.value)}
              className="w-full text-left px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{example.label}:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-2">{example.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QRCodeGenerator;
