import React, { useState } from 'react';
import { Search, Server, CheckCircle, XCircle, Loader } from 'lucide-react';

function PortScanner() {
  const [target, setTarget] = useState('');
  const [startPort, setStartPort] = useState(1);
  const [endPort, setEndPort] = useState(1000);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const commonPorts = [
    { port: 21, service: 'FTP' },
    { port: 22, service: 'SSH' },
    { port: 23, service: 'Telnet' },
    { port: 25, service: 'SMTP' },
    { port: 53, service: 'DNS' },
    { port: 80, service: 'HTTP' },
    { port: 110, service: 'POP3' },
    { port: 143, service: 'IMAP' },
    { port: 443, service: 'HTTPS' },
    { port: 3306, service: 'MySQL' },
    { port: 5432, service: 'PostgreSQL' },
    { port: 8080, service: 'HTTP-Alt' },
  ];

  const scanCommonPorts = () => {
    setStartPort(commonPorts[0].port);
    setEndPort(commonPorts[commonPorts.length - 1].port);
  };

  const scanPort = async (host, port) => {
    return new Promise((resolve) => {
      const timeout = 2000;
      const img = new Image();
      
      const timer = setTimeout(() => {
        resolve({ port, open: false });
      }, timeout);

      img.onerror = () => {
        clearTimeout(timer);
        resolve({ port, open: true });
      };

      img.onload = () => {
        clearTimeout(timer);
        resolve({ port, open: true });
      };

      img.src = `http://${host}:${port}`;
    });
  };

  const startScan = async () => {
    if (!target) {
      alert('Please enter a target hostname or IP address');
      return;
    }

    if (startPort > endPort) {
      alert('Start port must be less than or equal to end port');
      return;
    }

    if (endPort - startPort > 1000) {
      alert('Please scan a maximum of 1000 ports at a time');
      return;
    }

    setScanning(true);
    setResults([]);
    setProgress(0);

    const totalPorts = endPort - startPort + 1;
    const openPorts = [];

    for (let port = startPort; port <= endPort; port++) {
      const result = await scanPort(target, port);
      
      if (result.open) {
        const service = commonPorts.find(p => p.port === port)?.service || 'Unknown';
        openPorts.push({ ...result, service });
      }

      setProgress(Math.round(((port - startPort + 1) / totalPorts) * 100));
      setResults([...openPorts]);
    }

    setScanning(false);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Port Scanner</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> Browser-based port scanning has limitations. Only HTTP/HTTPS services
          may be detected. For comprehensive scanning, use professional tools like Nmap.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Server size={24} />
          Scan Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target (IP or Domain)
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="localhost or 127.0.0.1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={scanning}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Port
              </label>
              <input
                type="number"
                value={startPort}
                onChange={(e) => setStartPort(Number(e.target.value))}
                min="1"
                max="65535"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={scanning}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Port
              </label>
              <input
                type="number"
                value={endPort}
                onChange={(e) => setEndPort(Number(e.target.value))}
                min="1"
                max="65535"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={scanning}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={startScan}
            disabled={scanning}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {scanning ? (
              <>
                <Loader size={20} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search size={20} />
                Start Scan
              </>
            )}
          </button>

          <button
            onClick={scanCommonPorts}
            disabled={scanning}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            Scan Common Ports
          </button>
        </div>

        {scanning && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Scan Results</h2>

        {results.length === 0 && !scanning && (
          <div className="text-center text-gray-400 py-12">
            <Server size={64} className="mx-auto mb-4 opacity-30" />
            <p>No scan results yet</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-4">
              Found {results.length} open port{results.length !== 1 ? 's' : ''}
            </p>

            <div className="grid gap-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <span className="font-semibold">Port {result.port}</span>
                      <span className="text-gray-600 ml-2">- {result.service}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    OPEN
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortScanner;
