import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type View = 'downloads' | 'settings' | 'profiles' | 'console' | 'system'

interface AppState {
  theme: Theme
  sidebarCollapsed: boolean
  currentView: View
  settingsTab: string

  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentView: (view: View) => void
  setSettingsTab: (tab: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      currentView: 'downloads',
      settingsTab: 'account',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setCurrentView: (view) => set({ currentView: view }),

      setSettingsTab: (tab) => set({ settingsTab: tab }),
    }),
    {
      name: 'sldl-app',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useAppStore.getState()
    if (theme === 'system') {
      applyTheme('system')
    }
  })
}

