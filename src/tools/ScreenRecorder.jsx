import React, { useState, useRef, useEffect } from 'react';
import { Video, Camera, Square, Download, Monitor, MonitorPlay, AlertCircle, CheckCircle, Loader } from 'lucide-react';

function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordingMode, setRecordingMode] = useState('screen'); // screen or window
  const [includeAudio, setIncludeAudio] = useState(false);
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [screenshots, setScreenshots] = useState([]);
  const [recordingMimeType, setRecordingMimeType] = useState('video/webm');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getQualityConstraints = () => {
    const qualities = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 }
    };
    return qualities[videoQuality] || qualities['1080p'];
  };

  const startRecording = async () => {
    try {
      setError('');
      const constraints = getQualityConstraints();

      // Get screen/window stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          ...constraints,
          frameRate: 30
        },
        audio: false
      });

      let audioStream = null;
      if (includeAudio) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (audioErr) {
          setError('Could not capture audio. Recording without audio.');
        }
      }

      // Combine streams
      let tracks = displayStream.getVideoTracks();
      if (audioStream) {
        tracks = [...tracks, ...audioStream.getAudioTracks()];
      }

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Setup MediaRecorder
      // Try to use MP4/H.264 format first (better compatibility), fallback to WebM
      let mimeType = 'video/webm;codecs=vp9';
      
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      const options = {
        mimeType,
        videoBitsPerSecond: videoQuality === '4k' ? 10000000 : videoQuality === '1080p' ? 5000000 : 2500000
      };

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingMimeType(mimeType); // Store for later use

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Handle stream end (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setSuccess('Recording started successfully!');
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setSuccess('Recording stopped successfully!');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const downloadRecording = async () => {
    if (recordedChunks.length === 0) {
      setError('No recording to download');
      return;
    }

    try {
      // Determine file extension from mime type
      const extension = recordingMimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunks, { type: recordingMimeType });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const defaultName = `screen-recording-${timestamp}.${extension}`;

      // Check if we're in Electron environment
      if (window.electron && window.electron.saveRecording) {
        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        // Use Electron's save dialog
        const result = await window.electron.saveRecording(Array.from(buffer), defaultName);
        
        if (result.success) {
          setSuccess('Recording saved successfully!');
          setRecordedChunks([]); // Clear after saving
        } else if (result.canceled) {
          // User canceled, do nothing
        } else {
          setError('Failed to save recording: ' + (result.error || 'Unknown error'));
        }
      } else {
        // Fallback for browser/dev environment
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        a.click();
        URL.revokeObjectURL(url);
        setSuccess('Recording downloaded successfully!');
        setRecordedChunks([]); // Clear after saving
      }
    } catch (err) {
      setError('Failed to save recording: ' + err.message);
    }
  };

  const takeScreenshot = async () => {
    try {
      setError('');
      const constraints = getQualityConstraints();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          ...constraints
        }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const screenshot = {
        id: Date.now(),
        dataUrl: canvas.toDataURL('image/png'),
        timestamp: new Date().toISOString(),
        width: canvas.width,
        height: canvas.height
      };

      setScreenshots(prev => [screenshot, ...prev]);
      setSuccess('Screenshot captured!');
    } catch (err) {
      setError('Failed to capture screenshot: ' + err.message);
    }
  };

  const downloadScreenshot = (screenshot) => {
    const a = document.createElement('a');
    a.href = screenshot.dataUrl;
    a.download = `screenshot-${new Date(screenshot.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    a.click();
    setSuccess('Screenshot downloaded!');
  };

  const deleteScreenshot = (id) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
    setSuccess('Screenshot deleted');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
        <MonitorPlay className="w-8 h-8 text-emerald-600" />
        Screen Recorder & Screenshot
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Screen Recording */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            Screen Recording
          </h3>

          {!isRecording ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Video Quality</label>
                <select 
                  value={videoQuality} 
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeAudio} 
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-zinc-100 border-zinc-300 rounded focus:ring-emerald-500 dark:bg-zinc-700 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Include microphone audio</span>
                </label>
              </div>

              <button 
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Video className="w-5 h-5" />
                Start Recording
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className={`text-4xl font-mono font-bold mb-2 ${isPaused ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatTime(recordingTime)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {isPaused ? 'Paused' : 'Recording'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isPaused ? (
                  <button 
                    onClick={pauseRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button 
                    onClick={resumeRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button 
                  onClick={stopRecording}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </div>
            </>
          )}

          {recordedChunks.length > 0 && !isRecording && (
            <button 
              onClick={downloadRecording}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Recording
            </button>
          )}
        </div>

        {/* Screenshot */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Screenshot
          </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Capture high-quality screenshots of your screen or specific windows.
          </p>

          <button 
            onClick={takeScreenshot}
            disabled={isRecording}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            Take Screenshot
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Screenshots Gallery */}
      {screenshots.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recent Screenshots ({screenshots.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="relative group bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img 
                  src={screenshot.dataUrl} 
                  alt="Screenshot" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3">
                    {screenshot.width} × {screenshot.height}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadScreenshot(screenshot)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button 
                      onClick={() => deleteScreenshot(screenshot.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Features:</p>
            <ul className="space-y-1">
              <li>• Record screen or specific windows</li>
              <li>• Multiple quality options (720p, 1080p, 4K)</li>
              <li>• Optional microphone audio capture</li>
              <li>• Pause and resume recordings</li>
              <li>• Instant screenshot capture</li>
              <li>• Download recordings and screenshots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenRecorder;
