import React, { useState } from 'react';
import { Key, Copy } from 'lucide-react';
import * as crypto from 'crypto-js';

function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});

  const generateHashes = () => {
    if (!input) {
      alert('Please enter text to hash');
      return;
    }

    setHashes({
      MD5: crypto.MD5(input).toString(),
      SHA1: crypto.SHA1(input).toString(),
      SHA256: crypto.SHA256(input).toString(),
      SHA512: crypto.SHA512(input).toString(),
      SHA3: crypto.SHA3(input).toString(),
    });
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    alert('Hash copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hash Generator</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Input Text</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32"
        />
        <button
          onClick={generateHashes}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Key size={20} />
          Generate Hashes
        </button>
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 flex-1 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Generated Hashes</h2>
          <div className="space-y-4">
            {Object.entries(hashes).map(([algorithm, hash]) => (
              <div key={algorithm} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{algorithm}</h3>
                  <button
                    onClick={() => copyHash(hash)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <code className="block p-3 bg-gray-100 rounded text-sm break-all font-mono">
                  {hash}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HashGenerator;
