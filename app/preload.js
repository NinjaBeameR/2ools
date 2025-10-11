const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openToolWindow: (toolName) => ipcRenderer.invoke('open-tool-window', toolName),
});

contextBridge.exposeInMainWorld('electron', {
  // Disk Space Analyzer
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  analyzeDiskSpace: (path) => ipcRenderer.invoke('analyze-disk-space', path),
  
  // Temp File Cleaner
  scanTempFiles: (path) => ipcRenderer.invoke('scan-temp-files', path),
  cleanTempFiles: (path) => ipcRenderer.invoke('clean-temp-files', path),
  
  // File Locker
  selectFile: () => ipcRenderer.invoke('select-file'),
  processFile: (data) => ipcRenderer.invoke('process-file', data),
  
  // Startup Manager
  getStartupPrograms: () => ipcRenderer.invoke('get-startup-programs'),
  toggleStartupProgram: (data) => ipcRenderer.invoke('toggle-startup-program', data),
  
  // Clipboard Manager
  toggleClipboardMonitoring: (enabled) => ipcRenderer.invoke('toggle-clipboard-monitoring', enabled),
  onClipboardChange: (callback) => ipcRenderer.on('clipboard-changed', (event, text) => callback(text)),
  
  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
  
  // System Info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
});