import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import * as Diff from 'diff';

function DiffChecker() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState([]);

  const compare = () => {
    const differences = Diff.diffLines(text1, text2);
    setDiff(differences);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Diff Checker</h1>

      <button
        onClick={compare}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6 self-start"
      >
        <GitCompare size={20} />
        Compare
      </button>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Original Text</h2>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter original text..."
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Modified Text</h2>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter modified text..."
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Differences</h2>
          {diff.length > 0 ? (
            <div className="space-y-1 font-mono text-sm">
              {diff.map((part, idx) => (
                <div
                  key={idx}
                  className={`p-2 ${
                    part.added ? 'bg-green-100 text-green-800' :
                    part.removed ? 'bg-red-100 text-red-800' :
                    'bg-gray-50'
                  }`}
                >
                  {part.added && <span className="font-bold">+ </span>}
                  {part.removed && <span className="font-bold">- </span>}
                  {part.value}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Click "Compare" to see differences</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiffChecker;
