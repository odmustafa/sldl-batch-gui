import { Input, Checkbox, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'
import { useSettingsStore } from '../../../stores/settingsStore'

const printOptionOptions = [
  { value: 'tracks', label: 'Tracks' },
  { value: 'results', label: 'Search Results' },
  { value: 'tracks-full', label: 'Tracks (Full)' },
  { value: 'results-full', label: 'Results (Full)' },
]

export function OutputSettings() {
  const { config, updateConfig } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* File Naming */}
      <Card>
        <CardHeader>
          <CardTitle>File Naming</CardTitle>
          <CardDescription>
            Configure how downloaded files are named and organized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Track Name Format"
            placeholder="{artist} - {title}"
            value={config.nameFormat || ''}
            onChange={(e) => updateConfig({ nameFormat: e.target.value })}
            helperText="Available: {artist}, {title}, {album}, {track}, {year}"
          />

          <Input
            label="Album Name Format"
            placeholder="{artist} - {album}"
            value={config.albumNameFormat || ''}
            onChange={(e) => updateConfig({ albumNameFormat: e.target.value })}
            helperText="Format for album folder names"
          />

          <Checkbox
            label="Write Playlist"
            description="Create M3U playlist file for downloads"
            checked={config.writePlaylist}
            onChange={(checked) => updateConfig({ writePlaylist: checked })}
          />

          <Checkbox
            label="Write Index"
            description="Create index file for downloaded tracks"
            checked={config.writeIndex}
            onChange={(checked) => updateConfig({ writeIndex: checked })}
          />
        </CardContent>
      </Card>

      {/* Logging */}
      <Card>
        <CardHeader>
          <CardTitle>Logging & Output</CardTitle>
          <CardDescription>
            Configure console output and logging behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            label="Verbose Output"
            description="Show detailed progress and debug information"
            checked={config.verbose}
            onChange={(checked) => updateConfig({ verbose: checked })}
          />

          <Checkbox
            label="No Progress"
            description="Disable progress bar display"
            checked={config.noProgress}
            onChange={(checked) => updateConfig({ noProgress: checked })}
          />

          <Select
            label="Print Option"
            options={printOptionOptions}
            value={config.printOption || 'tracks'}
            onChange={(value) => updateConfig({ printOption: value as typeof config.printOption })}
          />

          <Input
            label="Failed Downloads Log"
            placeholder="failed.txt"
            value={config.failedLogPath || ''}
            onChange={(e) => updateConfig({ failedLogPath: e.target.value })}
            helperText="Path to log failed downloads"
          />
        </CardContent>
      </Card>

      {/* M3U Settings */}
      <Card>
        <CardHeader>
          <CardTitle>M3U Playlist Settings</CardTitle>
          <CardDescription>
            Configure M3U playlist generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="M3U Path"
            placeholder=""
            value={config.m3uPath || ''}
            onChange={(e) => updateConfig({ m3uPath: e.target.value })}
            helperText="Custom path for M3U playlist file"
          />

          <Checkbox
            label="Use M3U Index"
            description="Use index numbers in M3U entries"
            checked={config.useM3uIndex}
            onChange={(checked) => updateConfig({ useM3uIndex: checked })}
          />
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
          <CardDescription>
            Additional output configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            label="No Modify Share Count"
            description="Don't modify share count when downloading"
            checked={config.noModifyShareCount}
            onChange={(checked) => updateConfig({ noModifyShareCount: checked })}
          />

          <Checkbox
            label="No Browse Folder"
            description="Don't browse user folders for additional files"
            checked={config.noBrowseFolder}
            onChange={(checked) => updateConfig({ noBrowseFolder: checked })}
          />

          <Checkbox
            label="No Remove Special Characters"
            description="Keep special characters in file names"
            checked={config.noRemoveSpecialChars}
            onChange={(checked) => updateConfig({ noRemoveSpecialChars: checked })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

