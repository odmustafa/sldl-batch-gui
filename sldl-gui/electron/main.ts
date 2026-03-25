import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let sldlProcess: ChildProcess | null = null

const GUI_TO_CONFIG_KEY_OVERRIDES: Record<string, string> = {
  downloadPath: 'path',
  maxTracks: 'number',
  albumMode: 'album',
  aggregateMode: 'aggregate',
  interactiveMode: 'interactive',
  desperateSearch: 'desperate',
  maxRetriesPerTrack: 'max-retries',
  useYtdlp: 'yt-dlp',
  albumArtOption: 'album-art',
  printOption: 'print',
}

const CONFIG_TO_GUI_KEY_OVERRIDES = Object.fromEntries(
  Object.entries(GUI_TO_CONFIG_KEY_OVERRIDES).map(([guiKey, configKey]) => [configKey, guiKey])
)

const BOOLEAN_GUI_KEYS = new Set([
  'reverse',
  'fastSearch',
  'skipExisting',
  'skipNotFound',
  'desperateSearch',
  'albumMode',
  'aggregateMode',
  'interactiveMode',
  'albumArtOnly',
  'writePlaylist',
  'writeIndex',
  'noBrowseFolder',
  'noModifyShareCount',
  'noRemoveSpecialChars',
  'useYtdlp',
  'verbose',
  'noProgress',
])

const NUMBER_GUI_KEYS = new Set([
  'maxTracks',
  'offset',
  'concurrentDownloads',
  'searchTimeout',
  'maxStaleTime',
  'searchesPerTime',
  'searchRenewTime',
  'maxRetriesPerTrack',
  'minAlbumTrackCount',
  'maxAlbumTrackCount',
  'minSharesAggregate',
  'aggregateLengthTol',
  'listenPort',
  'connectTimeout',
])

type ConditionScope = 'requiredConditions' | 'preferredConditions'
type ConditionField =
  | 'formats'
  | 'lengthTolerance'
  | 'minBitrate'
  | 'maxBitrate'
  | 'minSampleRate'
  | 'maxSampleRate'
  | 'minBitDepth'
  | 'maxBitDepth'
  | 'strictTitle'
  | 'strictArtist'
  | 'strictAlbum'
  | 'bannedUsers'

type ConditionDescriptor = {
  scope: ConditionScope
  field: ConditionField
}

const CONDITION_KEY_MAP: Record<string, ConditionDescriptor> = {
  format: { scope: 'requiredConditions', field: 'formats' },
  formats: { scope: 'requiredConditions', field: 'formats' },
  'length-tol': { scope: 'requiredConditions', field: 'lengthTolerance' },
  'length-tolerance': { scope: 'requiredConditions', field: 'lengthTolerance' },
  tolerance: { scope: 'requiredConditions', field: 'lengthTolerance' },
  'min-bitrate': { scope: 'requiredConditions', field: 'minBitrate' },
  'max-bitrate': { scope: 'requiredConditions', field: 'maxBitrate' },
  'min-samplerate': { scope: 'requiredConditions', field: 'minSampleRate' },
  'max-samplerate': { scope: 'requiredConditions', field: 'maxSampleRate' },
  'min-bitdepth': { scope: 'requiredConditions', field: 'minBitDepth' },
  'max-bitdepth': { scope: 'requiredConditions', field: 'maxBitDepth' },
  'strict-title': { scope: 'requiredConditions', field: 'strictTitle' },
  'strict-artist': { scope: 'requiredConditions', field: 'strictArtist' },
  'strict-album': { scope: 'requiredConditions', field: 'strictAlbum' },
  'banned-users': { scope: 'requiredConditions', field: 'bannedUsers' },
  'pref-format': { scope: 'preferredConditions', field: 'formats' },
  'pref-formats': { scope: 'preferredConditions', field: 'formats' },
  'pref-length-tol': { scope: 'preferredConditions', field: 'lengthTolerance' },
  'pref-length-tolerance': { scope: 'preferredConditions', field: 'lengthTolerance' },
  'pref-tolerance': { scope: 'preferredConditions', field: 'lengthTolerance' },
  'pref-min-bitrate': { scope: 'preferredConditions', field: 'minBitrate' },
  'pref-max-bitrate': { scope: 'preferredConditions', field: 'maxBitrate' },
  'pref-min-samplerate': { scope: 'preferredConditions', field: 'minSampleRate' },
  'pref-max-samplerate': { scope: 'preferredConditions', field: 'maxSampleRate' },
  'pref-min-bitdepth': { scope: 'preferredConditions', field: 'minBitDepth' },
  'pref-max-bitdepth': { scope: 'preferredConditions', field: 'maxBitDepth' },
  'pref-strict-title': { scope: 'preferredConditions', field: 'strictTitle' },
  'pref-strict-artist': { scope: 'preferredConditions', field: 'strictArtist' },
  'pref-strict-album': { scope: 'preferredConditions', field: 'strictAlbum' },
  'pref-banned-users': { scope: 'preferredConditions', field: 'bannedUsers' },
}

