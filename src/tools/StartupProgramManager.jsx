import React, { useState, useEffect } from 'react';
import { Power, RefreshCw, ToggleLeft, ToggleRight, Shield, AlertCircle, Loader } from 'lucide-react';

function StartupProgramManager() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStartupPrograms();
  }, []);

  const loadStartupPrograms = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await window.electron.getStartupPrograms();
      setPrograms(result);
    } catch (err) {
      setError('Failed to load startup programs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgram = async (program) => {
    setError('');
    setSuccess('');
    try {
      await window.electron.toggleStartupProgram({
        name: program.name,
        path: program.path,
        enabled: !program.enabled
      });
      setSuccess(`${program.name} ${!program.enabled ? 'enabled' : 'disabled'}`);
      await loadStartupPrograms();
    } catch (err) {
      setError('Failed to toggle program: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Startup Program Manager</h2>
        <button onClick={loadStartupPrograms} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Admin Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">Note:</p>
            <p>Some programs may require administrator privileges to modify. If changes don't apply, run the app as administrator.</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300">{success}</div>}

      {/* Programs List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : programs.length > 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Startup Programs ({programs.length})</h3>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {programs.map((program, idx) => (
              <div key={idx} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{program.name}</p>
                      {program.enabled && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded">
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{program.path}</p>
                  </div>
                  <button onClick={() => toggleProgram(program)}
                    className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      program.enabled
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                    }`}>
                    {program.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {program.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Power className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No startup programs found</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Tip:</p>
            <p>Disabling unnecessary startup programs can significantly improve boot time and system performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartupProgramManager;
