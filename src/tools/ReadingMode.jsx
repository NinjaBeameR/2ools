import React, { useState, useRef, useEffect } from 'react';
import { Type, ZoomIn, ZoomOut, Highlighter, BookOpen, FileText, Save } from 'lucide-react';

function ReadingMode() {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState(1.8);
  const [maxWidth, setMaxWidth] = useState(700);
  const [theme, setTheme] = useState('light');
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    // Load saved reading
    const saved = localStorage.getItem('readingModeContent');
    if (saved) {
      const data = JSON.parse(saved);
      setContent(data.content || '');
      setHighlights(data.highlights || []);
      setNotes(data.notes || []);
    }
  }, []);

  const saveReading = () => {
    const data = {
      content,
      highlights,
      notes,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('readingModeContent', JSON.stringify(data));
    alert('Reading session saved!');
  };

  const loadSampleText = () => {
    setContent(`The Art of Focused Reading

In our modern world of constant distractions, the ability to engage in deep, focused reading has become increasingly rare yet more valuable than ever. Reading mode provides an escape from notifications, advertisements, and the endless scroll of social media.

Benefits of Distraction-Free Reading:

1. Enhanced Comprehension
When you read without interruptions, your brain can form deeper connections with the material. You're more likely to remember what you've read and understand complex concepts.

2. Improved Focus
Regular practice of focused reading strengthens your attention span. Like a muscle, the more you exercise your ability to concentrate, the stronger it becomes.

3. Stress Reduction
Immersing yourself in a good text can be meditative. The rhythm of reading allows your mind to relax while staying engaged, reducing anxiety and stress.

4. Better Retention
Without distractions pulling you away, you can take time to reflect on what you're reading, making mental notes and connections that improve long-term retention.

Tips for Effective Reading:

• Choose the Right Environment: Find a quiet space where you won't be interrupted.
• Set a Time Limit: Start with manageable chunks of time and gradually increase.
• Take Notes: Jot down thoughts and insights as they come to you.
• Highlight Key Passages: Mark important sections for future reference.
• Take Breaks: Your brain needs time to process information. Short breaks can actually improve comprehension.

Remember, reading is not a race. The goal is understanding and enjoyment, not speed. Take your time, savor the words, and let yourself fully engage with the text.

Happy reading!`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      const highlight = {
        id: Date.now(),
        text: selectedText,
        timestamp: new Date().toISOString()
      };
      setHighlights([...highlights, highlight]);
    }
  };

  const addNote = () => {
    if (!currentNote.trim()) return;

    const note = {
      id: Date.now(),
      text: currentNote,
      timestamp: new Date().toISOString()
    };
    setNotes([...notes, note]);
    setCurrentNote('');
    setShowNoteInput(false);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const deleteHighlight = (id) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-zinc-900',
      border: 'border-zinc-200'
    },
    sepia: {
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      border: 'border-amber-200'
    },
    dark: {
      bg: 'bg-zinc-900',
      text: 'text-zinc-100',
      border: 'border-zinc-700'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="h-full flex flex-col bg-zinc-100 dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Decrease font size"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Increase font size"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm"
          >
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="monospace">Monospace</option>
            <option value="Georgia">Georgia</option>
            <option value="'Times New Roman'">Times New Roman</option>
          </select>

          <div className="flex gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-2 rounded text-sm ${theme === 'light' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'}`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`px-3 py-2 rounded text-sm ${theme === 'sepia' ? 'bg-amber-900 text-white' : 'bg-amber-200 text-amber-900'}`}
            >
              Sepia
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-2 rounded text-sm ${theme === 'dark' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-700 text-zinc-100'}`}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Load File
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={loadSampleText}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Sample
          </button>
          <button
            onClick={saveReading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Reading Area */}
        <div className={`flex-1 overflow-y-auto ${currentTheme.bg} transition-colors`}>
          <div
            className="min-h-full py-12 px-8"
            style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}
          >
            {content ? (
              <div
                ref={contentRef}
                className={`${currentTheme.text} transition-colors leading-relaxed`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  lineHeight: lineHeight
                }}
                onMouseUp={handleTextSelection}
              >
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No content loaded</p>
                <p className="text-sm">Load a text file or use the sample text to begin reading</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
                    Line Height: {lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
                    Max Width: {maxWidth}px
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="1000"
                    step="50"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-yellow-600" />
                Highlights ({highlights.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {highlights.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Select text to highlight
                  </p>
                ) : (
                  highlights.map(highlight => (
                    <div
                      key={highlight.id}
                      className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm border border-yellow-200 dark:border-yellow-800 group"
                    >
                      <p className="text-zinc-900 dark:text-zinc-100 italic">
                        "{highlight.text}"
                      </p>
                      <button
                        onClick={() => deleteHighlight(highlight.id)}
                        className="text-xs text-red-600 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notes ({notes.length})
                </h3>
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  + Add
                </button>
              </div>

              {showNoteInput && (
                <div className="mb-3">
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Write your note..."
                    className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm resize-none"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={addNote}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setCurrentNote('');
                      }}
                      className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No notes yet
                  </p>
                ) : (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 group"
                    >
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {note.text}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-xs text-red-600 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadingMode;
