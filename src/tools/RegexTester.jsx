import React, { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';

function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches = [...testString.matchAll(regex)];
      setMatches(foundMatches);
      setError('');
    } catch (err) {
      setError(err.message);
      setMatches([]);
    }
  };

  const highlightMatches = () => {
    if (!pattern || matches.length === 0) return testString;

    try {
      const regex = new RegExp(pattern, flags);
      return testString.replace(regex, (match) => `<mark class="bg-yellow-300">${match}</mark>`);
    } catch {
      return testString;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Regex Tester</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regular Expression Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\d+|\w+|[A-Z]"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flags
            </label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g, i, m"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <button
          onClick={testRegex}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Search size={20} />
          Test Regex
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <div className="flex items-center gap-2">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!error && matches.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Found {matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Test String</h2>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Matches</h2>
          {matches.length > 0 ? (
            <div className="space-y-2">
              <div
                className="p-4 bg-gray-50 rounded border whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
              />
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Match Details:</h3>
                {matches.map((match, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 rounded mb-2">
                    <strong>Match {idx + 1}:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{match[0]}</code>
                    <span className="text-sm text-gray-600 ml-2">(Index: {match.index})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No matches found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegexTester;
