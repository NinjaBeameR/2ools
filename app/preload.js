const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openToolWindow: (toolName) => ipcRenderer.invoke('open-tool-window', toolName),
  // Add more APIs as needed
});