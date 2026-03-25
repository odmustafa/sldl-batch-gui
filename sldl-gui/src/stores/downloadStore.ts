import { create } from 'zustand'
import { DownloadItem, ConsoleMessage } from '../types/sldl'

interface DownloadState {
  downloads: DownloadItem[]
  activeDownloadId: string | null
  consoleMessages: ConsoleMessage[]
  isRunning: boolean
  
  // Actions
  addDownload: (download: Omit<DownloadItem, 'id'>) => string
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
  removeDownload: (id: string) => void
  clearCompletedDownloads: () => void
  
  setActiveDownload: (id: string | null) => void
  setIsRunning: (running: boolean) => void
  
  addConsoleMessage: (message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void
  clearConsole: () => void
}

let messageId = 0
let downloadId = 0

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: [],
  activeDownloadId: null,
  consoleMessages: [],
  isRunning: false,

  addDownload: (download) => {
    const id = `download-${++downloadId}`
    set((state) => ({
      downloads: [...state.downloads, { ...download, id }],
    }))
    return id
  },

  updateDownload: (id, updates) => set((state) => ({
    downloads: state.downloads.map((d) => 
      d.id === id ? { ...d, ...updates } : d
    ),
  })),

  removeDownload: (id) => set((state) => ({
    downloads: state.downloads.filter((d) => d.id !== id),
    activeDownloadId: state.activeDownloadId === id ? null : state.activeDownloadId,
  })),

  clearCompletedDownloads: () => set((state) => ({
    downloads: state.downloads.filter((d) => 
      d.status !== 'completed' && d.status !== 'failed' && d.status !== 'cancelled'
    ),
  })),

  setActiveDownload: (id) => set({ activeDownloadId: id }),
  
  setIsRunning: (running) => set({ isRunning: running }),

  addConsoleMessage: (message) => set((state) => ({
    consoleMessages: [
      ...state.consoleMessages,
      {
        ...message,
        id: `msg-${++messageId}`,
        timestamp: new Date(),
      },
    ].slice(-1000), // Keep last 1000 messages
  })),

  clearConsole: () => set({ consoleMessages: [] }),
}))

