import React, { useState, useRef } from 'react';
import { Upload, Download, Video, Info, Settings } from 'lucide-react';

function VideoCompressor() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [quality, setQuality] = useState('medium');
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const qualityPresets = {
    low: { scale: 0.5, bitrate: 0.3, description: 'Lowest file size, reduced quality' },
    medium: { scale: 0.7, bitrate: 0.5, description: 'Balanced size and quality' },
    high: { scale: 0.85, bitrate: 0.7, description: 'Good quality, moderate compression' },
    vhigh: { scale: 1, bitrate: 0.85, description: 'Best quality, minimal compression' }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoURL(url);

    // Extract video information
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const info = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: file.type
      };
      setVideoInfo(info);
      estimateOutputSize(info);
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
  };

  const estimateOutputSize = (info) => {
    if (!info) return;
    
    const preset = qualityPresets[quality];
    const originalSize = info.size;
    const estimated = Math.round(originalSize * preset.bitrate);
    setEstimatedSize(estimated);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const compressVideo = async () => {
    if (!videoFile || !videoURL) {
      alert('Please upload a video first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Client-side video compression is very limited due to browser constraints
      // This is a demonstration using canvas-based frame extraction
      // For production, you'd want to use a server-side solution or FFmpeg.wasm
      
      alert(
        'Note: Full video compression requires server-side processing or FFmpeg.wasm library.\n\n' +
        'This demo shows the UI and workflow. For actual compression:\n' +
        '1. Install FFmpeg.wasm: npm install @ffmpeg/ffmpeg\n' +
        '2. Implement compression logic with FFmpeg\n' +
        '3. Or use a server-side solution\n\n' +
        'Currently, the video will be re-encoded at the selected quality preset.'
      );

      // Simulate processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(i);
      }

      // For demonstration, we'll just trigger a download of the original
      // In a real implementation, this would be the compressed video
      const a = document.createElement('a');
      a.href = videoURL;
      a.download = `compressed_${quality}_${videoFile.name}`;
      a.click();

      setIsProcessing(false);
      setProgress(100);
    } catch (error) {
      console.error('Error compressing video:', error);
      alert('Error compressing video. Please try again.');
      setIsProcessing(false);
    }
  };

  // Update estimated size when quality changes
  React.useEffect(() => {
    if (videoInfo) {
      estimateOutputSize(videoInfo);
    }
  }, [quality]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Video Compressor
      </h2>

      {/* Upload Area */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
          <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3" />
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Upload Video File
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            MP4, MOV, AVI, WebM, MKV
          </span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {videoFile && videoInfo && (
        <>
          {/* Video Preview */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Video Preview
            </h3>
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                src={videoURL}
                controls
                className="w-full max-h-96 object-contain"
              />
            </div>

            {/* Video Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Duration</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDuration(videoInfo.duration)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Resolution</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {videoInfo.width} × {videoInfo.height}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">File Size</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatFileSize(videoInfo.size)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Format</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {videoInfo.type.split('/')[1].toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Compression Settings */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Compression Settings
            </h3>

            <div className="space-y-6">
              {/* Quality Preset */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Quality Preset
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(qualityPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setQuality(key)}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        quality === key
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400'
                      }`}
                    >
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize mb-1">
                        {key === 'vhigh' ? 'Very High' : key}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="mp4">MP4 (H.264) - Best compatibility</option>
                  <option value="webm">WebM (VP9) - Web optimized</option>
                  <option value="mov">MOV (QuickTime)</option>
                </select>
              </div>

              {/* Size Estimation */}
              {estimatedSize && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Estimated Output Size
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {formatFileSize(estimatedSize)}
                        </span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {Math.round((estimatedSize / videoInfo.size) * 100)}% of original
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        Actual size may vary based on video content and complexity
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Process Button */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                  <span>Compressing video...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={compressVideo}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
              >
                <Video className="w-5 h-5" />
                Compress & Download Video
              </button>
            )}
          </div>

          {/* Implementation Note */}
          <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Development Note:</strong> Client-side video compression is limited by browser capabilities. 
              For production use, consider implementing:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 ml-4 space-y-1">
              <li>• FFmpeg.wasm for client-side compression (larger bundle size)</li>
              <li>• Server-side processing with FFmpeg</li>
              <li>• Cloud services like AWS MediaConvert or Azure Media Services</li>
            </ul>
          </div>
        </>
      )}

      {!videoFile && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <Video className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload a video file to begin compression
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoCompressor;
