interface SldlOutput {
  type: 'stdout' | 'stderr'
  data: string
}

interface SldlDebugInfo {
  appPath: string
  exePath: string
  appBundlePath: string
  appBundleParent: string
  cwd: string
  searchResults: { path: string; exists: boolean }[]
}

interface SldlAPI {
  // Dialog methods
  selectDirectory: () => Promise<string | null>
  selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>

  // sldl process methods
  runSldl: (args: string[]) => Promise<number>
  stopSldl: () => Promise<boolean>
  writeSldlInput: (input: string) => Promise<boolean>

  // Event listeners
  onSldlOutput: (callback: (output: SldlOutput) => void) => () => void
  onSldlExit: (callback: (code: number) => void) => () => void

  // App paths
  getAppPath: () => Promise<string>
  getUserDataPath: () => Promise<string>

  // Config methods
  saveConfig: (config: Record<string, unknown>) => Promise<boolean>
  loadConfig: (path?: string) => Promise<Record<string, unknown>>

  // sldl path methods
  getSldlPath: () => Promise<string>
  setSldlPath: (sldlPath: string) => Promise<{ success: boolean; error?: string }>
  getSldlDebugInfo: () => Promise<SldlDebugInfo>
}

interface Window {
  sldl: SldlAPI
}

