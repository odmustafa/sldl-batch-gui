import { contextBridge, ipcRenderer } from 'electron'

export interface SldlOutput {
  type: 'stdout' | 'stderr'
  data: string
}

const api = {
  // Dialog methods
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('select-directory'),

  selectFile: (filters?: { name: string; extensions: string[] }[]): Promise<string | null> =>
    ipcRenderer.invoke('select-file', filters),

  // sldl process methods
  runSldl: (args: string[]): Promise<number> =>
    ipcRenderer.invoke('run-sldl', args),

  stopSldl: (): Promise<boolean> =>
    ipcRenderer.invoke('stop-sldl'),

  writeSldlInput: (input: string): Promise<boolean> =>
    ipcRenderer.invoke('write-sldl-input', input),

  // Event listeners
  onSldlOutput: (callback: (output: SldlOutput) => void) => {
    const handler = (_: Electron.IpcRendererEvent, output: SldlOutput) => callback(output)
    ipcRenderer.on('sldl-output', handler)
    return () => ipcRenderer.removeListener('sldl-output', handler)
  },

  onSldlExit: (callback: (code: number) => void) => {
    const handler = (_: Electron.IpcRendererEvent, code: number) => callback(code)
    ipcRenderer.on('sldl-exit', handler)
    return () => ipcRenderer.removeListener('sldl-exit', handler)
  },

  // App paths
  getAppPath: (): Promise<string> =>
    ipcRenderer.invoke('get-app-path'),

  getUserDataPath: (): Promise<string> =>
    ipcRenderer.invoke('get-user-data-path'),

  // Config methods
  saveConfig: (config: Record<string, unknown>): Promise<boolean> =>
    ipcRenderer.invoke('save-config', config),

  loadConfig: (path?: string): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('load-config', path),

  // sldl path methods
  getSldlPath: (): Promise<string> =>
    ipcRenderer.invoke('get-sldl-path'),

  setSldlPath: (sldlPath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('set-sldl-path', sldlPath),

  getSldlDebugInfo: (): Promise<{
    appPath: string;
    exePath: string;
    appBundlePath: string;
    appBundleParent: string;
    cwd: string;
    searchResults: { path: string; exists: boolean }[];
  }> => ipcRenderer.invoke('get-sldl-debug-info'),
}

contextBridge.exposeInMainWorld('sldl', api)

export type SldlAPI = typeof api

