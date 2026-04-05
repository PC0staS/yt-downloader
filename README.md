# YouTube Downloader

A fast, lightweight desktop application for downloading YouTube videos with multiple quality options and audio extraction. Built with Wails (Go backend) and React frontend.

## Features

- 🚀 **Fast Downloads** - Optimized format selection to avoid unnecessary re-encoding
- 🎬 **Multiple Quality Options** - Choose between Best, 1080p, or 4K (2160p)
- 🎵 **Audio Extraction** - Extract audio as MP3 in one click
- 📊 **Real-time Progress** - Visual progress bar with meaningful status messages
- 🎨 **Dark Theme** - Professional dark UI with turquoise accent colors
- 💾 **Custom Save Location** - Choose where to save downloaded files
- 🖥️ **Cross-Platform** - Works on Windows, macOS (Intel & Apple Silicon), and Linux

## System Requirements

- **Windows:** Windows 10 or later
- **macOS:** macOS 10.13 or later
- **Linux:** GTK 3.0+ and WebKit2GTK 4.1+

## Installation

### Pre-built Binaries

Download the latest release for your platform:

- **Windows**: `youtube-downloader.exe`
- **macOS (Apple Silicon)**: `youtube-downloader-arm64.zip`
- **macOS (Intel)**: `youtube-downloader-amd64.zip`
- **Linux (x86_64)**: `youtube-downloader`
- **Linux (ARM64)**: `youtube-downloader-arm64`

Releases are available at: [GitHub Releases](https://github.com/PC0staS/yt-downloader/releases)

### Linux Users

Install dependencies before running:

**Ubuntu/Debian:**

```bash
sudo apt-get install libgtk-3-0 libwebkit2gtk-4.1-0
```

**Fedora:**

```bash
sudo dnf install gtk3 webkitgtk4.1
```

**Arch:**

```bash
sudo pacman -S gtk3 webkit2gtk
```

## Usage

1. **Launch** the application
2. **Paste** a YouTube URL in the URL field
3. **Choose** quality (Best, 1080p, or 4K)
4. **Optional:** Toggle "Audio Only (MP3)" to extract audio
5. **Set** a custom save location or leave empty for app folder
6. **Click** "Download" and wait for completion

The app shows real-time progress with meaningful status messages:

- **Downloading video...** - Fetching content from YouTube
- **Encoding to MP4...** - Converting to MP4 (if needed)
- **Processing...** - Finalizing the download

## Building from Source

### Prerequisites

- **Go** 1.21 or later
- **Node.js** 18+ with Bun
- **Wails CLI** v2.12.0

On Linux, also install:

```bash
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev
```

### Build Steps

1. Clone the repository:

```bash
git clone https://github.com/PC0staS/yt-downloader.git
cd yt-downloader
```

2. Install Wails:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0
```

3. Build frontend dependencies:

```bash
cd frontend
bun install
bun run build
cd ..
```

4. Build the application:

**For your current platform:**

```bash
wails build
```

**For specific platforms:**

```bash
# Linux
wails build -platform linux/amd64
wails build -platform linux/arm64

# macOS
wails build -platform darwin/arm64    # Apple Silicon
wails build -platform darwin/amd64    # Intel

# Windows
wails build -platform windows/amd64
```

The built application will be in the `build/bin/` directory.

## Development

To run in development mode with hot-reload:

```bash
wails dev
```

This starts a development server with the app window and live reloading.

## Architecture

- **Backend:** Go with Wails framework
- **Frontend:** React 18 with Tailwind CSS
- **Downloader:** go-ytdlp (yt-dlp wrapper)
- **IPC:** Wails events for real-time updates

The backend handles all download logic and emits progress events to the frontend, which updates the UI in real-time.

## Performance Optimizations

- **Direct MP4 Downloads** - Selects MP4 format when available to avoid re-encoding
- **Smart Progress Simulation** - Realistic progress based on download phases
- **Async Operations** - Non-blocking goroutines for UI responsiveness
- **Smart Format Selection** - Prioritizes high-quality native formats

## Troubleshooting

### "Video not found"

- Verify the URL is a valid YouTube link
- Check if the video is public and available in your region

### Slow encoding

- This is normal for video conversion (MP4 re-encoding can be slow)
- The progress reaches 60-95% quickly for downloads, then slows for encoding
- Audio-only downloads are much faster

### Linux dependencies not found

- Ensure you've installed all required GTK and WebKit libraries (see Installation section)

## License

MIT License - see LICENSE file for details

## Credits

- Built with [Wails](https://wails.io/)
- Uses [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- Go wrapper: [go-ytdlp](https://github.com/lrstanley/go-ytdlp)

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

For questions or support, visit the [GitHub Issues](https://github.com/PC0staS/yt-downloader/issues) page.

---

Made by [Pablo Costas](https://github.com/PC0staS) | [pablocostas.dev](https://pablocostas.dev)
