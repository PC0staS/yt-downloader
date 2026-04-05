# YouTube Video Downloader

A lightweight, cross-platform desktop application to download videos and audio from YouTube. Built with Go and React, featuring a modern GUI and real-time download tracking.

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

✨ **Core Features:**

- 🎬 Download YouTube videos in various quality options
- 🎵 Extract audio-only (MP3) from videos
- 📁 Choose custom download location
- 🔄 Real-time download progress tracking
- 🎨 Modern, intuitive graphical interface
- ⚡ Fast and lightweight

**Technical:**

- Cross-platform support (Windows, macOS, Linux)
- Built with Go backend and React frontend
- Automatic yt-dlp installation on first run
- Progress events with real-time updates

## System Requirements

### Minimum Requirements

- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 512 MB
- **Disk Space:** 100 MB for the application + space for downloads
- **Internet:** Required for downloading videos

### Optional Dependencies

- **FFmpeg:** Required for audio extraction (installed automatically by yt-dlp)

## Installation

### Windows

1. Download the latest `youtube-downloader.exe` from [Releases](../../releases)
2. Double-click the executable
3. The app will launch automatically
4. On first run, yt-dlp will be installed automatically

### macOS

1. Download the latest `youtube-downloader-amd64.zip` (Intel) or `youtube-downloader-arm64.zip` (Apple Silicon)
2. Extract the ZIP file
3. Drag `youtube-downloader.app` to your Applications folder
4. Launch from Applications or Spotlight
5. You may need to allow the app in Security & Privacy settings (System Preferences)

### Linux

1. Download the latest `youtube-downloader` binary from [Releases](../../releases)
2. Open a terminal and navigate to the downloaded file
3. Make it executable:
   ```bash
   chmod +x youtube-downloader
   ```
4. Run the application:
   ```bash
   ./youtube-downloader
   ```
5. On first run, yt-dlp will be installed automatically

## Usage

### Basic Download

1. **Open the Application** - Launch the YouTube Video Downloader
2. **Paste YouTube URL** - Paste or type a YouTube video URL in the input field
3. **Choose Options:**
   - **Audio Only** - Toggle to extract audio only (MP3 format)
   - **Quality** - Select video quality (if downloading video, not audio)
   - **Download Path** - Specify where to save (optional - defaults to home folder)
4. **Download** - Click the "Download" button
5. **Track Progress** - Watch real-time progress updates

### Tips

- **Valid URLs:** Both `youtube.com` and `youtu.be` formats are supported
- **Quality Options:** Higher quality requires more download time and disk space
- **Audio-Only:** Automatically uses best available audio quality
- **Default Location:** If no path is specified, videos save to `~/Downloads/YouTubeDownloads` or next to the executable

## Build from Source

### Prerequisites

- **Go** 1.21 or higher
- **Node.js** 18+ and **npm** or **bun**
- **Wails** CLI
- Platform-specific build tools:
  - **Windows:** MSVC or MinGW
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, build-essential

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PC0staS/yt-downloader.git
   cd yt-downloader
   ```

2. **Install Wails:**

   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0
   ```

3. **Install dependencies:**

   ```bash
   go mod download
   cd frontend && npm install && cd ..
   ```

   (or use `bun install` instead of `npm install`)

4. **Build the application:**

   ```bash
   wails build
   ```

   The compiled binary will be in `build/bin/`

5. **Development mode (with hot reload):**
   ```bash
   wails dev
   ```

### Build for Specific Platforms

```bash
# Windows
wails build -platform windows/amd64

# macOS arm64 (Apple Silicon)
wails build -platform darwin/arm64

# macOS amd64 (Intel)
wails build -platform darwin/amd64

# Linux amd64
wails build -platform linux/amd64
```

## Troubleshooting

### "yt-dlp not found" Error

- The app will attempt to install yt-dlp automatically on first run
- If installation fails, ensure you have internet connectivity
- On Linux, you may need to install FFmpeg: `sudo apt-get install ffmpeg`

### Download Fails with Invalid URL

- Ensure you're using a valid YouTube URL
- Try pasting the full URL: `https://www.youtube.com/watch?v=VIDEO_ID`

### Permission Denied (Linux)

- Make sure the file is executable: `chmod +x youtube-downloader`

### macOS Security Warning

- Right-click the app and select "Open" to bypass Gatekeeper on first run
- Or add exception in System Preferences → Security & Privacy

## Project Structure

```
├── main.go          # Application entry point
├── app.go           # Backend logic and yt-dlp integration
├── go.mod           # Go dependencies
├── frontend/        # React UI
│   ├── src/
│   │   ├── App.jsx  # Main React component
│   │   └── style.css
│   ├── package.json
│   └── vite.config.js
└── build/           # Build output (generated)
```

## Technology Stack

- **Backend:** Go 1.21
- **Frontend:** React 18 + Vite
- **GUI Framework:** Wails v2
- **Video Download:** yt-dlp (go-ytdlp wrapper)
- **Styling:** Tailwind CSS

## Development

### Making Changes

1. **Backend changes:** Edit `app.go` or `main.go`, changes reload automatically in dev mode
2. **Frontend changes:** Edit files in `frontend/src/`, Vite provides hot module replacement
3. **Rebuild:** Run `wails build` for production binary

### Debugging

Run in development mode:

```bash
wails dev
```

This starts both the frontend dev server and Go backend with debugging capabilities.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The video downloader engine
- [Wails](https://wails.io) - Go desktop application framework
- [React](https://reactjs.org) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

## Support

If you encounter any issues or have feature requests, please open an [Issue](../../issues) on GitHub.

---

**Made with ❤️ by [PC0staS](https://github.com/PC0staS)**
