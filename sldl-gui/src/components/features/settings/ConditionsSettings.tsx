import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui'
import { LOCKED_DOWNLOAD_POLICY } from '../../../types/sldl'

export function ConditionsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Locked Download Policy</CardTitle>
          <CardDescription>
            This build is intentionally locked to strict MP3 downloads so search results stay consistent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Format:</span> {LOCKED_DOWNLOAD_POLICY.format.toUpperCase()} only</li>
            <li><span className="font-medium text-foreground">Bitrate:</span> {LOCKED_DOWNLOAD_POLICY.minBitrate}–{LOCKED_DOWNLOAD_POLICY.maxBitrate} kbps</li>
            <li><span className="font-medium text-foreground">Strict mode:</span> always enabled</li>
          </ul>
          <p>
            Files that are not MP3 or cannot verify a bitrate inside this range are rejected automatically.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why these controls were removed</CardTitle>
          <CardDescription>
            The GUI now uses one fixed filtering policy for every download instead of exposing editable file-condition inputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This prevents accidental drift between saved settings and the command actually sent to <code>sldl</code>.
          </p>
          <p>
            Save, Import, Reset, and existing local profiles are normalized back to this locked policy automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