const CONDITION_SERIALIZATION_ORDER: Array<{ field: ConditionField; configKey: string }> = [
  { field: 'formats', configKey: 'format' },
  { field: 'lengthTolerance', configKey: 'length-tol' },
  { field: 'minBitrate', configKey: 'min-bitrate' },
  { field: 'maxBitrate', configKey: 'max-bitrate' },
  { field: 'minSampleRate', configKey: 'min-samplerate' },
  { field: 'maxSampleRate', configKey: 'max-samplerate' },
  { field: 'minBitDepth', configKey: 'min-bitdepth' },
  { field: 'maxBitDepth', configKey: 'max-bitdepth' },
  { field: 'strictTitle', configKey: 'strict-title' },
  { field: 'strictArtist', configKey: 'strict-artist' },
  { field: 'strictAlbum', configKey: 'strict-album' },
  { field: 'bannedUsers', configKey: 'banned-users' },
]

function normalizeList(rawValue: string, trimPeriods = false): string[] {
  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => trimPeriods ? value.replace(/^\./, '').toLowerCase() : value)
}

function parseConditionValue(field: ConditionField, rawValue: string): unknown {
  switch (field) {
    case 'formats':
      return normalizeList(rawValue, true)
    case 'bannedUsers':
      return normalizeList(rawValue)
    case 'lengthTolerance':
    case 'minBitrate':
    case 'maxBitrate':
    case 'minSampleRate':
    case 'maxSampleRate':
    case 'minBitDepth':
    case 'maxBitDepth': {
      const parsed = Number(rawValue)
      return Number.isNaN(parsed) ? undefined : parsed
    }
    case 'strictTitle':
    case 'strictArtist':
    case 'strictAlbum':
      return rawValue.toLowerCase() === 'true'
  }
}

function appendConditionLines(lines: string[], scope: ConditionScope, value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return
  }

  const prefix = scope === 'preferredConditions' ? 'pref-' : ''
  const conditions = value as Record<string, unknown>

  for (const { field, configKey } of CONDITION_SERIALIZATION_ORDER) {
    const fieldValue = conditions[field]

    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      continue
    }

    if (Array.isArray(fieldValue)) {
      const normalized = field === 'formats'
        ? fieldValue
          .map((item) => String(item).trim().replace(/^\./, '').toLowerCase())
          .filter(Boolean)
        : fieldValue
          .map((item) => String(item).trim())
          .filter(Boolean)

      if (normalized.length > 0) {
        lines.push(`${prefix}${configKey} = ${normalized.join(',')}`)
      }

      continue
    }

    lines.push(`${prefix}${configKey} = ${fieldValue}`)
  }
}

function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function toConfigKey(guiKey: string): string {
  return GUI_TO_CONFIG_KEY_OVERRIDES[guiKey] ?? camelToKebab(guiKey)
}

function toGuiKey(configKey: string): string {
  return CONFIG_TO_GUI_KEY_OVERRIDES[configKey] ?? kebabToCamel(configKey)
}

function parseConfigValue(guiKey: string, rawValue: string): unknown {
  if (BOOLEAN_GUI_KEYS.has(guiKey)) {
    return rawValue.toLowerCase() === 'true'
  }

  if (NUMBER_GUI_KEYS.has(guiKey)) {
    const parsed = Number(rawValue)
    return Number.isNaN(parsed) ? rawValue : parsed
  }

  return rawValue
}

function isPackagedApp(): boolean {
  return app.isPackaged || app.getAppPath().endsWith('.asar')
}

// Manual fallback bundles can run from app.asar while app.isPackaged remains false.
const isDev = !isPackagedApp()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In packaged app, load from the dist folder relative to the app path
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    console.log('Loading index from:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  loadGuiConfig()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Custom sldl path (can be set by user)
let customSldlPath: string | null = null

// Path to the GUI config file (separate from sldl.conf)
const getGuiConfigPath = () => path.join(app.getPath('userData'), 'gui-config.json')

// Load custom sldl path from config on startup
function loadGuiConfig() {
  try {
    const configPath = getGuiConfigPath()
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.customSldlPath && fs.existsSync(config.customSldlPath)) {
        customSldlPath = config.customSldlPath
        console.log('Loaded custom sldl path:', customSldlPath)
      }
    }
  } catch (err) {
    console.error('Failed to load GUI config:', err)
  }
}

