export interface SldlOutput {
  type: 'stdout' | 'stderr'
  data: string
}

export interface SldlAPI {
  selectDirectory: () => Promise<string | null>
  selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
  runSldl: (args: string[]) => Promise<number>
  stopSldl: () => Promise<boolean>
  writeSldlInput: (input: string) => Promise<boolean>
  onSldlOutput: (callback: (output: SldlOutput) => void) => () => void
  onSldlExit: (callback: (code: number) => void) => () => void
  getAppPath: () => Promise<string>
  getUserDataPath: () => Promise<string>
}

declare global {
  interface Window {
    sldl: SldlAPI
  }
}

export {}

