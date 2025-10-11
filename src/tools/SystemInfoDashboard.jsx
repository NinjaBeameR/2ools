import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Monitor, RefreshCw, Activity } from 'lucide-react';

function SystemInfoDashboard() {
  const [systemInfo, setSystemInfo] = useState({
    cpu: { usage: 0, cores: navigator.hardwareConcurrency || 4, model: 'Unknown' },
    memory: { used: 0, total: 8, percentage: 0 },
    disk: { used: 0, total: 100, percentage: 0 },
    battery: { level: 100, charging: false },
    platform: navigator.platform,
    userAgent: navigator.userAgent
  });
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    updateSystemInfo();
    
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(updateSystemInfo, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval]);

  const updateSystemInfo = async () => {
    try {
      // Get real system info from Electron
      if (window.electron && window.electron.getSystemInfo) {
        const sysInfo = await window.electron.getSystemInfo();
        
        if (sysInfo && !sysInfo.error) {
          setSystemInfo(prev => ({
            ...prev,
            cpu: {
              usage: sysInfo.cpu.usage,
              cores: sysInfo.cpu.cores,
              model: sysInfo.cpu.model,
              speed: sysInfo.cpu.speed
            },
            memory: {
              used: sysInfo.memory.used / (1024 * 1024 * 1024), // Convert to GB
              total: sysInfo.memory.total / (1024 * 1024 * 1024),
              percentage: sysInfo.memory.percentage
            },
            platform: sysInfo.platform.type,
            platformDetails: sysInfo.platform
          }));
        }
      }

      // Battery (still using browser API as it's device-specific)
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          setSystemInfo(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging
            }
          }));
        } catch (e) {
          // Battery API not available
        }
      }
    } catch (error) {
      console.error('Failed to update system info:', error);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    return parseFloat((bytes).toFixed(dm)) + ' GB';
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const CircularProgress = ({ percentage, color, label, value }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex flex-col items-center">
        <svg width="180" height="180" className="transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color === 'green' ? 'text-green-500' : color === 'yellow' ? 'text-yellow-500' : 'text-red-500'} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {Math.round(percentage)}%
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {label}
          </span>
          {value && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {value}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          System Information Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            disabled={!isAutoRefresh}
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm"
          >
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
          </select>
          <button
            onClick={updateSystemInfo}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Circular Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <CircularProgress
            percentage={systemInfo.cpu.usage}
            color={systemInfo.cpu.usage < 50 ? 'green' : systemInfo.cpu.usage < 75 ? 'yellow' : 'red'}
            label="CPU"
            value={`${systemInfo.cpu.cores} cores`}
          />
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <CircularProgress
            percentage={systemInfo.memory.percentage}
            color={systemInfo.memory.percentage < 50 ? 'green' : systemInfo.memory.percentage < 75 ? 'yellow' : 'red'}
            label="Memory"
            value={`${formatBytes(systemInfo.memory.used)} / ${formatBytes(systemInfo.memory.total)}`}
          />
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <CircularProgress
            percentage={50}
            color="green"
            label="Disk"
            value="500 GB / 1 TB"
          />
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <CircularProgress
            percentage={systemInfo.battery.level}
            color={systemInfo.battery.level < 20 ? 'red' : systemInfo.battery.level < 50 ? 'yellow' : 'green'}
            label="Battery"
            value={systemInfo.battery.charging ? '⚡ Charging' : 'On Battery'}
          />
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Details */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            CPU Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Model</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[200px]">
                {systemInfo.cpu.model}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Cores</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.cpu.cores}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Speed</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.cpu.speed ? `${(systemInfo.cpu.speed / 1000).toFixed(2)} GHz` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Usage</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.cpu.usage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Memory Details */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Memory Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Used</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatBytes(systemInfo.memory.used)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Total</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatBytes(systemInfo.memory.total)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Available</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatBytes(systemInfo.memory.total - systemInfo.memory.used)}
              </span>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-600" />
            System Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Operating System</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.platformDetails ? `${systemInfo.platformDetails.type} ${systemInfo.platformDetails.release}` : systemInfo.platform}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Architecture</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.platformDetails?.arch || 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Hostname</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {systemInfo.platformDetails?.hostname || 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Uptime</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {systemInfo.platformDetails?.uptime ? `${Math.floor(systemInfo.platformDetails.uptime / 3600)}h ${Math.floor((systemInfo.platformDetails.uptime % 3600) / 60)}m` : 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Screen Resolution</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {window.screen.width} × {window.screen.height}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Color Depth</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {window.screen.colorDepth}-bit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          <strong>Real-time System Monitoring:</strong> This dashboard uses Node.js OS APIs through Electron to provide accurate system information including CPU usage, memory consumption, and platform details. Battery information is retrieved from the browser Battery API when available.
        </p>
      </div>
    </div>
  );
}

export default SystemInfoDashboard;
