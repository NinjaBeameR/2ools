const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173/#/'
      : `file://${path.join(__dirname, '../dist/index.html#/')}`
  );

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for tools
ipcMain.handle('open-tool-window', (event, toolName) => {
  // Set window size based on tool type
  let width = 900;
  let height = 700;
  let resizable = true;
  let maximizable = true;
  
  // Adjust size for specific tools
  if (toolName === 'calculator') {
    width = 450;
    height = 600;
  } else if (toolName === 'password-generator' || toolName === 'qr-code-generator') {
    width = 700;
    height = 600;
  } else if (toolName.includes('pdf') || toolName.includes('image')) {
    width = 1100;
    height = 800;
  }

  const toolWindow = new BrowserWindow({
    width,
    height,
    minWidth: 400,
    minHeight: 500,
    resizable,
    maximizable,
    parent: null, // Remove parent to prevent minimize issue
    modal: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = process.env.NODE_ENV === 'development'
    ? `http://localhost:5173/#/tool/${toolName}`
    : `file://${path.join(__dirname, '../dist/index.html')}#/tool/${toolName}`;

  console.log('Loading tool window:', url);
  toolWindow.loadURL(url);

  if (process.env.NODE_ENV === 'development') {
    toolWindow.webContents.openDevTools();
  }

  toolWindow.once('ready-to-show', () => {
    toolWindow.show();
  });

  toolWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load tool window:', errorDescription);
  });

  // Prevent closing tool window from affecting main window
  toolWindow.on('close', (e) => {
    // Just close this window, don't affect others
  });
});