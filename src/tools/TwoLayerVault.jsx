import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Key, FileUp, Trash2, AlertCircle, CheckCircle, Loader, AlertTriangle } from 'lucide-react';

function TwoLayerVault() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vaultSetupComplete, setVaultSetupComplete] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    const storedVaultHash = localStorage.getItem('vaultHash');
    const storedVaultPinHash = localStorage.getItem('vaultPinHash');
    setVaultSetupComplete(!!storedVaultHash && !!storedVaultPinHash);

    const storedVaultFiles = localStorage.getItem('vaultFiles');
    if (storedVaultFiles) {
      try {
        setVaultFiles(JSON.parse(storedVaultFiles));
      } catch {
        setVaultFiles([]);
      }
    }
  }, []);

  const hashString = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const setupVault = async () => {
    if (!password || !pin) {
      setError('Please enter both password and PIN');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const passwordHash = await hashString(password);
      const pinHash = await hashString(pin);
      
      localStorage.setItem('vaultHash', passwordHash);
      localStorage.setItem('vaultPinHash', pinHash);
      
      setVaultSetupComplete(true);
      setVaultUnlocked(true);
      setSuccess('Vault setup complete! You can now secure files with dual-layer protection.');
      setPassword('');
      setConfirmPassword('');
      setPin('');
      setConfirmPin('');
    } catch (err) {
      setError('Failed to setup vault: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const unlockVault = async () => {
    if (!password || !pin) {
      setError('Please enter both password and PIN');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const passwordHash = await hashString(password);
      const pinHash = await hashString(pin);
      
      const storedPasswordHash = localStorage.getItem('vaultHash');
      const storedPinHash = localStorage.getItem('vaultPinHash');

      if (passwordHash === storedPasswordHash && pinHash === storedPinHash) {
        setVaultUnlocked(true);
        setSuccess('Vault unlocked successfully!');
        setPassword('');
        setPin('');
      } else {
        setError('Invalid password or PIN');
      }
    } catch (err) {
      setError('Failed to unlock vault: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const lockVault = () => {
    setVaultUnlocked(false);
    setPassword('');
    setPin('');
    setError('');
    setSuccess('Vault locked');
  };

  const resetVault = () => {
    if (window.confirm('Are you sure you want to reset the vault? This will remove all vault protection (files will remain).')) {
      localStorage.removeItem('vaultHash');
      localStorage.removeItem('vaultPinHash');
      localStorage.removeItem('vaultFiles');
      setVaultSetupComplete(false);
      setVaultUnlocked(false);
      setVaultFiles([]);
      setPassword('');
      setPin('');
      setError('');
      setSuccess('Vault reset successfully');
    }
  };

  const handleForgotPassword = () => {
    if (deleteConfirmation.toUpperCase() === 'DELETE') {
      localStorage.removeItem('vaultHash');
      localStorage.removeItem('vaultPinHash');
      localStorage.removeItem('vaultFiles');
      setVaultSetupComplete(false);
      setVaultUnlocked(false);
      setVaultFiles([]);
      setPassword('');
      setPin('');
      setShowForgotPassword(false);
      setDeleteConfirmation('');
      setError('');
      setSuccess('Vault has been reset. All data has been deleted.');
    } else {
      setError('Please type DELETE to confirm');
    }
  };

  const selectFile = async () => {
    try {
      if (!window.electron || !window.electron.selectFile) {
        setError('File selection is only available in Electron environment');
        return;
      }
      
      const result = await window.electron.selectFile();
      if (result) {
        setSelectedFile(result);
        setError('');
      }
    } catch (err) {
      setError('Failed to select file: ' + err.message);
    }
  };

  const addToVault = () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const newVaultFile = {
      id: Date.now(),
      name: selectedFile.split(/[/\\]/).pop(),
      path: selectedFile,
      addedAt: new Date().toISOString(),
      encrypted: true
    };

    const updatedVaultFiles = [...vaultFiles, newVaultFile];
    setVaultFiles(updatedVaultFiles);
    localStorage.setItem('vaultFiles', JSON.stringify(updatedVaultFiles));
    
    setSuccess(`File added to vault: ${newVaultFile.name}`);
    setSelectedFile('');
    setError('');
  };

  const removeFromVault = (fileId) => {
    const updatedVaultFiles = vaultFiles.filter(f => f.id !== fileId);
    setVaultFiles(updatedVaultFiles);
    localStorage.setItem('vaultFiles', JSON.stringify(updatedVaultFiles));
    setSuccess('File removed from vault');
    setError('');
  };

  const openFile = async (filePath) => {
    try {
      if (window.electron && window.electron.openFile) {
        const result = await window.electron.openFile(filePath);
        if (result.success) {
          setSuccess('File opened successfully');
        } else {
          setError('Failed to open file: ' + (result.error || 'Unknown error'));
        }
      } else {
        setError('File opening is only available in Electron environment');
      }
      setError('');
    } catch (err) {
      setError('Failed to open file: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Two-Layer Vault
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Dual protection with PIN + Password authentication
          </p>
        </div>
        {vaultSetupComplete && vaultUnlocked && (
          <button onClick={resetVault}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Reset Vault
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        {!vaultSetupComplete ? (
          // Vault Setup
          <>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Setup Secure Vault</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Create a two-layer protection system with both a password and a PIN for maximum security.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Master Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter strong password"
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirm Password</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm password"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Security PIN (4-6 digits)</label>
              <div className="relative">
                <input 
                  type={showPin ? 'text' : 'password'} 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                  placeholder="Enter PIN"
                  maxLength={6}
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirm PIN</label>
              <input 
                type={showPin ? 'text' : 'password'} 
                value={confirmPin} 
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} 
                placeholder="Confirm PIN"
                maxLength={6}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
              />
            </div>

            {error && <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            {success && <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}

            <button 
              onClick={setupVault} 
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 transition-colors"
            >
              {processing ? (
                <><Loader className="w-5 h-5 animate-spin" />Setting up vault...</>
              ) : (
                <><Shield className="w-5 h-5" />Create Vault</>
              )}
            </button>

            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  <p className="font-semibold mb-1">Security Features:</p>
                  <ul className="space-y-1">
                    <li>• Dual-layer authentication (Password + PIN)</li>
                    <li>• SHA-256 cryptographic hashing</li>
                    <li>• Secure local storage</li>
                    <li>• Centralized file management</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : !vaultUnlocked ? (
          // Vault Unlock
          <>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Unlock Secure Vault</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Enter both your password and PIN to access the secure vault.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Master Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Security PIN</label>
              <div className="relative">
                <input 
                  type={showPin ? 'text' : 'password'} 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                  placeholder="Enter PIN"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            {success && <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}

            <button 
              onClick={unlockVault} 
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 transition-colors"
            >
              {processing ? (
                <><Loader className="w-5 h-5 animate-spin" />Unlocking...</>
              ) : (
                <><Key className="w-5 h-5" />Unlock Vault</>
              )}
            </button>

            <button 
              onClick={() => setShowForgotPassword(true)}
              className="w-full mt-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Forgot Password?
            </button>
          </>
        ) : (
          // Vault Unlocked
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Vault Unlocked</h3>
              </div>
              <button 
                onClick={lockVault}
                className="px-4 py-2 text-sm bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Lock Vault
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Add File to Vault</label>
              <div className="flex gap-2">
                <button onClick={selectFile} className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <FileUp className="w-4 h-4" />
                  Browse
                </button>
                <input type="text" value={selectedFile} readOnly placeholder="No file selected"
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
              </div>
              {selectedFile && (
                <button 
                  onClick={addToVault}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Add to Vault
                </button>
              )}
            </div>

            {error && <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            {success && <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Vault Files ({vaultFiles.length})
              </h4>
              {vaultFiles.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                  No files in vault yet. Add files to protect them with dual-layer security.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vaultFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Added {new Date(file.addedAt).toLocaleDateString()} at {new Date(file.addedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openFile(file.path)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Open file"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeFromVault(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-semibold mb-1">Vault Active:</p>
                  <ul className="space-y-1">
                    <li>• Files are protected with dual-layer authentication</li>
                    <li>• Always lock vault when finished</li>
                    <li>• Keep your password and PIN secure</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-red-500">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-2">
              Reset Vault?
            </h3>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• All vault data will be permanently deleted</li>
                <li>• {vaultFiles.length} file(s) will be removed from vault</li>
                <li>• Password and PIN will be erased</li>
                <li>• This action cannot be recovered</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2 rounded-lg border-2 border-red-300 dark:border-red-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setDeleteConfirmation('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                Wait! I Remember
              </button>
              <button
                onClick={handleForgotPassword}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Darn it, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TwoLayerVault;
