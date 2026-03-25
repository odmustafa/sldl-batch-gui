import React, { useState } from 'react'
import { Search, Music, Disc3, Users, FolderUp } from 'lucide-react'
import { Button, Input, Select, Checkbox } from '../../ui'
import { InputType } from '../../../types/sldl'

interface DownloadInputProps {
  onStartDownload: (input: string, options: DownloadOptions) => void
  disabled?: boolean
}

export interface DownloadOptions {
  inputType: InputType
  albumMode: boolean
  aggregateMode: boolean
  interactiveMode: boolean
}

const inputTypeOptions = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'string', label: 'Search String' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'bandcamp', label: 'Bandcamp' },
  { value: 'csv', label: 'CSV File' },
  { value: 'list', label: 'List File' },
  { value: 'musicbrainz', label: 'MusicBrainz' },
  { value: 'soulseek', label: 'Soulseek Link' },
]

export function DownloadInput({ onStartDownload, disabled }: DownloadInputProps) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<InputType>('auto')
  const [albumMode, setAlbumMode] = useState(false)
  const [aggregateMode, setAggregateMode] = useState(false)
  const [interactiveMode, setInteractiveMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    onStartDownload(input.trim(), {
      inputType,
      albumMode,
      aggregateMode,
      interactiveMode,
    })
  }

  const handleBrowseFile = async () => {
    const filePath = await window.sldl.selectFile([
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ])
    if (filePath) {
      setInput(filePath)
      if (filePath.endsWith('.csv')) {
        setInputType('csv')
      } else if (filePath.endsWith('.txt')) {
        setInputType('list')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter URL, search query, or file path..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowseFile}
          disabled={disabled}
          title="Browse for file"
        >
          <FolderUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select
          options={inputTypeOptions}
          value={inputType}
          onChange={(v) => setInputType(v as InputType)}
          className="w-40"
          disabled={disabled}
        />
        
        <div className="flex items-center gap-4">
          <Checkbox
            label="Album"
            checked={albumMode}
            onChange={setAlbumMode}
            disabled={disabled}
          />
          <Checkbox
            label="Aggregate"
            checked={aggregateMode}
            onChange={setAggregateMode}
            disabled={disabled}
          />
          <Checkbox
            label="Interactive"
            checked={interactiveMode}
            onChange={setInteractiveMode}
            disabled={disabled || !albumMode}
          />
        </div>

        <Button type="submit" disabled={disabled || !input.trim()} className="ml-auto">
          <Music className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !input.trim()}
          onClick={() => {
            setAlbumMode(false)
            setAggregateMode(false)
            onStartDownload(input.trim(), { inputType, albumMode: false, aggregateMode: false, interactiveMode: false })
          }}
        >
          <Music className="h-3 w-3 mr-1" />
          Song
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !input.trim()}
          onClick={() => {
            setAlbumMode(true)
            setAggregateMode(false)
            onStartDownload(input.trim(), { inputType, albumMode: true, aggregateMode: false, interactiveMode })
          }}
        >
          <Disc3 className="h-3 w-3 mr-1" />
          Album
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !input.trim()}
          onClick={() => {
            setAlbumMode(false)
            setAggregateMode(true)
            onStartDownload(input.trim(), { inputType, albumMode: false, aggregateMode: true, interactiveMode: false })
          }}
        >
          <Users className="h-3 w-3 mr-1" />
          All Songs by Artist
        </Button>
      </div>
    </form>
  )
}