// Save GUI config
function saveGuiConfig() {
  try {
    const configPath = getGuiConfigPath()
    const config = { customSldlPath }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log('Saved GUI config to:', configPath)
  } catch (err) {
    console.error('Failed to save GUI config:', err)
  }
}

// Find sldl executable
function findSldlPath(): string {
  // If user has set a custom path, use it
  if (customSldlPath && fs.existsSync(customSldlPath)) {
    return customSldlPath
  }

  const appPath = app.getAppPath()
  const cwd = process.cwd()
  const exePath = app.getPath('exe')

  // For macOS .app bundle, go up from MacOS folder to the .app bundle, then to its parent
  const appBundlePath = path.dirname(path.dirname(path.dirname(exePath)))
  const appBundleParent = path.dirname(appBundlePath)

  const possiblePaths = [
    // Look next to the .app bundle (for macOS)
    path.join(appBundleParent, 'sldl'),
    path.join(appBundleParent, 'sldl.exe'),
    // Look in grandparent of app bundle (sldl_osx-arm64 folder)
    path.join(appBundleParent, '..', 'sldl'),
    path.join(appBundleParent, '..', '..', 'sldl'),
    // Look in parent directory of the app (for development with sldl-gui inside slsk-batchdl)
    path.join(appPath, '..', '..', 'sldl'),
    path.join(appPath, '..', '..', 'sldl.exe'),
    // Look next to the app
    path.join(appPath, '..', 'sldl'),
    path.join(appPath, '..', 'sldl.exe'),
    // Look in the app directory itself
    path.join(appPath, 'sldl'),
    path.join(appPath, 'sldl.exe'),
    // Look in current working directory
    path.join(cwd, 'sldl'),
    path.join(cwd, 'sldl.exe'),
    // Look in parent of cwd
    path.join(cwd, '..', 'sldl'),
    path.join(cwd, '..', 'sldl.exe'),
  ]

  for (const p of possiblePaths) {
    const resolved = path.resolve(p)
    if (fs.existsSync(resolved)) {
      return resolved
    }
  }

  return 'sldl' // Fallback to PATH
}

function redactArgs(args: string[]): string {
  const sensitiveFlags = new Set([
    '--pass',
    '--spotify-secret',
    '--spotify-token',
    '--spotify-refresh',
  ])

  const redacted: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    redacted.push(arg)

    if (sensitiveFlags.has(arg) && i + 1 < args.length) {
      redacted.push('[REDACTED]')
      i += 1
    }
  }

  return redacted.join(' ')
}

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  return result.filePaths[0] || null
})

ipcMain.handle('select-file', async (_, filters?: { name: string; extensions: string[] }[]) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: filters || [{ name: 'All Files', extensions: ['*'] }]
  })
  return result.filePaths[0] || null
})

ipcMain.handle('run-sldl', async (_, args: string[]) => {
  return new Promise((resolve) => {
    const sldlPath = findSldlPath()

    // Log the path being used
    mainWindow?.webContents.send('sldl-output', {
      type: 'stdout',
      data: `[GUI] Using sldl at: ${sldlPath}\n[GUI] Args: ${redactArgs(args)}\n`
    })

    try {
      sldlProcess = spawn(sldlPath, args, {
        cwd: process.cwd(),
        env: { ...process.env },
      })

      sldlProcess.stdout?.on('data', (data) => {
        mainWindow?.webContents.send('sldl-output', { type: 'stdout', data: data.toString() })
      })

      sldlProcess.stderr?.on('data', (data) => {
        mainWindow?.webContents.send('sldl-output', { type: 'stderr', data: data.toString() })
      })

      sldlProcess.on('close', (code) => {
        mainWindow?.webContents.send('sldl-exit', code ?? -1)
        sldlProcess = null
        resolve(code ?? -1)
      })

      sldlProcess.on('error', (err) => {
        const errorMsg = `[GUI] Failed to start sldl: ${err.message}\n`
        mainWindow?.webContents.send('sldl-output', { type: 'stderr', data: errorMsg })
        mainWindow?.webContents.send('sldl-exit', -1)
        sldlProcess = null
        resolve(-1)
      })
    } catch (err) {
      const errorMsg = `[GUI] Exception spawning sldl: ${err}\n`
      mainWindow?.webContents.send('sldl-output', { type: 'stderr', data: errorMsg })
      mainWindow?.webContents.send('sldl-exit', -1)
      resolve(-1)
    }
  })
})

