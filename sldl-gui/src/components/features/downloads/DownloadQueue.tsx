import {
  Clock,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Trash2
} from 'lucide-react'
import { useDownloadStore } from '../../../stores/downloadStore'
import { Progress, Button, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { DownloadItem } from '../../../types/sldl'

const statusIcons = {
  queued: Clock,
  searching: Search,
  downloading: Download,
  completed: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
}

const statusColors = {
  queued: 'text-muted-foreground',
  searching: 'text-primary',
  downloading: 'text-primary',
  completed: 'text-success',
  failed: 'text-destructive',
  cancelled: 'text-muted-foreground',
}

function DownloadItemRow({ item }: { item: DownloadItem }) {
  const { removeDownload } = useDownloadStore()
  const Icon = statusIcons[item.status]
  const isActive = item.status === 'searching' || item.status === 'downloading'

  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
      <div className={`shrink-0 ${statusColors[item.status]}`}>
        {isActive ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.input}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{item.mode}</span>
          <span>•</span>
          <span className="capitalize">{item.status}</span>
          {item.currentFile && (
            <>
              <span>•</span>
              <span className="truncate">{item.currentFile}</span>
            </>
          )}
        </div>
        {isActive && (
          <Progress value={item.progress} className="mt-2" size="sm" />
        )}
        {item.error && (
          <p className="text-xs text-destructive mt-1">{item.error}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeDownload(item.id)}
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function DownloadQueue() {
  const { downloads, clearCompletedDownloads } = useDownloadStore()

  const activeDownloads = downloads.filter(d =>
    d.status === 'queued' || d.status === 'searching' || d.status === 'downloading'
  )
  const completedDownloads = downloads.filter(d =>
    d.status === 'completed' || d.status === 'failed' || d.status === 'cancelled'
  )

  if (downloads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Download className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No downloads yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Enter a URL or search query above to start downloading
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activeDownloads.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Active Downloads ({activeDownloads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeDownloads.map(item => (
              <DownloadItemRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {completedDownloads.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Completed ({completedDownloads.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearCompletedDownloads}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {completedDownloads.map(item => (
              <DownloadItemRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

