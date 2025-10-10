import React from 'react';
import { useParams } from 'react-router-dom';
import Calculator from '../tools/Calculator';
import UnitConverter from '../tools/UnitConverter';
import ClipboardManager from '../tools/ClipboardManager';
import QRCodeGenerator from '../tools/QRCodeGenerator';
import TextFormatter from '../tools/TextFormatter';
import PasswordGenerator from '../tools/PasswordGenerator';
import PDFMerger from '../tools/PDFMerger';
import PDFSplitter from '../tools/PDFSplitter';
import PDFCompressor from '../tools/PDFCompressor';
import ImageConverter from '../tools/ImageConverter';
import ImageResizerCropper from '../tools/ImageResizerCropper';
import ToDoList from '../tools/ToDoList';
import Notes from '../tools/Notes';
import PomodoroTimer from '../tools/PomodoroTimer';
import ReminderAlerts from '../tools/ReminderAlerts';
import DailyJournal from '../tools/DailyJournal';
import DuplicateFileFinder from '../tools/DuplicateFileFinder';
import FileOrganizer from '../tools/FileOrganizer';
import TemporaryFileCleaner from '../tools/TemporaryFileCleaner';
import DiskSpaceAnalyzer from '../tools/DiskSpaceAnalyzer';
import StartupProgramManager from '../tools/StartupProgramManager';
import FileLocker from '../tools/FileLocker';
import ClipboardPrivacyMode from '../tools/ClipboardPrivacyMode';
import SecureNotes from '../tools/SecureNotes';

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
      {renderTool()}
    </div>
  );
}

export default ToolWindow;