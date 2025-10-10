import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle, Minimize2, X, RefreshCw } from 'lucide-react';

function UpdateDialog() {
  const [updateState, setUpdateState] = useState({
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: null,
    progress: 0,
    version: '',
    releaseNotes: '',
    minimized: false
  });

  useEffect(() => {
    if (window.electron?.onUpdateStatus) {
      window.electron.onUpdateStatus((data) => {
        const { status, data: info } = data;

        switch (status) {
          case 'checking-for-update':
            setUpdateState(prev => ({ ...prev, checking: true, error: null }));
            break;

          case 'update-available':
            setUpdateState(prev => ({
              ...prev,
              checking: false,
              available: true,
              version: info.version,
              releaseNotes: info.releaseNotes || 'No release notes available'
            }));
            break;

          case 'update-not-available':
            setUpdateState(prev => ({ ...prev, checking: false, available: false }));
            setTimeout(() => setUpdateState(prev => ({ ...prev, checking: false })), 3000);
            break;

          case 'download-progress':
            setUpdateState(prev => ({
              ...prev,
              downloading: true,
              progress: Math.round(info.percent)
            }));
            break;

          case 'update-downloaded':
            setUpdateState(prev => ({
              ...prev,
              downloading: false,
              downloaded: true,
              version: info.version
            }));
            break;

          case 'error':
            setUpdateState(prev => ({
              ...prev,
              checking: false,
              downloading: false,
              error: info.message
            }));
            break;
        }
      });
    }
  }, []);

  const checkForUpdates = async () => {
    if (window.electron?.checkForUpdates) {
      setUpdateState(prev => ({ ...prev, checking: true, error: null }));
      await window.electron.checkForUpdates();
    }
  };

  const downloadUpdate = () => {
    if (window.electron?.downloadUpdate) {
      window.electron.downloadUpdate();
    }
  };

  const installUpdate = () => {
    if (window.electron?.installUpdate) {
      window.electron.installUpdate();
    }
  };

  const minimize = () => {
    setUpdateState(prev => ({ ...prev, minimized: true }));
  };

  const close = () => {
    setUpdateState({
      checking: false,
      available: false,
      downloading: false,
      downloaded: false,
      error: null,
      progress: 0,
      version: '',
      releaseNotes: '',
      minimized: false
    });
  };

  // Minimized notification
  if (updateState.minimized && (updateState.downloading || updateState.downloaded)) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 z-50">
        <div className="flex items-center gap-3">
          {updateState.downloading && (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Downloading update...</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{updateState.progress}%</p>
              </div>
            </>
          )}
          {updateState.downloaded && (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Update ready!</p>
                <button
                  onClick={() => setUpdateState(prev => ({ ...prev, minimized: false }))}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Install now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Full dialogs
  if (updateState.checking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Checking for Updates</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (updateState.available && !updateState.downloading && !updateState.downloaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Update Available!</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Version {updateState.version}</p>
            </div>
            <button onClick={close} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
              {updateState.releaseNotes}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadUpdate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Download className="w-5 h-5" />
              Download Update
            </button>
            <button
              onClick={close}
              className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (updateState.downloading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Downloading Update</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{updateState.progress}% complete</p>
            </div>
            <button onClick={minimize} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${updateState.progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
            You can minimize this and continue working
          </p>
        </div>
      </div>
    );
  }

  if (updateState.downloaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Update Ready!</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Version {updateState.version} has been downloaded and is ready to install.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={installUpdate}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              Restart & Install
            </button>
            <button
              onClick={close}
              className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (updateState.error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Update Error</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{updateState.error}</p>
            <button
              onClick={close}
              className="px-6 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default UpdateDialog;
