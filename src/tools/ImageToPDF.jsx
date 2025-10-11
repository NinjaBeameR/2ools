import React, { useState } from 'react';
import { Upload, Download, Trash2, ArrowUp, ArrowDown, FileImage } from 'lucide-react';
import { jsPDF } from 'jspdf';

function ImageToPDF() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [quality, setQuality] = useState(0.92);
  const [margin, setMargin] = useState(10);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImages(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              name: file.name,
              url: event.target.result,
              width: img.width,
              height: img.height,
              file: file
            }
          ]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (id, direction) => {
    const index = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const generatePDF = async () => {
    if (images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    try {
      // Page size dimensions in mm
      const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
        legal: { width: 216, height: 356 },
        a3: { width: 297, height: 420 },
        a5: { width: 148, height: 210 }
      };

      const size = pageSizes[pageSize];
      const [pageWidth, pageHeight] = orientation === 'portrait' 
        ? [size.width, size.height] 
        : [size.height, size.width];

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [pageWidth, pageHeight]
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate dimensions to fit image within page with margins
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const imgRatio = image.width / image.height;
        const pageRatio = maxWidth / maxHeight;

        let imgWidth, imgHeight;
        
        if (imgRatio > pageRatio) {
          // Image is wider than page ratio
          imgWidth = maxWidth;
          imgHeight = maxWidth / imgRatio;
        } else {
          // Image is taller than page ratio
          imgHeight = maxHeight;
          imgWidth = maxHeight * imgRatio;
        }

        // Center the image
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        // Add image to PDF
        pdf.addImage(
          image.url,
          'JPEG',
          x,
          y,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      // Save PDF
      pdf.save('images-to-pdf.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Image to PDF Converter
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 sticky top-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              PDF Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">Letter (8.5 × 11 in)</option>
                  <option value="legal">Legal (8.5 × 14 in)</option>
                  <option value="a3">A3 (297 × 420 mm)</option>
                  <option value="a5">A5 (148 × 210 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Orientation
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      orientation === 'portrait'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      orientation === 'landscape'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Margin: {margin}mm
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Higher quality = larger file size
                </p>
              </div>
            </div>

            <button
              onClick={generatePDF}
              disabled={images.length === 0}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Generate PDF ({images.length} {images.length === 1 ? 'image' : 'images'})
            </button>
          </div>
        </div>

        {/* Images Panel */}
        <div className="lg:col-span-2">
          {/* Upload Area */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
              <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3" />
              <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Upload Images
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                PNG, JPG, JPEG, GIF, WebP
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Images List */}
          {images.length === 0 ? (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
              <FileImage className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400">
                No images added yet. Upload images to create a PDF.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Images ({images.length})
              </h3>
              
              <div className="space-y-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                  >
                    {/* Thumbnail */}
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {image.width} × {image.height} px
                        {image.file && ` • ${formatFileSize(image.file.size)}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 min-w-[2rem] text-center">
                        {index + 1}
                      </span>
                      
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="p-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          className="p-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageToPDF;
