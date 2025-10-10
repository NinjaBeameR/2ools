import React, { useState, useEffect } from 'react';
import { Lock, Save, Eye, EyeOff, Plus, Trash2, Edit2, Shield } from 'lucide-react';

function SecureNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const hashedPassword = localStorage.getItem('secureNotesPassword');
    if (!hashedPassword) {
      // No password set yet
      setIsUnlocked(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      const saved = localStorage.getItem('secureNotes');
      if (saved) {
        try {
          setNotes(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load notes');
        }
      }
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      localStorage.setItem('secureNotes', JSON.stringify(notes));
    }
  }, [notes, isUnlocked]);

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const setupPassword = () => {
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    const hashed = simpleHash(newPassword);
    localStorage.setItem('secureNotesPassword', hashed);
    setIsUnlocked(true);
    setNewPassword('');
    setConfirmPassword('');
  };

  const unlockNotes = () => {
    const saved = localStorage.getItem('secureNotesPassword');
    const hashed = simpleHash(masterPassword);
    
    if (hashed === saved) {
      setIsUnlocked(true);
      setMasterPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const lockNotes = () => {
    setIsUnlocked(false);
    setNotes([]);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setMasterPassword('');
  };

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Secure Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (selectedNote) {
      setNotes(notes.map(note =>
        note.id === selectedNote
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      ));
      setIsEditing(false);
    }
  };

  const deleteNote = (id) => {
    if (confirm('Delete this secure note?')) {
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  // Not unlocked - show login/setup screen
  if (!isUnlocked) {
    const hasPassword = localStorage.getItem('secureNotesPassword');
    
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Secure Notes</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {hasPassword ? 'Enter your password to unlock' : 'Create a password to secure your notes'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          {hasPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && unlockNotes()}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={unlockNotes}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                <Lock className="w-5 h-5" />
                Unlock Notes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Create Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-password"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="show-password" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Show password
                </label>
              </div>
              <button
                onClick={setupPassword}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                <Shield className="w-5 h-5" />
                Setup Secure Notes
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                ⚠️ Remember this password - there's no way to recover it!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unlocked - show notes interface
  return (
    <div className="h-full flex gap-4">
      {/* Notes List */}
      <div className="w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Secure Notes</h3>
          <button
            onClick={lockNotes}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="Lock notes"
          >
            <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <button
            onClick={createNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Secure Note
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">No secure notes yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote === note.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
                      : 'bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border-2 border-transparent'
                  }`}
                >
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate mb-1 flex items-center gap-2">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    {note.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isEditing}
                className="flex-1 text-xl font-semibold bg-transparent text-zinc-900 dark:text-zinc-100 border-none focus:outline-none disabled:cursor-default"
              />
              <div className="flex gap-2">
                {isEditing ? (
                  <button
                    onClick={saveNote}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteNote(selectedNote)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isEditing}
              placeholder="Your secure note content..."
              className="flex-1 p-6 bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none disabled:cursor-default"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">Select or create a secure note</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecureNotes;
