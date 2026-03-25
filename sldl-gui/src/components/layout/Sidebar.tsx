import React from 'react'
import {
  Download,
  Settings,
  FolderOpen,
  Terminal,
  Monitor as MonitorIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { useDownloadStore } from '../../stores/downloadStore'
import { Button } from '../ui/Button'

const navItems = [
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profiles', label: 'Profiles', icon: FolderOpen },
  { id: 'console', label: 'Console', icon: Terminal },
  { id: 'system', label: 'System', icon: MonitorIcon },
] as const

export function Sidebar() {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    toggleSidebar,
    theme,
    setTheme
  } = useAppStore()
  const { isRunning } = useDownloadStore()

  const themeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <aside
      className={`
        flex flex-col border-r border-border bg-card
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Header with drag region */}
      <div className="drag-region flex h-14 items-center justify-between border-b border-border px-4">
        {!sidebarCollapsed && (
          <h1 className="no-drag text-lg font-bold text-primary">sldl</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="no-drag h-8 w-8"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const showBadge = item.id === 'downloads' && isRunning

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                relative flex w-full items-center gap-3 rounded-md px-3 py-2
                text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {showBadge && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-success animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer with theme toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? 'icon' : 'sm'}
          onClick={cycleTheme}
          className={`w-full ${sidebarCollapsed ? '' : 'justify-start gap-3'}`}
          title={`Theme: ${theme}`}
        >
          {React.createElement(themeIcon, { className: 'h-5 w-5 shrink-0' })}
          {!sidebarCollapsed && <span className="capitalize">{theme}</span>}
        </Button>
      </div>
    </aside>
  )
}

