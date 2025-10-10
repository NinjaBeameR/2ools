import React, { useState, useRef } from 'react';
import { Upload, Download, Maximize2, Crop } from 'lucide-react';

function ImageResizerCropper() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          setNewDimensions({ width: img.width, height: img.height });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleWidthChange = (width) => {
    setNewDimensions((prev) => {
      if (maintainAspectRatio) {
        const ratio = dimensions.height / dimensions.width;
        return { width, height: Math.round(width * ratio) };
      }
      return { ...prev, width };
    });
  };

  const handleHeightChange = (height) => {
    setNewDimensions((prev) => {
      if (maintainAspectRatio) {
        const ratio = dimensions.width / dimensions.height;
        return { height, width: Math.round(height * ratio) };
      }
      return { ...prev, height };
    });
  };

  const resizeImage = async () => {
    if (!file || newDimensions.width <= 0 || newDimensions.height <= 0) {
      alert('Please enter valid dimensions');
      return;
    }

    setProcessing(true);

    try {
      const img = new Image();
      img.src = preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = newDimensions.width;
      canvas.height = newDimensions.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name.replace(/(\.[^.]+)$/, '_resized$1');
        link.click();
        URL.revokeObjectURL(url);
        setProcessing(false);
        alert('Image resized successfully!');
      }, file.type);
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Error resizing image: ' + error.message);
      setProcessing(false);
    }
  };

  const quickResize = (percentage) => {
    const width = Math.round(dimensions.width * (percentage / 100));
    const height = Math.round(dimensions.height * (percentage / 100));
    setNewDimensions({ width, height });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Image Resizer & Cropper</h2>

      {/* Upload Area */}
      {!file ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Click to select an image
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Resize or crop your images
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
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Preview */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Preview</h3>
              <img
                ref={imgRef}
                src={preview}
                alt="Preview"
                className="w-full max-h-80 object-contain bg-zinc-100 dark:bg-zinc-900 rounded-lg"
              />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
                Original: {dimensions.width} × {dimensions.height} px
              </p>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                Remove Image
              </button>
            </div>

            {/* Resize Options */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Resize Options</h3>

              {/* Dimensions */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={newDimensions.width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={newDimensions.height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    Maintain aspect ratio
                  </span>
                </label>
              </div>

              {/* Quick Resize */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Quick Resize
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 75].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => quickResize(percent)}
                      className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* New Dimensions Preview */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  New size: {newDimensions.width} × {newDimensions.height} px
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={resizeImage}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Maximize2 className="w-5 h-5" />
                Resize Image
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default ImageResizerCropper;
