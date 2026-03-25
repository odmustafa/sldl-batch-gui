import { Save, RotateCcw, Upload, Download } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui'
import { AccountSettings } from './AccountSettings'
import { SearchSettings } from './SearchSettings'
import { ConditionsSettings } from './ConditionsSettings'
import { OutputSettings } from './OutputSettings'
import { useSettingsStore } from '../../../stores/settingsStore'
import { useAppStore } from '../../../stores/appStore'

export function SettingsPage() {
  const { saveConfig, loadConfig, resetConfig, hasUnsavedChanges } = useSettingsStore()
  const { settingsTab, setSettingsTab } = useAppStore()

  const handleSave = async () => {
    try {
      await saveConfig()
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetConfig()
    }
  }

  const handleExport = async () => {
    const path = await window.sldl.selectFile([
      { name: 'Config Files', extensions: ['conf'] },
    ])
    if (path) {
      // Export config to file
      console.log('Export to:', path)
    }
  }

  const handleImport = async () => {
    const path = await window.sldl.selectFile([
      { name: 'Config Files', extensions: ['conf'] },
    ])
    if (path) {
      await loadConfig(path)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Settings"
        description="Configure sldl options and preferences"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <Tabs value={settingsTab} onValueChange={setSettingsTab} defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="search">Search & Download</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="search">
            <SearchSettings />
          </TabsContent>

          <TabsContent value="conditions">
            <ConditionsSettings />
          </TabsContent>

          <TabsContent value="output">
            <OutputSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

