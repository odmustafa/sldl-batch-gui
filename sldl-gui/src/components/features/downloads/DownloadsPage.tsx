import { useEffect, useCallback } from 'react'
import { StopCircle, FolderOpen } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { DownloadInput, DownloadOptions } from './DownloadInput'
import { DownloadQueue } from './DownloadQueue'
import { Button, Card, CardContent } from '../../ui'
import { useDownloadStore } from '../../../stores/downloadStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import {
  LOCKED_DOWNLOAD_POLICY,
  createLockedPreferredConditions,
  createLockedRequiredConditions,
  type FileConditions,
} from '../../../types/sldl'

function appendStringFlag(args: string[], flag: string, value?: string) {
  const trimmed = value?.trim()
  if (trimmed) {
    args.push(flag, trimmed)
  }
}

function appendNumberFlag(args: string[], flag: string, value?: number) {
  if (value !== undefined && !Number.isNaN(value)) {
    args.push(flag, String(value))
  }
}

function appendNullableBooleanFlag(args: string[], flag: string, value?: boolean) {
  if (value !== undefined) {
    args.push(flag, String(value))
  }
}

function normalizeFormats(formats: string[]): string | undefined {
  const normalized = formats
    .map((format) => format.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean)

  return normalized.length > 0 ? normalized.join(',') : undefined
}

function appendConditionArgs(args: string[], prefix: '' | 'pref-', conditions: FileConditions) {
  appendStringFlag(args, `--${prefix}format`, normalizeFormats(conditions.formats))
  appendNumberFlag(args, `--${prefix}length-tol`, conditions.lengthTolerance)
  appendNumberFlag(args, `--${prefix}min-bitrate`, conditions.minBitrate)
  appendNumberFlag(args, `--${prefix}max-bitrate`, conditions.maxBitrate)
  appendNumberFlag(args, `--${prefix}min-samplerate`, conditions.minSampleRate)
  appendNumberFlag(args, `--${prefix}max-samplerate`, conditions.maxSampleRate)
  appendNumberFlag(args, `--${prefix}min-bitdepth`, conditions.minBitDepth)
  appendNumberFlag(args, `--${prefix}max-bitdepth`, conditions.maxBitDepth)
  appendNullableBooleanFlag(args, `--${prefix}strict-title`, conditions.strictTitle)
  appendNullableBooleanFlag(args, `--${prefix}strict-artist`, conditions.strictArtist)
  appendNullableBooleanFlag(args, `--${prefix}strict-album`, conditions.strictAlbum)
  appendStringFlag(args, `--${prefix}banned-users`, conditions.bannedUsers.join(','))
}

const LOCKED_REQUIRED_CONDITIONS = createLockedRequiredConditions()
const LOCKED_PREFERRED_CONDITIONS = createLockedPreferredConditions()

export function DownloadsPage() {
  const {
    addDownload,
    updateDownload,
    setIsRunning,
    isRunning,
    activeDownloadId,
    setActiveDownload
  } = useDownloadStore()
  const { config } = useSettingsStore()

  // Set up IPC listeners for download status
  useEffect(() => {
    const unsubExit = window.sldl.onSldlExit((code) => {
      if (activeDownloadId) {
        updateDownload(activeDownloadId, {
          status: code === 0 ? 'completed' : 'failed',
          progress: code === 0 ? 100 : 0,
          error: code !== 0 ? `Process exited with code ${code}` : undefined,
        })
      }
      setIsRunning(false)
      setActiveDownload(null)
    })

    return () => {
      unsubExit()
    }
  }, [activeDownloadId, updateDownload, setIsRunning, setActiveDownload])

  const handleStartDownload = useCallback(async (input: string, options: DownloadOptions) => {
    // Build command line arguments
    const args: string[] = [input]

    // Add credentials
    if (config.username) {
      args.push('--user', config.username)
    }
    if (config.password) {
      args.push('--pass', config.password)
    }
    if (config.spotifyId) {
      args.push('--spotify-id', config.spotifyId)
    }
    if (config.spotifySecret) {
      args.push('--spotify-secret', config.spotifySecret)
    }
    if (config.spotifyToken) {
      args.push('--spotify-token', config.spotifyToken)
    }
    if (config.spotifyRefresh) {
      args.push('--spotify-refresh', config.spotifyRefresh)
    }
    if (config.youtubeKey) {
      args.push('--youtube-key', config.youtubeKey)
    }

    // Add download path
    if (config.downloadPath) {
      args.push('--path', config.downloadPath)
    }

    // Add mode flags
    if (options.albumMode) args.push('--album')
    if (options.aggregateMode) args.push('--aggregate')
    if (options.interactiveMode) args.push('--interactive')

    // Add input type if not auto
    if (options.inputType !== 'auto') {
      args.push('--input-type', options.inputType)
    }

    // Add file condition settings
    appendConditionArgs(args, '', LOCKED_REQUIRED_CONDITIONS)
    appendConditionArgs(args, 'pref-', LOCKED_PREFERRED_CONDITIONS)

    if (LOCKED_DOWNLOAD_POLICY.strictConditions) {
      args.push('--strict-conditions')
    }

    // Add other settings
    if (config.fastSearch) args.push('--fast-search')
    if (config.skipExisting) args.push('--skip-existing')
    if (config.concurrentDownloads !== 2) {
      args.push('--concurrent-downloads', String(config.concurrentDownloads))
    }

    // Determine download mode for display
    const mode = options.albumMode && options.aggregateMode
      ? 'album-aggregate'
      : options.albumMode
        ? 'album'
        : options.aggregateMode
          ? 'aggregate'
          : 'normal'

    // Add to queue
    const downloadId = addDownload({
      input,
      inputType: options.inputType,
      mode,
      status: 'searching',
      progress: 0,
      startedAt: new Date(),
    })

    setActiveDownload(downloadId)
    setIsRunning(true)

    try {
      await window.sldl.runSldl(args)
    } catch (error) {
      updateDownload(downloadId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      setIsRunning(false)
      setActiveDownload(null)
    }
  }, [config, addDownload, updateDownload, setIsRunning, setActiveDownload])

  const handleStop = async () => {
    await window.sldl.stopSldl()
    if (activeDownloadId) {
      updateDownload(activeDownloadId, { status: 'cancelled' })
    }
    setIsRunning(false)
    setActiveDownload(null)
  }

  const handleOpenFolder = async () => {
    const path = config.downloadPath || await window.sldl.selectDirectory()
    if (path) {
      // In a real app, this would open the folder in the file manager
      console.log('Open folder:', path)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Downloads"
        description="Download music from Soulseek"
        actions={
          <>
            {isRunning && (
              <Button variant="destructive" onClick={handleStop}>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            <Button variant="outline" onClick={handleOpenFolder}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Folder
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <DownloadInput
              onStartDownload={handleStartDownload}
              disabled={isRunning}
            />
          </CardContent>
        </Card>

        <DownloadQueue />
      </div>
    </div>
  )
}

