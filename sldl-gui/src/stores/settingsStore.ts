import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SldlConfig,
  Profile,
  createLockedRequiredConditions,
  createLockedPreferredConditions,
  LOCKED_DOWNLOAD_POLICY,
} from '../types/sldl'

function createDefaultConfig(): SldlConfig {
  return {
    // Account
    username: '',
    password: '',
    spotifyId: '',
    spotifySecret: '',
    spotifyToken: '',
    spotifyRefresh: '',
    youtubeKey: '',

    // General
    downloadPath: '',
    inputType: 'auto',
    nameFormat: '',
    albumNameFormat: '',
    maxTracks: 0,
    offset: 0,
    reverse: false,
    concurrentDownloads: 2,

    // File Conditions
    requiredConditions: createLockedRequiredConditions(),
    preferredConditions: createLockedPreferredConditions(),
    strictConditions: LOCKED_DOWNLOAD_POLICY.strictConditions,

    // Search Options
    fastSearch: false,
    desperateSearch: false,
    artistMaybeWrong: false,
    removeFt: false,
    searchTimeout: 6000,
    maxStaleTime: 30000,
    searchesPerTime: 34,
    searchRenewTime: 220,
    searchRenamePattern: '',
    maxRetriesPerTrack: 2,

    // Album Options
    albumMode: false,
    interactiveMode: false,
    albumTrackCount: '',
    minAlbumTrackCount: 0,
    maxAlbumTrackCount: 0,
    albumArtOption: 'default',
    albumArtOnly: false,
    noBrowseFolder: false,
    albumParallelSearch: false,

    // Aggregate Options
    aggregateMode: false,
    minSharesAggregate: 2,
    aggregateLengthTol: 3,
    relaxFiltering: false,

    // Output Options
    writePlaylist: false,
    playlistPath: '',
    writeIndex: true,
    indexPath: '',
    skipExisting: true,
    skipMusicDir: '',
    skipNotFound: false,
    m3uPath: '',
    useM3uIndex: false,
    failedLogPath: '',
    noModifyShareCount: false,
    noRemoveSpecialChars: false,

    // Advanced
    listenPort: 49998,
    connectTimeout: 20000,
    useYtdlp: false,
    ytdlpArgument: '',
    regex: [],
    onComplete: [],

    // Debug
    verbose: false,
    noProgress: false,
    printOption: 'none',
    logFilePath: '',
  }
}

function enforceLockedDownloadPolicy(config: SldlConfig): SldlConfig {
  return {
    ...config,
    requiredConditions: createLockedRequiredConditions(),
    preferredConditions: createLockedPreferredConditions(),
    strictConditions: LOCKED_DOWNLOAD_POLICY.strictConditions,
  }
}

let profileIdCounter = 0

interface SettingsState {
  config: SldlConfig
  profiles: Profile[]
  activeProfile: string
  hasUnsavedChanges: boolean

  updateConfig: (updates: Partial<SldlConfig>) => void
  resetConfig: () => void
  saveConfig: () => Promise<void>
  loadConfig: (path?: string) => Promise<void>

  createProfile: (name: string) => void
  deleteProfile: (id: string) => void
  duplicateProfile: (id: string, newName: string) => void
  setActiveProfile: (id: string) => void
}

