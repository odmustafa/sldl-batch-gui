import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { DownloadsPage } from './components/features/downloads/DownloadsPage'
import { SettingsPage } from './components/features/settings/SettingsPage'
import { ProfilesPage } from './components/features/profiles/ProfilesPage'
import { ConsolePage } from './components/features/console/ConsolePage'
import { SystemPage } from './components/features/system/SystemPage'
import { useAppStore } from './stores/appStore'
import { useDownloadStore } from './stores/downloadStore'

function App() {
  const { currentView } = useAppStore()
  const { addConsoleMessage } = useDownloadStore()

  // Set up global IPC listeners for console output
  useEffect(() => {
    const unsubOutput = window.sldl.onSldlOutput((output) => {
      // Map stdout/stderr to console message types
      const messageType = output.type === 'stderr' ? 'error' : 'info'
      addConsoleMessage({ type: messageType, content: output.data })
    })
    
    return () => {
      unsubOutput()
    }
  }, [addConsoleMessage])

  const renderPage = () => {
    switch (currentView) {
      case 'downloads':
        return <DownloadsPage />
      case 'settings':
        return <SettingsPage />
      case 'profiles':
        return <ProfilesPage />
      case 'console':
        return <ConsolePage />
      case 'system':
        return <SystemPage />
      default:
        return <DownloadsPage />
    }
  }

  return (
    <Layout>
      {renderPage()}
    </Layout>
  )
}

export default App

