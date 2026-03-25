import { Input, Checkbox, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'
import { LOCKED_DOWNLOAD_POLICY } from '../../../types/sldl'

export function ConditionsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Locked Download Policy</CardTitle>
          <CardDescription>
            These download filters are enforced automatically for every run and can&apos;t be changed in the GUI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Format"
              value={LOCKED_DOWNLOAD_POLICY.format}
              helperText="Required and preferred searches are locked to MP3"
              disabled
              readOnly
            />
            <Input
              label="Length Tolerance"
              value={String(LOCKED_DOWNLOAD_POLICY.lengthTolerance)}
              helperText="Tracks must be within 2 seconds of the expected Spotify/runtime length"
              disabled
              readOnly
            />
            <Input
              label="Min Bitrate"
              value={String(LOCKED_DOWNLOAD_POLICY.minBitrate)}
              helperText="kbps"
              disabled
              readOnly
            />
            <Input
              label="Max Bitrate"
              value={String(LOCKED_DOWNLOAD_POLICY.maxBitrate)}
              helperText="kbps"
              disabled
              readOnly
            />
          </div>

          <Checkbox
            label="Strict Conditions"
            description="Missing metadata is rejected instead of being accepted by default"
            checked={LOCKED_DOWNLOAD_POLICY.strictConditions}
            disabled
          />

          <p className="text-sm text-muted-foreground">
            Saved profiles, imported configs, and download launches are all normalized back to this locked policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

