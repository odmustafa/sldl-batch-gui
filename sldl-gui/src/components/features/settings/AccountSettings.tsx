import React from 'react'
import { Eye, EyeOff, FolderOpen } from 'lucide-react'
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'
import { useSettingsStore } from '../../../stores/settingsStore'

export function AccountSettings() {
  const { config, updateConfig } = useSettingsStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showSpotifySecret, setShowSpotifySecret] = React.useState(false)
  const [showSpotifyToken, setShowSpotifyToken] = React.useState(false)

  const handleSelectDownloadPath = async () => {
    const path = await window.sldl.selectDirectory()
    if (path) {
      updateConfig({ downloadPath: path })
    }
  }

  return (
    <div className="space-y-6">
      {/* Soulseek Account */}
      <Card>
        <CardHeader>
          <CardTitle>Soulseek Account</CardTitle>
          <CardDescription>
            Your Soulseek credentials for connecting to the network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Username"
            placeholder="Your Soulseek username"
            value={config.username}
            onChange={(e) => updateConfig({ username: e.target.value })}
            autoComplete="username"
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your Soulseek password"
              value={config.password}
              onChange={(e) => updateConfig({ password: e.target.value })}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Download Path */}
      <Card>
        <CardHeader>
          <CardTitle>Download Location</CardTitle>
          <CardDescription>
            Where to save downloaded music files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Select download folder..."
              value={config.downloadPath}
              onChange={(e) => updateConfig({ downloadPath: e.target.value })}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleSelectDownloadPath}>
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spotify */}
      <Card>
        <CardHeader>
          <CardTitle>Spotify Integration</CardTitle>
          <CardDescription>
            Connect Spotify to download playlists and liked songs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Client ID"
            placeholder="Spotify application client ID"
            value={config.spotifyId}
            onChange={(e) => updateConfig({ spotifyId: e.target.value })}
          />
          <Input
            label="Client Secret"
            type={showSpotifySecret ? 'text' : 'password'}
            placeholder="Spotify application client secret"
            value={config.spotifySecret}
            onChange={(e) => updateConfig({ spotifySecret: e.target.value })}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowSpotifySecret(!showSpotifySecret)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showSpotifySecret ? 'Hide Spotify client secret' : 'Show Spotify client secret'}
              >
                {showSpotifySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label="Access Token"
            type={showSpotifyToken ? 'text' : 'password'}
            placeholder="Spotify access token (optional)"
            value={config.spotifyToken}
            onChange={(e) => updateConfig({ spotifyToken: e.target.value })}
            helperText="Optional short-lived token; refresh token is preferred for reuse"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowSpotifyToken(!showSpotifyToken)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showSpotifyToken ? 'Hide Spotify access token' : 'Show Spotify access token'}
              >
                {showSpotifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label="Refresh Token"
            placeholder="Spotify refresh token (optional)"
            value={config.spotifyRefresh}
            onChange={(e) => updateConfig({ spotifyRefresh: e.target.value })}
            helperText="Obtain this by completing the OAuth flow"
          />
        </CardContent>
      </Card>

      {/* YouTube */}
      <Card>
        <CardHeader>
          <CardTitle>YouTube Integration</CardTitle>
          <CardDescription>
            API key for reliable playlist retrieval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            label="YouTube Data API Key"
            placeholder="Your YouTube API key"
            value={config.youtubeKey}
            onChange={(e) => updateConfig({ youtubeKey: e.target.value })}
            helperText="Get a key from Google Cloud Console"
          />
        </CardContent>
      </Card>
    </div>
  )
}

