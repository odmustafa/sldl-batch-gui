# sldl GUI

A graphical user interface for [sldl](https://github.com/fiso64/slsk-batchdl), a Soulseek batch downloader.

## Features

- **Downloads**: Enter Spotify playlists, YouTube URLs, or search queries to download music
- **Settings**: Configure Soulseek credentials, download paths, and search preferences
- **Profiles**: Save and load configuration profiles for different use cases
- **Console**: View real-time output from sldl
- **System**: Debug sldl path detection and manually set the executable path

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- The `sldl` executable (download from [releases](https://github.com/fiso64/slsk-batchdl/releases))

## Setup

1. Clone the repository and navigate to the sldl-gui directory:
   ```bash
   cd sldl-gui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure the `sldl` executable is accessible:
   - Place it in the same directory as the built app, OR
   - Add it to your system PATH, OR
   - Configure the path manually in the app's System settings

## Development

Run the app in development mode with hot reload:

```bash
npm run dev
```

This starts both the Vite dev server and Electron.

## Building

Build the production app:

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Bundle the frontend with Vite
3. Package the Electron app with electron-builder

The built app will be in the `release/` directory:
- **macOS**: `release/mac-arm64/sldl GUI.app` (or `mac-x64` for Intel)
- **Windows**: `release/win-unpacked/sldl GUI.exe`
- **Linux**: `release/linux-unpacked/sldl-gui`

## macOS Notes

### Unsigned Binary Warning

If you get a "killed" error when running sldl, you need to remove the quarantine flag and sign it:

```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine /path/to/sldl

# Ad-hoc sign the binary
codesign --force --deep -s - /path/to/sldl
```

### Port Conflicts

If you see "Failed to start listening on 0.0.0.0:49998", another Soulseek client or sldl process is using that port:

```bash
# Find the process
lsof -i :49998

# Kill it (replace PID with actual process ID)
kill <PID>
```

## Project Structure

```
sldl-gui/
├── electron/           # Electron main process
│   ├── main.ts         # Main process entry point
│   └── preload.ts      # Preload script for IPC
├── src/                # React frontend
│   ├── components/     # UI components
│   │   ├── features/   # Page components
│   │   ├── layout/     # Layout components
│   │   └── ui/         # Reusable UI primitives
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main React component
├── dist/               # Built frontend (generated)
├── dist-electron/      # Built Electron code (generated)
└── release/            # Packaged app (generated)
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Desktop**: Electron
- **Build Tools**: Vite, electron-builder
- **Icons**: Lucide React

## License

MIT

