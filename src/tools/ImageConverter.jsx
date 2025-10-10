import React, { useState } from 'react';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';

function ImageConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [outputFormat, setOutputFormat] = useState('png');
  const [converting, setConverting] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const convertImage = async () => {
    if (!file) {
      alert('Please select an image first');
      return;
    }

    setConverting(true);

    try {
      const img = new Image();
      img.src = preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
        link.click();
        URL.revokeObjectURL(url);
        setConverting(false);
        alert('Image converted successfully!');
      }, `image/${outputFormat}`);
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Error converting image: ' + error.message);
      setConverting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Image Converter</h2>

      {/* Upload Area */}
      {!file ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Click to select an image
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Convert between JPG, PNG, WEBP, and more
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          {/* Preview and Options */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-start gap-6 mb-6">
              {/* Preview */}
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Preview</h3>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {file.name} • {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Options */}
              <div className="w-64">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Convert To</h3>
                <div className="space-y-2">
                  {[
                    { value: 'png', label: 'PNG', desc: 'Lossless, transparency' },
                    { value: 'jpeg', label: 'JPEG/JPG', desc: 'Lossy, smaller size' },
                    { value: 'webp', label: 'WebP', desc: 'Modern, efficient' },
                  ].map((format) => (
                    <label
                      key={format.value}
                      className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={outputFormat === format.value}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="mt-1 w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{format.label}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{format.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                  }}
                  className="w-full mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Image
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={convertImage}
            disabled={converting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors"
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
        </>
      )}
    </div>
  );
}

export default ImageConverter;