function syncActiveProfileConfig(profiles: Profile[], activeProfile: string, config: SldlConfig): Profile[] {
  const nextConfig = enforceLockedDownloadPolicy(config)

  return profiles.map((profile) =>
    profile.id === activeProfile
      ? { ...profile, config: nextConfig, updatedAt: new Date() }
      : profile
  )
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      config: createDefaultConfig(),
      profiles: [
        {
          id: 'default',
          name: 'Default',
          config: createDefaultConfig(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      activeProfile: 'default',
      hasUnsavedChanges: false,

      updateConfig: (updates) => set((state) => {
        const nextConfig = enforceLockedDownloadPolicy({ ...state.config, ...updates })

        return {
          config: nextConfig,
          profiles: syncActiveProfileConfig(state.profiles, state.activeProfile, nextConfig),
          hasUnsavedChanges: true,
        }
      }),

      resetConfig: () => set((state) => {
        const nextConfig = createDefaultConfig()

        return {
          config: nextConfig,
          profiles: syncActiveProfileConfig(state.profiles, state.activeProfile, nextConfig),
          hasUnsavedChanges: true,
        }
      }),

      saveConfig: async () => {
        const { config, profiles, activeProfile } = get()
        const nextConfig = enforceLockedDownloadPolicy(config)

        // Update the active profile with current config
        const updatedProfiles = profiles.map(p =>
          p.id === activeProfile
            ? { ...p, config: nextConfig, updatedAt: new Date() }
            : p
        )

        // Save to file via IPC
        await window.sldl.saveConfig(nextConfig as unknown as Record<string, unknown>)

        set({
          config: nextConfig,
          profiles: updatedProfiles,
          hasUnsavedChanges: false
        })
      },

      loadConfig: async (path?: string) => {
        const config = await window.sldl.loadConfig(path) as Partial<SldlConfig>
        set((state) => {
          const nextConfig = enforceLockedDownloadPolicy({ ...createDefaultConfig(), ...config })

          return {
            config: nextConfig,
            profiles: syncActiveProfileConfig(state.profiles, state.activeProfile, nextConfig),
            hasUnsavedChanges: false,
          }
        })
      },

      createProfile: (name) => set((state) => {
        const id = `profile-${++profileIdCounter}`
        const defaultConfig = createDefaultConfig()
        const newProfile: Profile = {
          id,
          name,
          config: defaultConfig,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return {
          profiles: [...state.profiles, newProfile],
          activeProfile: id,
          config: defaultConfig,
          hasUnsavedChanges: true,
        }
      }),

      deleteProfile: (id) => set((state) => {
        if (state.profiles.length <= 1) return state

        const newProfiles = state.profiles.filter(p => p.id !== id)
        const newActive = state.activeProfile === id
          ? newProfiles[0].id
          : state.activeProfile
        const activeConfig = enforceLockedDownloadPolicy(
          newProfiles.find(p => p.id === newActive)?.config || createDefaultConfig()
        )

        return {
          profiles: newProfiles,
          activeProfile: newActive,
          config: activeConfig,
        }
      }),

      duplicateProfile: (id, newName) => set((state) => {
        const source = state.profiles.find(p => p.id === id)
        if (!source) return state

        const newId = `profile-${++profileIdCounter}`
        const newProfile: Profile = {
          id: newId,
          name: newName,
          config: enforceLockedDownloadPolicy({ ...source.config }),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        return {
          profiles: [...state.profiles, newProfile],
        }
      }),

      setActiveProfile: (id) => set((state) => {
        const profile = state.profiles.find(p => p.id === id)
        if (!profile) return state

        return {
          activeProfile: id,
          config: enforceLockedDownloadPolicy({ ...profile.config }),
          hasUnsavedChanges: false,
        }
      }),
    }),
    {
      name: 'sldl-settings',
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<SettingsState> | undefined
        const persistedProfiles = typedState?.profiles ?? currentState.profiles
        const activeProfile = typedState?.activeProfile ?? currentState.activeProfile
        const config = enforceLockedDownloadPolicy({
          ...createDefaultConfig(),
          ...(typedState?.config ?? currentState.config),
        })
        const profiles = persistedProfiles.map((profile) => ({
          ...profile,
          config: enforceLockedDownloadPolicy({ ...createDefaultConfig(), ...profile.config }),
        }))

        return {
          ...currentState,
          ...typedState,
          config,
          profiles: syncActiveProfileConfig(profiles, activeProfile, config),
          activeProfile,
        }
      },
      partialize: (state) => ({
        config: state.config,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
      }),
    }
  )
)

