import React, { useState } from 'react';
import { Binary, Copy } from 'lucide-react';

function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (err) {
      alert('Error encoding: ' + err.message);
    }
  };

  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (err) {
      alert('Error decoding: Invalid Base64 string');
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      encode();
    } else {
      decode();
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Base64 Encoder/Decoder</h1>

      <div className="flex gap-4 mb-4">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded ${mode === 'encode' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded ${mode === 'decode' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
          >
            Decode
          </button>
        </div>

        <button
          onClick={handleProcess}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Binary size={20} />
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>

        {output && (
          <button
            onClick={copyOutput}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-auto"
          >
            <Copy size={20} />
            Copy
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Input</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Output</h2>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="flex-1 p-4 border rounded-lg bg-gray-50 resize-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default Base64Tool;
