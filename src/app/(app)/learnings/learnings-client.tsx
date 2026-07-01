'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { addLearning, addRule, deleteLearning, deleteRule } from '@/lib/actions/learnings'
import type { Learning, Rule } from '@/lib/types'
import { Plus, Trash2, BookOpen, Scale, X } from 'lucide-react'
import { formatDate, scoreColor } from '@/lib/utils'

interface Props {
  channelId: string
  learnings: Learning[]
  rules: Rule[]
}

export function LearningsClient({ channelId, learnings: initLearnings, rules: initRules }: Props) {
  const [learnings, setLearnings] = useState(initLearnings)
  const [rules, setRules] = useState(initRules)
  const [activeTab, setActiveTab] = useState<'learnings' | 'rules'>('learnings')
  const [showAddLearning, setShowAddLearning] = useState(false)
  const [showAddRule, setShowAddRule] = useState(false)
  const [loading, setLoading] = useState(false)

  const [learningForm, setLearningForm] = useState({ learning: '', evidence: '', confidence: '75' })
  const [ruleForm, setRuleForm] = useState({ rule_text: '', applies_to: '', confidence: '75' })

  async function handleAddLearning() {
    if (!learningForm.learning.trim()) return
    setLoading(true)
    await addLearning({
      channel_id: channelId,
      learning: learningForm.learning,
      evidence: learningForm.evidence || undefined,
      confidence: parseInt(learningForm.confidence),
    })
    setLearningForm({ learning: '', evidence: '', confidence: '75' })
    setShowAddLearning(false)
    setLoading(false)
    window.location.reload()
  }

  async function handleAddRule() {
    if (!ruleForm.rule_text.trim()) return
    setLoading(true)
    await addRule({
      channel_id: channelId,
      rule_text: ruleForm.rule_text,
      applies_to: ruleForm.applies_to || undefined,
      confidence: parseInt(ruleForm.confidence),
    })
    setRuleForm({ rule_text: '', applies_to: '', confidence: '75' })
    setShowAddRule(false)
    setLoading(false)
    window.location.reload()
  }

  async function handleDeleteLearning(id: string) {
    await deleteLearning(id)
    setLearnings(prev => prev.filter(l => l.id !== id))
  }

  async function handleDeleteRule(id: string) {
    await deleteRule(id)
    setRules(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['learnings', 'rules'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab === 'learnings' ? `Learnings (${learnings.length})` : `Rules (${rules.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'learnings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddLearning(!showAddLearning)}>
              <Plus className="h-4 w-4" /> Add Learning
            </Button>
          </div>

          {showAddLearning && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Learning</CardTitle>
                  <button onClick={() => setShowAddLearning(false)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Learning</Label>
                  <Textarea value={learningForm.learning} onChange={e => setLearningForm(p => ({ ...p, learning: e.target.value }))} rows={2} placeholder="What have you learned?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Evidence</Label>
                    <Input value={learningForm.evidence} onChange={e => setLearningForm(p => ({ ...p, evidence: e.target.value }))} placeholder="e.g. 3 videos confirmed this" />
                  </div>
                  <div>
                    <Label>Confidence (0-100)</Label>
                    <Input type="number" value={learningForm.confidence} onChange={e => setLearningForm(p => ({ ...p, confidence: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddLearning} loading={loading}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddLearning(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {learnings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No learnings yet.</p>
                <p className="text-xs text-zinc-500 mt-1">Analyse experiments to generate learnings automatically.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {learnings.map(l => (
                <Card key={l.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-100 leading-relaxed">{l.learning}</p>
                        {l.evidence && <p className="text-xs text-zinc-500 mt-1.5">Evidence: {l.evidence}</p>}
                        <p className="text-xs text-zinc-600 mt-1">{formatDate(l.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {l.confidence != null && (
                          <div className="text-center">
                            <p className={`text-sm font-bold ${scoreColor(l.confidence)}`}>{l.confidence}</p>
                            <p className="text-xs text-zinc-600">conf</p>
                          </div>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleDeleteLearning(l.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddRule(!showAddRule)}>
              <Plus className="h-4 w-4" /> Add Rule
            </Button>
          </div>

          {showAddRule && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Rule</CardTitle>
                  <button onClick={() => setShowAddRule(false)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Rule</Label>
                  <Textarea value={ruleForm.rule_text} onChange={e => setRuleForm(p => ({ ...p, rule_text: e.target.value }))} rows={2} placeholder="e.g. Comparison videos outperform single-tool reviews for affiliate conversion." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Applies To</Label>
                    <Input value={ruleForm.applies_to} onChange={e => setRuleForm(p => ({ ...p, applies_to: e.target.value }))} placeholder="e.g. content, scoring, thumbnails" />
                  </div>
                  <div>
                    <Label>Confidence (0-100)</Label>
                    <Input type="number" value={ruleForm.confidence} onChange={e => setRuleForm(p => ({ ...p, confidence: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddRule} loading={loading}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddRule(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Scale className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No rules yet.</p>
                <p className="text-xs text-zinc-500 mt-1">Rules shape how future opportunities are scored and prioritised.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map(r => (
                <Card key={r.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-100 leading-relaxed">{r.rule_text}</p>
                        {r.applies_to && (
                          <span className="inline-block mt-1.5 text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                            {r.applies_to}
                          </span>
                        )}
                        <p className="text-xs text-zinc-600 mt-1.5">{formatDate(r.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {r.confidence != null && (
                          <div className="text-center">
                            <p className={`text-sm font-bold ${scoreColor(r.confidence)}`}>{r.confidence}</p>
                            <p className="text-xs text-zinc-600">conf</p>
                          </div>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleDeleteRule(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
