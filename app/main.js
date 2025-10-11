const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Configure auto-updater properly
autoUpdater.autoDownload = false; // Don't auto-download, let user decide
autoUpdater.autoInstallOnAppQuit = false;

// Helper function to send update status to renderer
function sendUpdateStatus(status, data = {}) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status, data });
  }
}

// Handle all auto-updater events properly
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  sendUpdateStatus('checking-for-update');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  sendUpdateStatus('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('No updates available');
  sendUpdateStatus('update-not-available', info);
});

autoUpdater.on('error', (error) => {
  log.error('AutoUpdater error (suppressed):', error.message);
  // Send to UI so it can stop showing "checking" state
  sendUpdateStatus('error', { message: error.message });
});

autoUpdater.on('download-progress', (progress) => {
  log.info('Download progress:', progress.percent);
  sendUpdateStatus('download-progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  sendUpdateStatus('update-downloaded', info);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/favicon.ico'),
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

app.whenReady().then(() => {
  createWindow();
  
  // Check for updates only in production (packaged app)
  if (process.env.NODE_ENV !== 'development' && app.isPackaged) {
    // Check for updates after app loads (wait 3 seconds)
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((error) => {
        // Error already logged and suppressed by emit override
        log.info('Update check completed with error (expected if no release exists)');
      });
    }, 3000);
    
    // Check for updates daily
    setInterval(() => {
      autoUpdater.checkForUpdates().catch((error) => {
        log.info('Periodic update check completed');
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
});

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
    icon: path.join(__dirname, '../public/favicon.ico'),
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

// System Tools IPC Handlers
const { dialog } = require('electron');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Disk Space Analyzer
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('analyze-disk-space', async (event, folderPath) => {
  const items = [];
  
  async function getSize(itemPath) {
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        const files = await fs.readdir(itemPath);
        let totalSize = 0;
        for (const file of files) {
          const size = await getSize(path.join(itemPath, file));
          totalSize += size;
        }
        return totalSize;
      }
      return stats.size;
    } catch (err) {
      return 0;
    }
  }

  try {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
      const itemPath = path.join(folderPath, file);
      const size = await getSize(itemPath);
      const stats = await fs.stat(itemPath);
      items.push({
        name: file,
        size,
        type: stats.isDirectory() ? 'Folder' : 'File'
      });
    }
    
    items.sort((a, b) => b.size - a.size);
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    
    return { items: items.slice(0, 50), totalSize };
  } catch (err) {
    throw new Error('Failed to analyze: ' + err.message);
  }
});

// Temp File Cleaner
ipcMain.handle('scan-temp-files', async (event, folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    const fileDetails = [];
    let totalSize = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          fileDetails.push({ name: file, size: stats.size, path: filePath });
          totalSize += stats.size;
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    }
    
    return { files: fileDetails, totalSize };
  } catch (err) {
    throw new Error('Failed to scan: ' + err.message);
  }
});

ipcMain.handle('clean-temp-files', async (event, folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    let deletedCount = 0;
    let freedSpace = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          await fs.unlink(filePath);
          deletedCount++;
          freedSpace += stats.size;
        }
      } catch (err) {
        // Skip files that can't be deleted
      }
    }
    
    return { deletedCount, freedSpace };
  } catch (err) {
    throw new Error('Failed to clean: ' + err.message);
  }
});

// File Locker
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('process-file', async (event, { filePath, password, mode }) => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const fileData = await fs.readFile(filePath);
    
    if (mode === 'encrypt') {
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = Buffer.concat([iv, cipher.update(fileData), cipher.final()]);
      const outputPath = filePath + '.locked';
      await fs.writeFile(outputPath, encrypted);
      return { outputPath };
    } else {
      const iv = fileData.slice(0, 16);
      const encryptedData = fileData.slice(16);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      const outputPath = filePath.replace('.locked', '');
      await fs.writeFile(outputPath, decrypted);
      return { outputPath };
    }
  } catch (err) {
    throw new Error(mode === 'decrypt' ? 'Wrong password or corrupted file' : err.message);
  }
});

// Startup Program Manager
ipcMain.handle('get-startup-programs', async () => {
  if (process.platform !== 'win32') {
    throw new Error('Only supported on Windows');
  }
  
  try {
    const regPath = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    const { stdout } = await execPromise(`reg query "${regPath}"`);
    
    const programs = [];
    const lines = stdout.split('\r\n').filter(line => line.trim() && !line.includes('HKEY'));
    
    for (const line of lines) {
      const match = line.match(/\s+(\S+)\s+REG_SZ\s+(.+)/);
      if (match) {
        programs.push({
          name: match[1],
          path: match[2].trim(),
          enabled: true
        });
      }
    }
    
    return programs;
  } catch (err) {
    return []; // Return empty if no startup programs
  }
});

ipcMain.handle('toggle-startup-program', async (event, { name, path, enabled }) => {
  if (process.platform !== 'win32') {
    throw new Error('Only supported on Windows');
  }
  
  try {
    const regPath = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    
    if (enabled) {
      await execPromise(`reg add "${regPath}" /v "${name}" /t REG_SZ /d "${path}" /f`);
    } else {
      await execPromise(`reg delete "${regPath}" /v "${name}" /f`);
    }
    
    return { success: true };
  } catch (err) {
    throw new Error('Failed to modify startup: ' + err.message);
  }
});

// Clipboard Manager
const { clipboard } = require('electron');
let clipboardMonitorInterval = null;
let lastClipboardText = '';

ipcMain.handle('toggle-clipboard-monitoring', async (event, enabled) => {
  if (enabled) {
    lastClipboardText = clipboard.readText();
    clipboardMonitorInterval = setInterval(() => {
      const currentText = clipboard.readText();
      if (currentText !== lastClipboardText && currentText.trim()) {
        lastClipboardText = currentText;
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('clipboard-changed', currentText);
        });
      }
    }, 500); // Check every 500ms
    return true;
  } else {
    if (clipboardMonitorInterval) {
      clearInterval(clipboardMonitorInterval);
      clipboardMonitorInterval = null;
    }
    return false;
  }
});

// ===== AUTO-UPDATER =====
// Manual check for updates
ipcMain.handle('check-for-updates', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (error) {
    return { error: error.message };
  }
});

// Download update
ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate();
});

// Install update
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

// System Info
ipcMain.handle('get-system-info', async () => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Get CPU usage
    const getCPUUsage = () => {
      const cpus = os.cpus();
      let totalIdle = 0, totalTick = 0;

      cpus.forEach(cpu => {
        for (let type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });

      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - ~~(100 * idle / total);
      return usage;
    };

    return {
      cpu: {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        speed: cpus[0]?.speed || 0,
        usage: getCPUUsage()
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100
      },
      platform: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime()
      }
    };
  } catch (error) {
    return { error: error.message };
  }
});

// Screen Recorder - Save Recording
ipcMain.handle('save-recording', async (event, { buffer, defaultName }) => {
  const { dialog } = require('electron');
  const fs = require('fs').promises;
  
  try {
    const result = await dialog.showSaveDialog({
      title: 'Save Recording',
      defaultPath: defaultName || 'screen-recording.webm',
      filters: [
        { name: 'Video Files', extensions: ['webm', 'mp4'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    // Write the buffer to the selected file
    await fs.writeFile(result.filePath, Buffer.from(buffer));
    
    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Auto-updater events are handled at the top of the file