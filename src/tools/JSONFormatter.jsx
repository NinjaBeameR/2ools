import React, { useState } from 'react';
import { Code, Check, AlertCircle, Copy } from 'lucide-react';

function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(input);
      setError('');
      alert('✅ Valid JSON!');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">JSON Formatter</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          onClick={formatJSON}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Code size={20} />
          Format
        </button>
        <button
          onClick={minifyJSON}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Minify
        </button>
        <button
          onClick={validateJSON}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Check size={20} />
          Validate
        </button>

        <select
          value={indentSize}
          onChange={(e) => setIndentSize(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={2}>2 Spaces</option>
          <option value={4}>4 Spaces</option>
          <option value={8}>8 Spaces</option>
        </select>

        {output && (
          <button
            onClick={copyOutput}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-auto"
          >
            <Copy size={20} />
            Copy Output
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Input</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name":"John","age":30}'
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Output</h2>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="flex-1 p-4 border rounded-lg bg-gray-50 resize-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default JSONFormatter;
