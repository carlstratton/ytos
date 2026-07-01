'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateChannel, createChannel } from '@/lib/actions/channel'
import type { Channel } from '@/lib/types'
import { CheckCircle } from 'lucide-react'

interface Props {
  channel: Channel | null
}

export function ChannelForm({ channel }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: channel?.name ?? 'AI Tools Lab',
    platform: channel?.platform ?? 'YouTube',
    niche: channel?.niche ?? '',
    target_audience: channel?.target_audience ?? '',
    primary_goal: channel?.primary_goal ?? 'Build a sellable affiliate-led YouTube asset',
    revenue_goal: channel?.revenue_goal ?? '£5,000/month within six months',
    publishing_cadence: channel?.publishing_cadence ?? '5–7 videos per week',
  })

  function handleChange(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (channel) {
        await updateChannel(channel.id, form)
      } else {
        await createChannel(form)
      }
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Channel Name</Label>
            <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" value={form.platform} onChange={e => handleChange('platform', e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="niche">Niche</Label>
          <Input
            id="niche"
            value={form.niche}
            onChange={e => handleChange('niche', e.target.value)}
            placeholder="e.g. AI tools for productivity, creators, and small businesses"
          />
        </div>

        <div>
          <Label htmlFor="target_audience">Target Audience</Label>
          <Textarea
            id="target_audience"
            value={form.target_audience}
            onChange={e => handleChange('target_audience', e.target.value)}
            rows={3}
            placeholder="e.g. Professionals, creators, founders, and operators who want to save time with AI"
          />
        </div>

        <div>
          <Label htmlFor="primary_goal">Primary Goal</Label>
          <Textarea
            id="primary_goal"
            value={form.primary_goal}
            onChange={e => handleChange('primary_goal', e.target.value)}
            rows={2}
            placeholder="e.g. Build a sellable affiliate-led YouTube asset"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="revenue_goal">Revenue Goal</Label>
            <Input
              id="revenue_goal"
              value={form.revenue_goal}
              onChange={e => handleChange('revenue_goal', e.target.value)}
              placeholder="e.g. £5,000/month within six months"
            />
          </div>
          <div>
            <Label htmlFor="publishing_cadence">Publishing Cadence</Label>
            <Input
              id="publishing_cadence"
              value={form.publishing_cadence}
              onChange={e => handleChange('publishing_cadence', e.target.value)}
              placeholder="e.g. 5–7 videos per week"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} loading={saving}>
            {channel ? 'Save changes' : 'Create channel'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
