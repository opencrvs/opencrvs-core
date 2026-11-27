/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GitHubPort } from '../github/port'
import type { LocalServerPort } from '../local/port'
import { buildSteps, runSteps, type StepState } from '../plan/apply'
import { renderEnvFile } from '../plan/envFile'
import type { Review } from '../plan/review'

interface Props {
  review: Review
  github?: GitHubPort
  local: LocalServerPort
  onBack: () => void
  // Called after every run, so the environment list can pick up what was created.
  onApplied: () => void
}

function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const ICON: Record<StepState['status'], string> = { pending: '○', running: '…', done: '✓', failed: '✕' }

export function ApplyStep({ review, github, local, onBack, onApplied }: Props) {
  const { plan, files, publicValues } = review
  const steps = useMemo(() => buildSteps({ plan, files, publicValues, github, local }), [plan, files, publicValues, github, local])
  const [states, setStates] = useState<Record<string, StepState>>(() =>
    Object.fromEntries(steps.map((step) => [step.id, { status: 'pending' } as StepState]))
  )
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  async function run(only?: ReadonlySet<string>) {
    setBusy(true)
    await runSteps(steps, (id, state) => setStates((previous) => ({ ...previous, [id]: state })), only)
    setBusy(false)
    onApplied()
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const done = steps.filter((step) => states[step.id]?.status === 'done').length
  const failed = steps.filter((step) => states[step.id]?.status === 'failed')
  const finished = !busy && done + failed.length === steps.length

  return (
    <section className="review" data-testid="apply">
      <h2>Applying “{plan.environment}”</h2>
      <progress max={steps.length} value={done} aria-label="Progress" />
      <p className="app__hint">
        {done} of {steps.length} done{failed.length > 0 && `, ${failed.length} failed`}
      </p>

      <ol className="apply__steps">
        {steps.map((step) => {
          const state = states[step.id] ?? { status: 'pending' }
          return (
            <li key={step.id} className={`apply__step apply__step--${state.status}`}>
              <span aria-hidden="true">{ICON[state.status]}</span> {step.label}
              {state.error && <div className="review__note" role="alert">{state.error}</div>}
            </li>
          )
        })}
      </ol>

      {finished && failed.length === 0 && <p className="banner">Done. “{plan.environment}” is up to date.</p>}
      {finished && failed.length > 0 && (
        <p className="banner banner--error" role="alert">
          {failed.length} step{failed.length === 1 ? '' : 's'} failed. The others went through. Retry the failed ones, or go back.
        </p>
      )}

      <div className="review__actions">
        <button type="button" className="secondary" disabled={busy} onClick={onBack}>
          Back to the form
        </button>
        {failed.length > 0 && !busy && (
          <button type="button" onClick={() => void run(new Set(failed.map((step) => step.id)))}>
            Retry failed
          </button>
        )}
      </div>

      {!busy && steps.length > 0 && (
        <div className="review__downloads">
          <h3>Keep a copy</h3>
          <p className="app__hint">
            GitHub never returns secret values. The first file contains them: keep it private, for example in a password manager.
          </p>
          <button type="button" onClick={() => download(`.env.${plan.environment}`, renderEnvFile(plan), 'text/plain')}>
            Download .env.{plan.environment} (contains secrets)
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => download(`${plan.environment}-answers.json`, JSON.stringify(publicValues, null, 2) + '\n', 'application/json')}
          >
            Download answers without secrets (JSON)
          </button>
        </div>
      )}
    </section>
  )
}
