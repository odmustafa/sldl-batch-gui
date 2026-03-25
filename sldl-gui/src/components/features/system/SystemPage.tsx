import { useState, useEffect } from 'react'
import { FolderOpen, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'

interface DebugInfo {
  appPath: string
  exePath: string
  appBundlePath: string
  appBundleParent: string
  cwd: string
  searchResults: { path: string; exists: boolean }[]
}

export function SystemPage() {
  const [sldlPath, setSldlPath] = useState('')
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const loadDebugInfo = async () => {
    try {
      const info = await window.sldl.getSldlDebugInfo()
      setDebugInfo(info)
      const currentPath = await window.sldl.getSldlPath()
      setSldlPath(currentPath)
    } catch (err) {
      console.error('Failed to load debug info:', err)
    }
  }

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const handleBrowse = async () => {
    const path = await window.sldl.selectFile([
      { name: 'Executables', extensions: ['', 'exe'] }
    ])
    if (path) {
      setSldlPath(path)
    }
  }

  const handleSave = async () => {
    const result = await window.sldl.setSldlPath(sldlPath)
    if (result.success) {
      setStatus('success')
      setStatusMessage('sldl path saved successfully!')
    } else {
      setStatus('error')
      setStatusMessage(result.error || 'Failed to save path')
    }
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="System" description="Configure system settings and sldl executable path" />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>sldl Executable</CardTitle>
            <CardDescription>
              Set the path to the sldl executable. The app will search common locations automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={sldlPath}
                onChange={(e) => setSldlPath(e.target.value)}
                placeholder="/path/to/sldl"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleBrowse}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
            
            {status !== 'idle' && (
              <div className={`flex items-center gap-2 text-sm ${
                status === 'success' ? 'text-success' : 'text-destructive'
              }`}>
                {status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {statusMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Debug Information
              <Button variant="ghost" size="icon" onClick={loadDebugInfo}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Paths being searched for sldl executable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo ? (
              <div className="space-y-4 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">App Path:</span>{' '}
                  <span className="break-all">{debugInfo.appPath}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Exe Path:</span>{' '}
                  <span className="break-all">{debugInfo.exePath}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CWD:</span>{' '}
                  <span className="break-all">{debugInfo.cwd}</span>
                </div>
                <div className="mt-4">
                  <span className="text-muted-foreground">Search Results:</span>
                  <ul className="mt-2 space-y-1">
                    {debugInfo.searchResults.map((result, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {result.exists ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="break-all">{result.path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

