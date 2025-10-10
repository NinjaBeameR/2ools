# Múra-2ools

A clean, offline, multi-tool software that helps users perform everyday digital tasks.

## Features

- Calculator
- Unit Converter
- Clipboard Manager
- PDF Merger, Splitter, Compressor
- To-Do List
- Notes
- File Organizer
- Duplicate File Finder
- File Cleaner
- Password Generator
- File Locker

## Tech Stack

- Electron.js (desktop shell)
- React + Vite (frontend)
- Tailwind CSS (styling)
- Zustand (state management)
- LowDB (local data)
- Lucide-react (icons)

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run electron-dev
```

This will start the Vite dev server and launch the Electron app.

### Build

```bash
npm run build
npm run electron
```

### Package

```bash
npm run dist
```

## Project Structure

```
/
├── app/
│   ├── main.js        # Electron main process
│   └── preload.js     # Preload script
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── tools/         # Tool components
│   ├── store/         # Zustand store
│   ├── App.jsx        # Main App component
│   ├── index.jsx      # React entry point
│   └── index.css      # Tailwind CSS
├── public/            # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## License

MIT