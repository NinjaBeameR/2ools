import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import MaintenanceNotice from '../components/MaintenanceNotice';

// Lazy load all tool components for better performance
const Calculator = lazy(() => import('../tools/Calculator'));
const UnitConverter = lazy(() => import('../tools/UnitConverter'));
const ClipboardManager = lazy(() => import('../tools/ClipboardManager'));
const QRCodeGenerator = lazy(() => import('../tools/QRCodeGenerator'));
const TextFormatter = lazy(() => import('../tools/TextFormatter'));
const PasswordGenerator = lazy(() => import('../tools/PasswordGenerator'));
const PDFMerger = lazy(() => import('../tools/PDFMerger'));
const PDFSplitter = lazy(() => import('../tools/PDFSplitter'));
const PDFCompressor = lazy(() => import('../tools/PDFCompressor'));
const ImageConverter = lazy(() => import('../tools/ImageConverter'));
const ImageResizerCropper = lazy(() => import('../tools/ImageResizerCropper'));
const ToDoList = lazy(() => import('../tools/ToDoList'));
const Notes = lazy(() => import('../tools/Notes'));
const PomodoroTimer = lazy(() => import('../tools/PomodoroTimer'));
const ReminderAlerts = lazy(() => import('../tools/ReminderAlerts'));
const DailyJournal = lazy(() => import('../tools/DailyJournal'));
const DuplicateFileFinder = lazy(() => import('../tools/DuplicateFileFinder'));
const FileOrganizer = lazy(() => import('../tools/FileOrganizer'));
const TemporaryFileCleaner = lazy(() => import('../tools/TemporaryFileCleaner'));
const DiskSpaceAnalyzer = lazy(() => import('../tools/DiskSpaceAnalyzer'));
const StartupProgramManager = lazy(() => import('../tools/StartupProgramManager'));
const FileLocker = lazy(() => import('../tools/FileLocker'));
const ClipboardPrivacyMode = lazy(() => import('../tools/ClipboardPrivacyMode'));
const SecureNotes = lazy(() => import('../tools/SecureNotes'));
const AudioTrimmerJoiner = lazy(() => import('../tools/AudioTrimmerJoiner'));
const ImageToPDF = lazy(() => import('../tools/ImageToPDF'));
const TextToSpeech = lazy(() => import('../tools/TextToSpeech'));
const VideoCompressor = lazy(() => import('../tools/VideoCompressor'));
const DailyGoalDashboard = lazy(() => import('../tools/DailyGoalDashboard'));
const HabitTracker = lazy(() => import('../tools/HabitTracker'));
const ReadingMode = lazy(() => import('../tools/ReadingMode'));
const TwoLayerVault = lazy(() => import('../tools/TwoLayerVault'));
const SystemInfoDashboard = lazy(() => import('../tools/SystemInfoDashboard'));
const FileConverter = lazy(() => import('../tools/FileConverter'));

// Loading component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-zinc-600 dark:text-zinc-400">Loading tool...</p>
    </div>
  );
}

function ToolWindow() {
  const { toolName } = useParams();

  const renderTool = () => {
    switch (toolName) {
      case 'calculator':
        return <Calculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'clipboard-manager':
        return <ClipboardManager />;
      case 'qr-code-generator':
        return <QRCodeGenerator />;
      case 'text-formatter':
        return <TextFormatter />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'pdf-merger':
        return <PDFMerger />;
      case 'pdf-splitter':
        return <PDFSplitter />;
      case 'pdf-compressor':
        return <PDFCompressor />;
      case 'image-converter':
        return <ImageConverter />;
      case 'image-resizer-and-cropper':
        return <ImageResizerCropper />;
      case 'to-do-list':
        return <ToDoList />;
      case 'notes':
        return <Notes />;
      case 'pomodoro-timer':
        return <PomodoroTimer />;
      case 'reminder-alerts':
        return <ReminderAlerts />;
      case 'daily-journal':
        return <DailyJournal />;
      case 'duplicate-file-finder':
        return <DuplicateFileFinder />;
      case 'file-organizer':
        return <FileOrganizer />;
      case 'temporary-file-cleaner':
        return <TemporaryFileCleaner />;
      case 'disk-space-analyzer':
        return <DiskSpaceAnalyzer />;
      case 'startup-program-manager':
        return <StartupProgramManager />;
      case 'file-locker':
        return <FileLocker />;
      case 'clipboard-privacy-mode':
        return <ClipboardPrivacyMode />;
      case 'secure-notes':
        return <SecureNotes />;
      // Media Tools
      case 'audio-trimmer-and-joiner':
        return <AudioTrimmerJoiner />;
      case 'image-to-pdf':
        return <ImageToPDF />;
      case 'text-to-speech':
        return <TextToSpeech />;
      case 'video-compressor':
        return <VideoCompressor />;
      // Productivity Tools
      case 'daily-goal-dashboard':
        return <DailyGoalDashboard />;
      case 'habit-tracker':
        return <HabitTracker />;
      case 'reading-mode':
        return <ReadingMode />;
      // Security Tools
      case 'two-layer-vault':
        return <TwoLayerVault />;
      // System Tools
      case 'system-info-dashboard':
        return <SystemInfoDashboard />;
      case 'file-converter':
        return <MaintenanceNotice toolName="File Converter" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Tool Coming Soon
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {toolName?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 overflow-auto">
      <Suspense fallback={<LoadingFallback />}>
        {renderTool()}
      </Suspense>
    </div>
  );
}

export default ToolWindow;