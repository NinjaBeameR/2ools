import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scissors, Link, Play, Pause, Download, Trash2, Plus } from 'lucide-react';

function AudioTrimmerJoiner() {
  const [mode, setMode] = useState('trim'); // 'trim' or 'join'
  const [audioFiles, setAudioFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (currentFile && audioRef.current) {
      const audio = audioRef.current;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setTrimEnd(audio.duration);
        generateWaveform(currentFile.file);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  }, [currentFile]);

  const generateWaveform = async (file) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.pow(Math.max(...filteredData), -1);
      setWaveformData(filteredData.map(n => n * multiplier));
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const audioFilesData = files
      .filter(file => file.type.startsWith('audio/'))
      .map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        file: file,
        url: URL.createObjectURL(file),
        duration: 0
      }));

    if (mode === 'trim' && audioFilesData.length > 0) {
      setCurrentFile(audioFilesData[0]);
      setAudioFiles([audioFilesData[0]]);
    } else {
      setAudioFiles(prev => [...prev, ...audioFilesData]);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If in trim mode, play from trim start
      if (mode === 'trim' && audioRef.current.currentTime < trimStart) {
        audioRef.current.currentTime = trimStart;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleTrimAudio = async () => {
    if (!currentFile) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await currentFile.file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const startSample = Math.floor(trimStart * audioBuffer.sampleRate);
      const endSample = Math.floor(trimEnd * audioBuffer.sampleRate);
      const trimmedLength = endSample - startSample;

      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = channelData[startSample + i];
        }
      }

      // Export as WAV
      const wav = audioBufferToWav(trimmedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed_${currentFile.name.replace(/\.[^/.]+$/, '')}.wav`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error trimming audio:', error);
      alert('Error trimming audio. Please try again.');
    }
  };

  const handleJoinAudio = async () => {
    if (audioFiles.length < 2) {
      alert('Please add at least 2 audio files to join.');
      return;
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffers = [];

      // Load all audio files
      for (const file of audioFiles) {
        const arrayBuffer = await file.file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      }

      // Calculate total length
      const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
      const numberOfChannels = buffers[0].numberOfChannels;
      const sampleRate = buffers[0].sampleRate;

      // Create output buffer
      const outputBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);

      // Concatenate audio
      let offset = 0;
      for (const buffer of buffers) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          outputBuffer.getChannelData(channel).set(channelData, offset);
        }
        offset += buffer.length;
      }

      // Export as WAV
      const wav = audioBufferToWav(outputBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'joined_audio.wav';
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error joining audio:', error);
      alert('Error joining audio files. Please try again.');
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  const removeFile = (id) => {
    setAudioFiles(prev => prev.filter(f => f.id !== id));
    if (currentFile?.id === id) {
      setCurrentFile(null);
    }
  };

  const moveFile = (id, direction) => {
    const index = audioFiles.findIndex(f => f.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === audioFiles.length - 1)
    ) {
      return;
    }

    const newFiles = [...audioFiles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setAudioFiles(newFiles);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Audio Trimmer & Joiner
      </h2>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode('trim');
            setAudioFiles([]);
            setCurrentFile(null);
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            mode === 'trim'
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <Scissors className="w-5 h-5" />
          Trim Audio
        </button>
        <button
          onClick={() => {
            setMode('join');
            setAudioFiles([]);
            setCurrentFile(null);
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            mode === 'join'
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <Link className="w-5 h-5" />
          Join Audio
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
          <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-3" />
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {mode === 'trim' ? 'Upload Audio File' : 'Upload Audio Files'}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Supports MP3, WAV, OGG, M4A
          </span>
          <input
            type="file"
            accept="audio/*"
            multiple={mode === 'join'}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Trim Mode */}
      {mode === 'trim' && currentFile && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {currentFile.name}
          </h3>

          {/* Audio Player */}
          <audio ref={audioRef} src={currentFile.url} />

          {/* Waveform Display */}
          <div className="mb-6 relative">
            <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden relative">
              <div className="flex items-center justify-around h-full px-2">
                {waveformData.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 mx-px bg-emerald-500 dark:bg-emerald-400 rounded-full"
                    style={{
                      height: `${value * 100}%`,
                      opacity: (i / waveformData.length * duration) >= trimStart && (i / waveformData.length * duration) <= trimEnd ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            
            {/* Seek Bar */}
            <div
              className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg mt-2 cursor-pointer relative"
              onClick={handleSeek}
            >
              <div
                className="absolute top-0 bottom-0 bg-emerald-500 dark:bg-emerald-400 rounded-lg"
                style={{
                  left: `${(trimStart / duration) * 100}%`,
                  width: `${((trimEnd - trimStart) / duration) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={togglePlayPause}
              className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <div className="text-zinc-700 dark:text-zinc-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Trim Controls */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Trim Start: {formatTime(trimStart)}
              </label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={trimStart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val < trimEnd) setTrimStart(val);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Trim End: {formatTime(trimEnd)}
              </label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={trimEnd}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val > trimStart) setTrimEnd(val);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleTrimAudio}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Export Trimmed Audio
          </button>
        </div>
      )}

      {/* Join Mode */}
      {mode === 'join' && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Files to Join ({audioFiles.length})
          </h3>

          {audioFiles.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
              Upload at least 2 audio files to join them together.
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {audioFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </span>
                    <div className="flex gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveFile(file.id, 'up')}
                          className="px-2 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
                        >
                          ↑
                        </button>
                      )}
                      {index < audioFiles.length - 1 && (
                        <button
                          onClick={() => moveFile(file.id, 'down')}
                          className="px-2 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleJoinAudio}
                disabled={audioFiles.length < 2}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Join & Export Audio
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AudioTrimmerJoiner;
