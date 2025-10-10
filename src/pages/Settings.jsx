import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Info, RefreshCw, Download, CheckCircle, Loader, AlertCircle } from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('updates');
  const [updateState, setUpdateState] = useState({
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    upToDate: false,
    error: null,
    progress: 0,
    currentVersion: '1.0.0',
    latestVersion: '',
    releaseNotes: ''
  });

  const [preferences, setPreferences] = useState({
    autoCheck: localStorage.getItem('autoCheckUpdates') !== 'false',
    autoDownload: localStorage.getItem('autoDownload') === 'true',
    checkFrequency: localStorage.getItem('checkFrequency') || 'daily'
  });

  useEffect(() => {
    // Get current version from package.json
    setUpdateState(prev => ({ ...prev, currentVersion: '1.0.0' }));

    // Listen for update events
    if (window.electron?.onUpdateStatus) {
      window.electron.onUpdateStatus((data) => {
        const { status, data: info } = data;

        switch (status) {
          case 'checking-for-update':
            setUpdateState(prev => ({ ...prev, checking: true, error: null, upToDate: false }));
            break;

          case 'update-available':
            setUpdateState(prev => ({
              ...prev,
              checking: false,
              available: true,
              latestVersion: info.version,
              releaseNotes: info.releaseNotes || 'No release notes available'
            }));
            break;

          case 'update-not-available':
            setUpdateState(prev => ({ ...prev, checking: false, available: false, upToDate: true }));
            setTimeout(() => setUpdateState(prev => ({ ...prev, upToDate: false })), 5000);
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
              latestVersion: info.version
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
      setUpdateState(prev => ({ ...prev, checking: true, error: null, upToDate: false }));
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

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key === 'autoCheck' ? 'autoCheckUpdates' : key === 'autoDownload' ? 'autoDownload' : 'checkFrequency', value);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('updates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'updates'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              Updates
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Info className="w-5 h-5" />
              About
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">App Updates</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Current version: <span className="font-semibold">{updateState.currentVersion}</span>
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Check for Updates Button */}
                <div>
                  <button
                    onClick={checkForUpdates}
                    disabled={updateState.checking || updateState.downloading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {updateState.checking ? (
                      <><Loader className="w-5 h-5 animate-spin" />Checking...</>
                    ) : (
                      <><RefreshCw className="w-5 h-5" />Check for Updates</>
                    )}
                  </button>
                </div>

                {/* Update Status */}
                {updateState.upToDate && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100">You're up to date!</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">Running the latest version</p>
                    </div>
                  </div>
                )}

                {updateState.error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100">Update Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{updateState.error}</p>
                    </div>
                  </div>
                )}

                {updateState.available && !updateState.downloading && !updateState.downloaded && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Update Available!</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Version {updateState.latestVersion}</p>
                      </div>
                      <button
                        onClick={downloadUpdate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                      {updateState.releaseNotes}
                    </div>
                  </div>
                )}

                {updateState.downloading && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Downloading Update</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{updateState.progress}%</p>
                    </div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${updateState.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {updateState.downloaded && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="font-semibold text-emerald-900 dark:text-emerald-100">Update Downloaded!</p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">Ready to install version {updateState.latestVersion}</p>
                        </div>
                      </div>
                      <button
                        onClick={installUpdate}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                      >
                        Restart & Install
                      </button>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Update Preferences</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoCheck}
                        onChange={(e) => updatePreference('autoCheck', e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600"
                      />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">Automatically check for updates</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Check on app startup and periodically</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoDownload}
                        onChange={(e) => updatePreference('autoDownload', e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600"
                      />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">Download updates automatically</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Download in background when available</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">About Múra-2ools</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* App Info */}
                <div className="text-center pb-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                    <SettingsIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Múra-2ools</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Version {updateState.currentVersion}</p>
                </div>

                {/* Developer Info */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Developer</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">NMD</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Organization</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Múra</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-600 dark:text-zinc-400">License</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">MIT License</span>
                  </div>
                </div>

                {/* Credits */}
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Credits</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Built with React, Electron, and Tailwind CSS
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> This application is developed and maintained by a solo developer. 
                    While every effort has been made to ensure quality and reliability, users may encounter occasional bugs or issues. 
                    Your feedback and patience are greatly appreciated.
                  </p>
                </div>

                {/* Links */}
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex gap-4">
                    <a
                      href="https://github.com/NinjaBeameR/2ools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                    >
                      GitHub Repository
                    </a>
                    <a
                      href="https://github.com/NinjaBeameR/2ools/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Report Issue
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
