import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, FileText } from 'lucide-react';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appNotes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('appNotes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
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
    if (confirm('Delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setIsEditing(false);
      }
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex gap-4">
      {/* Notes List */}
      <div className="w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">No notes yet</p>
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
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate mb-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-1">
                    {note.content || 'Empty note'}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(note.updatedAt)}
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
                placeholder="Note title"
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
              placeholder="Start writing..."
              className="flex-1 p-6 bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none disabled:cursor-default"
            />

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: {formatDate(notes.find(n => n.id === selectedNote)?.updatedAt)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
