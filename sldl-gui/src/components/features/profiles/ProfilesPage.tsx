import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Edit2 } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui'
import { useSettingsStore } from '../../../stores/settingsStore'

export function ProfilesPage() {
  const { profiles, activeProfile, setActiveProfile, createProfile, deleteProfile, duplicateProfile } = useSettingsStore()
  const [newProfileName, setNewProfileName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim())
      setNewProfileName('')
    }
  }

  const handleDeleteProfile = (id: string) => {
    if (profiles.length > 1 && confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(id)
    }
  }

  const handleDuplicateProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id)
    if (profile) {
      duplicateProfile(id, `${profile.name} (Copy)`)
    }
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleSaveEdit = (_id: string) => {
    // Would update profile name here
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Profiles"
        description="Manage configuration profiles for different use cases"
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Create new profile */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Profile</CardTitle>
            <CardDescription>
              Create a new configuration profile with default settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Profile name..."
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
                className="flex-1"
              />
              <Button onClick={handleCreateProfile} disabled={!newProfileName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile
            const isEditing = editingId === profile.id

            return (
              <Card
                key={profile.id}
                className={`transition-colors ${isActive ? 'border-primary ring-1 ring-primary' : ''}`}
              >
                <CardHeader className="pb-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(profile.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{profile.name}</CardTitle>
                      {isActive && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  )}
                  <CardDescription className="text-xs">
                    Created {new Date(profile.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 gap-2">
                  {!isActive && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveProfile(profile.id)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStartEdit(profile.id, profile.name)}
                    title="Rename"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicateProfile(profile.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteProfile(profile.id)}
                    disabled={profiles.length <= 1}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

