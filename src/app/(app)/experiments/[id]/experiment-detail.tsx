'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  updateExperimentActuals,
  analyseExperiment,
  saveLearningFromExperiment,
  saveRuleFromExperiment
} from '@/lib/actions/experiments'
import type { Experiment, Opportunity, ProductionPack } from '@/lib/types'
import { ArrowLeft, Sparkles, CheckCircle, BookOpen, Scale } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ExperimentWithRelations extends Experiment {
  opportunities: Opportunity
  production_packs: ProductionPack | null
}

interface Props {
  experiment: ExperimentWithRelations
  channelId: string
}

export function ExperimentDetail({ experiment: initial, channelId }: Props) {
  const [exp, setExp] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSaveLearning, setShowSaveLearning] = useState(false)
  const [showSaveRule, setShowSaveRule] = useState(false)
  const router = useRouter()

  const [actuals, setActuals] = useState({
    hypothesis: exp.hypothesis ?? '',
    predicted_views: exp.predicted_views?.toString() ?? '',
    predicted_ctr: exp.predicted_ctr?.toString() ?? '',
    predicted_retention: exp.predicted_retention?.toString() ?? '',
    predicted_affiliate_revenue: exp.predicted_affiliate_revenue?.toString() ?? '',
    actual_views: exp.actual_views?.toString() ?? '',
    actual_ctr: exp.actual_ctr?.toString() ?? '',
    actual_retention: exp.actual_retention?.toString() ?? '',
    actual_affiliate_revenue: exp.actual_affiliate_revenue?.toString() ?? '',
  })

  const [learningForm, setLearningForm] = useState({
    learning: exp.learning_summary?.split('\n')[0] ?? '',
    evidence: '',
    confidence: '75',
  })

  const [ruleForm, setRuleForm] = useState({
    rule_text: '',
    applies_to: 'content',
    confidence: '75',
  })

  async function handleSaveActuals() {
    setLoading('actuals')
    setError(null)
    try {
      await updateExperimentActuals(exp.id, {
        hypothesis: actuals.hypothesis,
        predicted_views: actuals.predicted_views ? parseInt(actuals.predicted_views) : undefined,
        predicted_ctr: actuals.predicted_ctr ? parseFloat(actuals.predicted_ctr) : undefined,
        predicted_retention: actuals.predicted_retention ? parseFloat(actuals.predicted_retention) : undefined,
        predicted_affiliate_revenue: actuals.predicted_affiliate_revenue ? parseFloat(actuals.predicted_affiliate_revenue) : undefined,
        actual_views: actuals.actual_views ? parseInt(actuals.actual_views) : undefined,
        actual_ctr: actuals.actual_ctr ? parseFloat(actuals.actual_ctr) : undefined,
        actual_retention: actuals.actual_retention ? parseFloat(actuals.actual_retention) : undefined,
        actual_affiliate_revenue: actuals.actual_affiliate_revenue ? parseFloat(actuals.actual_affiliate_revenue) : undefined,
      })
      setSuccess('Saved!')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setLoading(null)
    }
  }

  async function handleAnalyse() {
    setLoading('analyse')
    setError(null)
    const result = await analyseExperiment(exp.id)
    if (result.success) {
      setSuccess('Analysis complete!')
      router.refresh()
    } else {
      setError(result.error ?? 'Analysis failed')
    }
    setLoading(null)
  }

  async function handleSaveLearning() {
    setLoading('learning')
    setError(null)
    try {
      await saveLearningFromExperiment(
        exp.id,
        channelId,
        learningForm.learning,
        learningForm.evidence,
        parseInt(learningForm.confidence)
      )
      setSuccess('Learning saved!')
      setShowSaveLearning(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save learning')
    } finally {
      setLoading(null)
    }
  }

  async function handleSaveRule() {
    setLoading('rule')
    setError(null)
    try {
      await saveRuleFromExperiment(
        channelId,
        ruleForm.rule_text,
        ruleForm.applies_to,
        parseInt(ruleForm.confidence)
      )
      setSuccess('Rule saved!')
      setShowSaveRule(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save rule')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/experiments" className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{exp.opportunities?.title ?? 'Experiment'}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Experiment</p>
        </div>
      </div>

      {/* Hypothesis */}
      <Card>
        <CardHeader><CardTitle>Hypothesis & Predictions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hypothesis</Label>
            <Textarea
              value={actuals.hypothesis}
              onChange={e => setActuals(p => ({ ...p, hypothesis: e.target.value }))}
              rows={2}
              placeholder="What do you expect this video to achieve and why?"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'predicted_views' as const, label: 'Predicted Views' },
              { key: 'predicted_ctr' as const, label: 'Predicted CTR %' },
              { key: 'predicted_retention' as const, label: 'Predicted Ret. %' },
              { key: 'predicted_affiliate_revenue' as const, label: 'Predicted Rev. £' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={actuals[key]}
                  onChange={e => setActuals(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actuals */}
      <Card>
        <CardHeader><CardTitle>Actual Results</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'actual_views' as const, label: 'Actual Views' },
              { key: 'actual_ctr' as const, label: 'Actual CTR %' },
              { key: 'actual_retention' as const, label: 'Actual Ret. %' },
              { key: 'actual_affiliate_revenue' as const, label: 'Actual Rev. £' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={actuals[key]}
                  onChange={e => setActuals(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}

          <Button onClick={handleSaveActuals} loading={loading === 'actuals'} size="sm">
            Save results
          </Button>
        </CardContent>
      </Card>

      {/* Performance comparison */}
      {exp.actual_views != null && exp.predicted_views != null && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Views', pred: exp.predicted_views, actual: exp.actual_views, fmt: formatNumber },
            { label: 'CTR', pred: exp.predicted_ctr, actual: exp.actual_ctr, fmt: (n: number | null) => n != null ? `${n}%` : '—' },
            { label: 'Retention', pred: exp.predicted_retention, actual: exp.actual_retention, fmt: (n: number | null) => n != null ? `${n}%` : '—' },
            { label: 'Revenue', pred: exp.predicted_affiliate_revenue, actual: exp.actual_affiliate_revenue, fmt: formatCurrency },
          ].map(({ label, pred, actual, fmt }) => {
            const diff = pred && actual ? ((actual - pred) / pred * 100) : null
            return (
              <Card key={label}>
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{label}</p>
                  <p className="text-base font-bold text-zinc-100">{fmt(actual as number)}</p>
                  {pred != null && <p className="text-xs text-zinc-500">pred: {fmt(pred as number)}</p>}
                  {diff != null && (
                    <p className={`text-xs font-medium mt-0.5 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Analysis Results */}
      {(exp.result_summary || exp.learning_summary) && (
        <Card>
          <CardHeader><CardTitle>Performance Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {exp.result_summary && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Result Summary</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{exp.result_summary}</p>
              </div>
            )}
            {exp.learning_summary && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Learning Summary</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{exp.learning_summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyse} loading={loading === 'analyse'} disabled={!actuals.actual_views}>
              <Sparkles className="h-4 w-4" />
              Analyse Performance
            </Button>
            <Button variant="secondary" onClick={() => setShowSaveLearning(!showSaveLearning)}>
              <BookOpen className="h-4 w-4" />
              Save Learning
            </Button>
            <Button variant="secondary" onClick={() => setShowSaveRule(!showSaveRule)}>
              <Scale className="h-4 w-4" />
              Save Rule
            </Button>
          </div>

          {showSaveLearning && (
            <div className="border border-zinc-700 rounded-lg p-4 space-y-3 bg-zinc-800/30">
              <p className="text-xs font-medium text-zinc-300">Save Learning to Knowledge Base</p>
              <div>
                <Label>Learning</Label>
                <Textarea
                  value={learningForm.learning}
                  onChange={e => setLearningForm(p => ({ ...p, learning: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Comparison videos outperform single-tool reviews..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Evidence</Label>
                  <Input
                    value={learningForm.evidence}
                    onChange={e => setLearningForm(p => ({ ...p, evidence: e.target.value }))}
                    placeholder="e.g. 3 videos confirmed this"
                  />
                </div>
                <div>
                  <Label>Confidence (0-100)</Label>
                  <Input
                    type="number"
                    value={learningForm.confidence}
                    onChange={e => setLearningForm(p => ({ ...p, confidence: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveLearning} loading={loading === 'learning'}>
                  <CheckCircle className="h-3.5 w-3.5" /> Save Learning
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSaveLearning(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {showSaveRule && (
            <div className="border border-zinc-700 rounded-lg p-4 space-y-3 bg-zinc-800/30">
              <p className="text-xs font-medium text-zinc-300">Save Rule</p>
              <div>
                <Label>Rule</Label>
                <Textarea
                  value={ruleForm.rule_text}
                  onChange={e => setRuleForm(p => ({ ...p, rule_text: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Comparison videos outperform single-tool reviews for affiliate conversion."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Applies To</Label>
                  <Input
                    value={ruleForm.applies_to}
                    onChange={e => setRuleForm(p => ({ ...p, applies_to: e.target.value }))}
                    placeholder="e.g. content, scoring, thumbnails"
                  />
                </div>
                <div>
                  <Label>Confidence (0-100)</Label>
                  <Input
                    type="number"
                    value={ruleForm.confidence}
                    onChange={e => setRuleForm(p => ({ ...p, confidence: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveRule} loading={loading === 'rule'}>
                  <CheckCircle className="h-3.5 w-3.5" /> Save Rule
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSaveRule(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
