import React, { useState, useRef } from 'react';
import { Upload, Download, ImageIcon } from 'lucide-react';

function WatermarkTool() {
  const [image, setImage] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState('bottom-right');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyWatermark = () => {
    if (!image || !watermarkText) {
      alert('Please upload an image and enter watermark text');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
      ctx.lineWidth = 2;

      const textWidth = ctx.measureText(watermarkText).width;
      let x, y;

      switch (position) {
        case 'top-left':
          x = 20;
          y = fontSize + 20;
          break;
        case 'top-right':
          x = canvas.width - textWidth - 20;
          y = fontSize + 20;
          break;
        case 'bottom-left':
          x = 20;
          y = canvas.height - 20;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - 20;
          y = canvas.height - 20;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
        default:
          x = canvas.width - textWidth - 20;
          y = canvas.height - 20;
      }

      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);
    };

    img.src = image;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `watermarked-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Watermark Tool</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload size={20} />
            Upload Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="Watermark text"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="center">Center</option>
          </select>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="20"
              max="100"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Opacity: {Math.round(opacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={applyWatermark}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Apply Watermark
          </button>
          {canvasRef.current?.width > 0 && (
            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download size={20} />
              Download
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        {canvasRef.current?.width > 0 ? (
          <canvas ref={canvasRef} className="max-w-full border" />
        ) : (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
              <p>Upload an image and apply watermark to see preview</p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="max-w-full border" style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default WatermarkTool;