ipcMain.handle('stop-sldl', () => {
  if (sldlProcess) {
    sldlProcess.kill('SIGTERM')
    sldlProcess = null
    return true
  }
  return false
})

ipcMain.handle('write-sldl-input', (_, input: string) => {
  if (sldlProcess?.stdin) {
    sldlProcess.stdin.write(input + '\n')
    return true
  }
  return false
})

ipcMain.handle('get-app-path', () => app.getAppPath())
ipcMain.handle('get-user-data-path', () => app.getPath('userData'))

// Debug: get path search info
ipcMain.handle('get-sldl-debug-info', () => {
  const appPath = app.getAppPath()
  const cwd = process.cwd()
  const exePath = app.getPath('exe')
  const appBundlePath = path.dirname(path.dirname(path.dirname(exePath)))
  const appBundleParent = path.dirname(appBundlePath)

  const possiblePaths = [
    path.join(appBundleParent, 'sldl'),
    path.join(appBundleParent, '..', 'sldl'),
    path.join(appBundleParent, '..', '..', 'sldl'),
    path.join(appPath, '..', '..', 'sldl'),
    path.join(appPath, '..', 'sldl'),
    path.join(appPath, 'sldl'),
    path.join(cwd, 'sldl'),
    path.join(cwd, '..', 'sldl'),
  ]

  const results = possiblePaths.map(p => ({
    path: path.resolve(p),
    exists: fs.existsSync(path.resolve(p))
  }))

  return {
    appPath,
    exePath,
    appBundlePath,
    appBundleParent,
    cwd,
    searchResults: results
  }
})

ipcMain.handle('set-sldl-path', (_, sldlPath: string) => {
  if (fs.existsSync(sldlPath)) {
    customSldlPath = sldlPath
    saveGuiConfig() // Persist the path to disk
    return { success: true }
  }
  return { success: false, error: 'File does not exist' }
})

ipcMain.handle('get-sldl-path', () => {
  return customSldlPath || findSldlPath()
})

// Config file handling
const getConfigPath = () => path.join(app.getPath('userData'), 'sldl.conf')

ipcMain.handle('save-config', async (_, config: Record<string, unknown>) => {
  const configPath = getConfigPath()
  const lines: string[] = []

  for (const [key, value] of Object.entries(config)) {
    if (key === 'requiredConditions' || key === 'preferredConditions') {
      appendConditionLines(lines, key, value)
      continue
    }

    const configKey = toConfigKey(key)

    if (value === '' || value === null || value === undefined) continue
    if (typeof value === 'boolean') {
      lines.push(`${configKey} = ${value}`)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        lines.push(`${configKey} = ${item}`)
      }
    } else if (typeof value === 'object') {
      // Handle nested objects like conditions
      continue
    } else {
      lines.push(`${configKey} = ${value}`)
    }
  }

  fs.writeFileSync(configPath, lines.join('\n'), 'utf-8')
  return true
})

ipcMain.handle('load-config', async (_, customPath?: string) => {
  const configPath = customPath || getConfigPath()

  if (!fs.existsSync(configPath)) {
    return {}
  }

  const content = fs.readFileSync(configPath, 'utf-8')
  const config: Record<string, unknown> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) {
      const descriptor = CONDITION_KEY_MAP[trimmed]

      if (descriptor) {
        const conditions = (config[descriptor.scope] as Record<string, unknown> | undefined) ?? {}
        conditions[descriptor.field] = true
        config[descriptor.scope] = conditions
        continue
      }

      const guiKey = toGuiKey(trimmed)
      config[guiKey] = true
    } else {
      const configKey = trimmed.slice(0, eqIndex).trim()
      const descriptor = CONDITION_KEY_MAP[configKey]
      const guiKey = toGuiKey(configKey)
      const rawValue = trimmed.slice(eqIndex + 1).trim()

      if (descriptor) {
        const parsedValue = parseConditionValue(descriptor.field, rawValue)

        if (parsedValue !== undefined) {
          const conditions = (config[descriptor.scope] as Record<string, unknown> | undefined) ?? {}
          conditions[descriptor.field] = parsedValue
          config[descriptor.scope] = conditions
        }

        continue
      }

      config[guiKey] = parseConfigValue(guiKey, rawValue)
    }
  }

  return config
})

