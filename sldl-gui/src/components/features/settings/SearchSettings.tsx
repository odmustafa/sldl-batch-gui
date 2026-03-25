import { Input, Checkbox, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'
import { AlbumArtOption } from '../../../types/sldl'
import { useSettingsStore } from '../../../stores/settingsStore'

export function SearchSettings() {
  const { config, updateConfig } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* Search Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Search Behavior</CardTitle>
          <CardDescription>
            Configure how sldl searches for files on the network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            label="Fast Search"
            description="Begin downloading as soon as a file matching preferred conditions is found"
            checked={config.fastSearch}
            onChange={(checked) => updateConfig({ fastSearch: checked })}
          />

          <Input
            label="Search Timeout"
            type="number"
            placeholder="6000"
            value={config.searchTimeout || ''}
            onChange={(e) => updateConfig({ searchTimeout: parseInt(e.target.value) || undefined })}
            helperText="Maximum time to wait for search results (ms)"
          />

          <Input
            label="Max Stale Time"
            type="number"
            placeholder="50000"
            value={config.maxStaleTime || ''}
            onChange={(e) => updateConfig({ maxStaleTime: parseInt(e.target.value) || undefined })}
            helperText="Maximum time before a search is considered stale (ms)"
          />

          <Input
            label="Searches Per Time"
            type="number"
            placeholder="34"
            value={config.searchesPerTime || ''}
            onChange={(e) => updateConfig({ searchesPerTime: parseInt(e.target.value) || undefined })}
            helperText="Maximum searches per time period"
          />

          <Input
            label="Search Rename Pattern"
            placeholder=""
            value={config.searchRenamePattern || ''}
            onChange={(e) => updateConfig({ searchRenamePattern: e.target.value })}
            helperText="Regex pattern to rename search queries"
          />
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Download Settings</CardTitle>
          <CardDescription>
            Configure download behavior and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Concurrent Downloads"
            type="number"
            min={1}
            max={10}
            placeholder="2"
            value={config.concurrentDownloads}
            onChange={(e) => updateConfig({ concurrentDownloads: parseInt(e.target.value) || 2 })}
            helperText="Number of simultaneous downloads"
          />

          <Input
            label="Max Retries"
            type="number"
            min={0}
            max={10}
            placeholder="2"
            value={config.maxRetriesPerTrack || ''}
            onChange={(e) => updateConfig({ maxRetriesPerTrack: parseInt(e.target.value) || undefined })}
            helperText="Maximum retry attempts per track"
          />

          <Checkbox
            label="Skip Existing"
            description="Skip files that already exist in the download folder"
            checked={config.skipExisting}
            onChange={(checked) => updateConfig({ skipExisting: checked })}
          />

          <Checkbox
            label="Skip Not Found"
            description="Skip tracks that were not found in previous runs"
            checked={config.skipNotFound}
            onChange={(checked) => updateConfig({ skipNotFound: checked })}
          />

          <Checkbox
            label="Desperate Mode"
            description="Try harder to find files, ignoring some conditions"
            checked={config.desperateSearch}
            onChange={(checked) => updateConfig({ desperateSearch: checked })}
          />
        </CardContent>
      </Card>

      {/* Album Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Album Mode</CardTitle>
          <CardDescription>
            Settings specific to album downloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Min Album Track Count"
            type="number"
            placeholder="5"
            value={config.minAlbumTrackCount || ''}
            onChange={(e) => updateConfig({ minAlbumTrackCount: parseInt(e.target.value) || undefined })}
            helperText="Minimum tracks required for album match"
          />

          <Input
            label="Max Album Track Count"
            type="number"
            placeholder=""
            value={config.maxAlbumTrackCount || ''}
            onChange={(e) => updateConfig({ maxAlbumTrackCount: parseInt(e.target.value) || undefined })}
            helperText="Maximum tracks allowed for album match"
          />

          <Checkbox
            label="Album Art Only"
            description="Only download album artwork, not music files"
            checked={config.albumArtOnly}
            onChange={(checked) => updateConfig({ albumArtOnly: checked })}
          />

          <Select
            label="Album Art Option"
            options={[
              { value: 'default', label: 'Default' },
              { value: 'largest', label: 'Largest' },
              { value: 'most', label: 'Most Common' },
            ]}
            value={config.albumArtOption}
            onChange={(value) => updateConfig({ albumArtOption: value as AlbumArtOption })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

