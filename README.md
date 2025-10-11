<div align="center">

# 🛠️ Múra-2ools

**A clean, offline, multi-tool desktop application for everyday digital tasks**

[![Latest Release](https://img.shields.io/github/v/release/NinjaBeameR/2ools?style=for-the-badge&logo=github&color=blue)](https://github.com/NinjaBeameR/2ools/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/NinjaBeameR/2ools/total?style=for-the-badge&logo=github&color=green)](https://github.com/NinjaBeameR/2ools/releases)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[📥 Download Latest Release](https://github.com/NinjaBeameR/2ools/releases/latest/download/Múra-2ools-Setup-1.0.5.exe) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/NinjaBeameR/2ools/issues) • [✨ Request Feature](https://github.com/NinjaBeameR/2ools/issues)

</div>

---

## 📦 Installation

### Windows

1. Download the latest installer: [Múra-2ools Setup](https://github.com/NinjaBeameR/2ools/releases/latest)
2. Run the `.exe` file
3. Follow the installation wizard
4. Launch Múra-2ools from your desktop or start menu

> **Note**: Windows may show a security warning since the app is not code-signed. Click "More info" → "Run anyway" to proceed.

### Auto-Updates

The app will automatically check for updates and notify you when a new version is available. You can also manually check for updates in **Settings → Updates**.

---

## ✨ Features

### 🧮 General Tools
- **Calculator** - Standard and scientific calculations
- **Unit Converter** - Length, weight, temperature, and more
- **Password Generator** - Secure random password generation
- **Text Formatter** - Format and transform text
- **QR Code Generator** - Create QR codes instantly

### 📄 PDF & Image Tools
- **PDF Merger** - Combine multiple PDFs
- **PDF Splitter** - Extract pages from PDFs
- **PDF Compressor** - Reduce PDF file size
- **Image Converter** - Convert between formats
- **Image Resizer/Cropper** - Resize and crop images

### 📝 Productivity Tools
- **To-Do List** - Task management with persistence
- **Notes** - Quick note-taking
- **Pomodoro Timer** - Time management technique
- **Reminder & Alerts** - Set custom reminders
- **Daily Journal** - Daily entries and thoughts

### 🗂️ File & System Management
- **Duplicate File Finder** - Find and remove duplicates
- **File Organizer** - Auto-organize files by type
- **Temporary File Cleaner** - Clean system temp files
- **Disk Space Analyzer** - Visualize disk usage
- **Startup Program Manager** - Manage Windows startup apps

### 🔒 Security & Privacy
- **File Locker** - Encrypt files with AES-256
- **Clipboard Privacy Mode** - Secure clipboard management
- **Secure Notes** - Encrypted note storage
- **Clipboard Manager** - History and monitoring

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**NMD**
- Organization: Múra
- GitHub: [@NinjaBeameR](https://github.com/NinjaBeameR)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

Made with ❤️ by [NMD](https://github.com/NinjaBeameR)

</div>