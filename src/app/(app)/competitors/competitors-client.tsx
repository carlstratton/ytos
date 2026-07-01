'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { addCompetitor, updateCompetitor, deleteCompetitor } from '@/lib/actions/competitors'
import type { Competitor } from '@/lib/types'
import { Plus, Pencil, Trash2, ExternalLink, X, Check } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Props {
  channelId: string
  competitors: Competitor[]
}

const emptyForm = {
  name: '', platform: 'YouTube', url: '', notes: '', average_views: '', upload_frequency: ''
}

export function CompetitorsClient({ channelId, competitors: initial }: Props) {
  const [competitors, setCompetitors] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)
    try {
      await addCompetitor({
        channel_id: channelId,
        name: form.name,
        platform: form.platform,
        url: form.url || undefined,
        notes: form.notes || undefined,
        average_views: form.average_views ? parseInt(form.average_views) : undefined,
        upload_frequency: form.upload_frequency || undefined,
      })
      setForm(emptyForm)
      setShowAdd(false)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string) {
    setLoading(true)
    try {
      await updateCompetitor(id, {
        name: editForm.name,
        notes: editForm.notes,
        url: editForm.url,
        average_views: editForm.average_views ? parseInt(editForm.average_views) : undefined,
        upload_frequency: editForm.upload_frequency,
      })
      setEditingId(null)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this competitor?')) return
    await deleteCompetitor(id)
    setCompetitors(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(c: Competitor) {
    setEditingId(c.id)
    setEditForm({
      name: c.name,
      platform: c.platform,
      url: c.url ?? '',
      notes: c.notes ?? '',
      average_views: c.average_views?.toString() ?? '',
      upload_frequency: c.upload_frequency ?? '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">
          <Plus className="h-4 w-4" />
          Add competitor
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>New Competitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Channel Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AI Advantage" />
              </div>
              <div>
                <Label>Platform</Label>
                <Input value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Channel URL</Label>
              <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/@channel" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Avg Views per Video</Label>
                <Input type="number" value={form.average_views} onChange={e => setForm(p => ({ ...p, average_views: e.target.value }))} placeholder="50000" />
              </div>
              <div>
                <Label>Upload Frequency</Label>
                <Input value={form.upload_frequency} onChange={e => setForm(p => ({ ...p, upload_frequency: e.target.value }))} placeholder="e.g. 3x per week" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="What are they doing well? What's their angle?" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleAdd} loading={loading} size="sm">Add competitor</Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)} size="sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {competitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-zinc-400">No competitors added yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Add 3–10 competitors to improve your market intelligence reports.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {competitors.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input value={editForm.url} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Avg Views</Label>
                        <Input type="number" value={editForm.average_views} onChange={e => setEditForm(p => ({ ...p, average_views: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Upload Frequency</Label>
                        <Input value={editForm.upload_frequency} onChange={e => setEditForm(p => ({ ...p, upload_frequency: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(c.id)} loading={loading} size="sm">
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)} size="sm">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-zinc-100">{c.name}</p>
                        <span className="text-xs text-zinc-500">{c.platform}</span>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        {c.average_views && <span>{formatNumber(c.average_views)} avg views</span>}
                        {c.upload_frequency && <span>{c.upload_frequency}</span>}
                      </div>
                      {c.notes && <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{c.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
