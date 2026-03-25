# sldl GUI

Developer and packaging guide for the Electron app inside the `sldl-batch-gui` repository.

## Purpose

The GUI wraps the .NET `sldl` backend in a desktop workflow for playlist/search downloads, saved settings, live console output, and executable-path management.

This build intentionally enforces a locked download policy:

- format: `mp3`
- bitrate: `319-321 kbps`
- strict metadata filtering: always on

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/)
- a compiled `sldl` executable available locally
- [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0) if you want to build the backend from source in this repo

## Build the backend locally

From the repository root:

```bash
dotnet build slsk-batchdl/slsk-batchdl.csproj
```

Typical output:

- macOS/Linux: `slsk-batchdl/bin/Debug/net6.0/sldl`
- Windows: `slsk-batchdl/bin/Debug/net6.0/sldl.exe`

## Install GUI dependencies

From `sldl-gui/`:

```bash
npm install
```

## Development workflows

### Full Electron development

Use this for normal app work:

```bash
npm run electron:dev
```

This starts the Vite dev server and launches Electron after the renderer is available.

### Renderer-only development

```bash
npm run dev
```

This only starts Vite. It is useful for UI iteration, but it does not launch the Electron shell.

## Production packaging

```bash
npm run build
```

Current build behavior:

- runs `tsc`
- builds the renderer with Vite
- packages the Electron app with `electron-builder`
- writes packaged artifacts to `sldl-gui/release/`

There is also a shorter packaging script:

```bash
npm run electron:build
```

## How the GUI finds `sldl`

The Electron main process resolves the backend executable in this order:

1. a custom path saved from the **System** page
2. common locations next to the packaged app
3. the current working directory and its parent
4. `PATH` fallback via plain `sldl`

If auto-discovery misses your binary, open **System** and set the path manually.

## Config files

The GUI stores two files under Electron's `userData` directory:

- `gui-config.json` — custom GUI state such as the manually selected `sldl` path
- `sldl.conf` — persisted downloader settings used by the GUI/backend bridge

## Credentials and policy notes

- Soulseek credentials are entered in **Settings → Account**
- Spotify Client ID / Secret, access token, and refresh token are supported in the GUI
- sensitive launch arguments are redacted in the GUI console log
- condition settings are normalized back to the locked MP3 320 strict policy on load, save, and runtime launch

## Validation commands

Useful checks while working on the GUI:

```bash
npx tsc --noEmit
npm run build
```

From the repository root, the Spotify-focused backend validation used during this migration was:

```bash
dotnet test slsk-batchdl.Tests --filter Spotify --nologo
```

## macOS notes

If macOS blocks the backend binary, remove the quarantine attribute and ad-hoc sign it:

```bash
xattr -d com.apple.quarantine /path/to/sldl
codesign --force --deep -s - /path/to/sldl
```

If port `49998` is already taken by another Soulseek client or old process, free it before testing downloads.