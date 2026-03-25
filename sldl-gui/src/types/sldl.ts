// Types for sldl configuration and state

export type InputType = 'csv' | 'youtube' | 'spotify' | 'bandcamp' | 'string' | 'list' | 'musicbrainz' | 'soulseek' | 'auto'

export type DownloadMode = 'normal' | 'album' | 'aggregate' | 'album-aggregate'

export type AlbumArtOption = 'default' | 'largest' | 'most'

export type PrintOption = 'none' | 'tracks' | 'tracks-full' | 'results' | 'results-full' | 'link' | 'json' | 'json-all' | 'index' | 'index-failed'

export interface FileConditions {
  formats: string[]
  lengthTolerance?: number
  minBitrate?: number
  maxBitrate?: number
  minSampleRate?: number
  maxSampleRate?: number
  minBitDepth?: number
  maxBitDepth?: number
  strictTitle?: boolean
  strictArtist?: boolean
  strictAlbum?: boolean
  bannedUsers: string[]
}

export interface SldlConfig {
  // Account
  username: string
  password: string
  spotifyId: string
  spotifySecret: string
  spotifyToken: string
  spotifyRefresh: string
  youtubeKey: string

  // General
  downloadPath: string
  inputType: InputType
  nameFormat: string
  albumNameFormat: string
  maxTracks: number
  offset: number
  reverse: boolean
  concurrentDownloads: number

  // File Conditions
  requiredConditions: FileConditions
  preferredConditions: FileConditions
  strictConditions: boolean

  // Search Options
  fastSearch: boolean
  desperateSearch: boolean
  artistMaybeWrong: boolean
  removeFt: boolean
  searchTimeout: number
  maxStaleTime: number
  searchesPerTime: number
  searchRenewTime: number
  searchRenamePattern: string
  maxRetriesPerTrack: number

  // Album Options
  albumMode: boolean
  interactiveMode: boolean
  albumTrackCount: string
  minAlbumTrackCount: number
  maxAlbumTrackCount: number
  albumArtOption: AlbumArtOption
  albumArtOnly: boolean
  noBrowseFolder: boolean
  albumParallelSearch: boolean

  // Aggregate Options
  aggregateMode: boolean
  minSharesAggregate: number
  aggregateLengthTol: number
  relaxFiltering: boolean

  // Output Options
  writePlaylist: boolean
  playlistPath: string
  writeIndex: boolean
  indexPath: string
  skipExisting: boolean
  skipMusicDir: string
  skipNotFound: boolean
  m3uPath: string
  useM3uIndex: boolean
  failedLogPath: string
  noModifyShareCount: boolean
  noRemoveSpecialChars: boolean

  // Advanced
  listenPort: number
  connectTimeout: number
  useYtdlp: boolean
  ytdlpArgument: string
  regex: string[]
  onComplete: string[]

  // Debug
  verbose: boolean
  noProgress: boolean
  printOption: PrintOption
  logFilePath: string
}

export interface DownloadItem {
  id: string
  input: string
  inputType: InputType
  mode: DownloadMode
  status: 'queued' | 'searching' | 'downloading' | 'completed' | 'failed' | 'cancelled'
  progress: number
  currentFile?: string
  error?: string
  startedAt?: Date
  completedAt?: Date
}

export interface ConsoleMessage {
  id: string
  type: 'stdout' | 'stderr' | 'info' | 'error'
  content: string
  timestamp: Date
}

export interface Profile {
  id: string
  name: string
  config: SldlConfig
  createdAt: Date
  updatedAt: Date
}

export const LOCKED_DOWNLOAD_POLICY = {
  format: 'mp3',
  lengthTolerance: 2,
  minBitrate: 319,
  maxBitrate: 321,
  strictConditions: true,
} as const

export function createLockedRequiredConditions(): FileConditions {
  return {
    formats: [LOCKED_DOWNLOAD_POLICY.format],
    lengthTolerance: LOCKED_DOWNLOAD_POLICY.lengthTolerance,
    minBitrate: LOCKED_DOWNLOAD_POLICY.minBitrate,
    maxBitrate: LOCKED_DOWNLOAD_POLICY.maxBitrate,
    bannedUsers: [],
  }
}

export function createLockedPreferredConditions(): FileConditions {
  return {
    formats: [LOCKED_DOWNLOAD_POLICY.format],
    lengthTolerance: LOCKED_DOWNLOAD_POLICY.lengthTolerance,
    minBitrate: LOCKED_DOWNLOAD_POLICY.minBitrate,
    maxBitrate: LOCKED_DOWNLOAD_POLICY.maxBitrate,
    bannedUsers: [],
  }
}

export const DEFAULT_REQUIRED_CONDITIONS: FileConditions = createLockedRequiredConditions()

export const DEFAULT_PREFERRED_CONDITIONS: FileConditions = createLockedPreferredConditions()

