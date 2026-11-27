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
import { Survey } from 'survey-react-ui'
import { bindings, scanned } from '../bindings/load'
import { loadSnapshot, type Sources } from '../bindings/snapshot'
import { applySnapshot, prefillRepositoryValues, resetEnvironment } from '../form/apply'
import { activeValues, withoutSecrets } from '../form/active'
import { isShown } from '../form/menu'
import { answersWithoutSecrets, isSecret } from '../form/secrets'
import { setGitHubAvailable } from '../form/secrets'
import { applyEnvironmentSources, createSurvey } from '../form/survey'
import { isGitHubAvailable } from '../github/availability'
import { MockGitHub, SCENARIOS, type Scenario } from '../github/mock'
import type { GitHubPort } from '../github/port'
import type { LocalServerPort } from '../local/port'
import { prepareReview, type Review } from '../plan/review'
import { AppHeader } from './AppHeader'
import { ApplyStep } from './ApplyStep'
import { EnvironmentStatus, type Status } from './EnvironmentStatus'
import { ReviewStep } from './ReviewStep'

interface Props {
  // Absent when GitHub was skipped.
  github?: GitHubPort
  local: LocalServerPort
  label: string
  warnings: string[]
  onChangeConnection: () => void
}

export function FormStep({ github, local, label, warnings, onChangeConnection }: Props) {
  // GitHub counts as available until the dev server says otherwise (see the effect below). When it is not,
  // everything works as if GitHub had been skipped, and no secret is asked for or generated.
  const [githubReady, setGithubReady] = useState(Boolean(github))
  const activeGithub = githubReady ? github : undefined
  const sources = useMemo<Sources>(() => ({ github: activeGithub, local }), [activeGithub, local])
  const [survey] = useState(() => createSurvey(Boolean(github)))
  // Only the mock has scenarios to switch between.
  const mock = github instanceof MockGitHub ? github : undefined
  const [scenario, setScenario] = useState<Scenario>(mock?.scenario ?? 'existing')
  const [sourceError, setSourceError] = useState<string>()
  const [screen, setScreen] = useState<{ kind: 'form' } | { kind: 'review'; review: Review } | { kind: 'apply'; review: Review }>({ kind: 'form' })
  const [preparing, setPreparing] = useState(false)
  const [reviewError, setReviewError] = useState<string>()
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [view, setView] = useState({ answers: answersWithoutSecrets(survey), secretCount: 0 })
  // Which environment is open, and whether it was an existing one (then a new name starts a blank form).
  const current = useRef({ name: '', existing: false, run: 0 })

  // The dev server holds the token in memory only, so a restart forgets it. Ask before relying on GitHub.
  useEffect(() => {
    let stale = false
    void isGitHubAvailable(github).then((available) => {
      if (!stale) setGithubReady(available)
    })
    return () => {
      stale = true
    }
  }, [github])

  useEffect(() => {
    setGitHubAvailable(survey, githubReady)
  }, [survey, githubReady])

  // The environment list, and GitHub state as variables; the mock scenario can change at any time.
  useEffect(() => {
    if (mock) mock.scenario = scenario
    setSourceError(undefined)
    applyEnvironmentSources(survey, sources).then(
      () => setReady(true),
      (error: unknown) => {
        // The form still works; the environment list is just empty and a name can be typed.
        setSourceError(error instanceof Error ? error.message : 'unknown error')
        setReady(true)
      }
    )
  }, [scenario, survey, sources, mock])

  // Picking an existing environment loads it; any other name is a new environment.
  useEffect(() => {
    const onChange = (_: unknown, options: { name: string; value: unknown }) => {
      if (options.name !== 'ENVIRONMENT_NAME' || typeof options.value !== 'string' || !options.value) return
      const name = options.value
      if (name === current.current.name) return // applySnapshot sets the same name again
      current.current.name = name
      const run = ++current.current.run
      setStatus({ kind: 'loading', name })

      loadSnapshot(name, sources, bindings, scanned).then(
        (snapshot) => {
          if (run !== current.current.run) return // a newer pick replaced this one
          if (snapshot.exists.github || snapshot.exists.files) {
            applySnapshot(survey, snapshot)
            current.current.existing = true
            setStatus({ kind: 'loaded', snapshot })
          } else {
            // Only wipe the form if it still holds another environment's values.
            if (current.current.existing) resetEnvironment(survey)
            prefillRepositoryValues(survey, snapshot)
            current.current.existing = false
            setStatus({ kind: 'new', name })
          }
        },
        (error: unknown) => {
          if (run === current.current.run) {
            setStatus({ kind: 'error', name, message: error instanceof Error ? error.message : 'unknown error' })
          }
        }
      )
    }
    survey.onValueChanged.add(onChange)
    return () => survey.onValueChanged.remove(onChange)
  }, [survey, sources])

  // The last page's button asks to complete the form; instead of completing it, show the review.
  useEffect(() => {
    const onCompleting = (_: unknown, options: { allow: boolean }) => {
      options.allow = false
      const environment = survey.getValue('ENVIRONMENT_NAME')
      if (!survey.validate(true, true) || typeof environment !== 'string') return
      setPreparing(true)
      setReviewError(undefined)
      const values = activeValues(survey)
      prepareReview({ environment, values, publicValues: withoutSecrets(survey, values), sources, bindings, scanned })
        .then((review) => setScreen({ kind: 'review', review }))
        .catch((error: unknown) => setReviewError(error instanceof Error ? error.message : 'unknown error'))
        .finally(() => setPreparing(false))
    }
    survey.onCompleting.add(onCompleting)
    return () => survey.onCompleting.remove(onCompleting)
  }, [survey, sources])

  useEffect(() => {
    const refresh = () =>
      setView({
        answers: answersWithoutSecrets(survey),
        secretCount: survey.getAllQuestions().filter((q) => isSecret(q) && isShown(q) && !q.isEmpty()).length
      })
    survey.onValueChanged.add(refresh)
    survey.onCurrentPageChanged.add(refresh)
    return () => {
      survey.onValueChanged.remove(refresh)
      survey.onCurrentPageChanged.remove(refresh)
    }
  }, [survey])

  function changeConnection() {
    if (window.confirm('Changing the connection discards the answers entered so far.')) onChangeConnection()
  }

  return (
    <div className="app">
      <AppHeader>
        <span className="app__connection" data-testid="connection">
          {github && !githubReady ? 'GitHub: connection lost' : label}
        </span>
        {mock && (
          <label>
            Mock GitHub scenario
            <select value={scenario} onChange={(event) => setScenario(event.target.value as Scenario)}>
              {SCENARIOS.map(({ id, label: text }) => (
                <option key={id} value={id}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className="app__connect"
          title={`${label}. Click to change the connection.`}
          aria-label={`Change connection (${githubReady ? 'connected' : 'not connected'})`}
          onClick={changeConnection}
        >
          <span className={`app__dot ${githubReady ? 'app__dot--on' : 'app__dot--off'}`} aria-hidden="true" />
          <span className="app__connect-desktop">Change</span>
          <span className="app__connect-mobile">GitHub</span>
        </button>
      </AppHeader>
      {warnings.map((warning) => (
        <div key={warning} className="banner banner--warn">
          {warning}
        </div>
      ))}
      {!githubReady && (
        <div className="banner" role="status" data-testid="no-github">
          {github && 'The dev server no longer holds the GitHub connection. '}
          Without GitHub no secrets are asked for or generated (container registry, email, data store, backup, Sentry and disk
          encryption), because GitHub is the only place they are stored. Only the environment files are written.
        </div>
      )}
      {sourceError && (
        <div className="banner banner--error" role="alert">
          Could not read the environments: {sourceError}
        </div>
      )}
      {preparing && <div className="banner">Reading GitHub and preparing the review…</div>}
      {reviewError && (
        <div className="banner banner--error" role="alert">
          Could not prepare the review: {reviewError}
        </div>
      )}
      {screen.kind === 'review' && (
        <ReviewStep review={screen.review} onBack={() => setScreen({ kind: 'form' })} onApply={() => setScreen({ kind: 'apply', review: screen.review })} />
      )}
      {screen.kind === 'apply' && (
        <ApplyStep
          review={screen.review}
          github={activeGithub}
          local={local}
          onBack={() => setScreen({ kind: 'form' })}
          onApplied={() => void applyEnvironmentSources(survey, sources).catch(() => undefined)}
        />
      )}
      {screen.kind === 'form' && <EnvironmentStatus status={status} />}
      <main className="app__main" hidden={screen.kind !== 'form'}>
        <section className="app__form">{ready ? <Survey model={survey} /> : <p>Loading…</p>}</section>
        <aside className="app__answers">
          <details>
            <summary>
              <h2>Answers</h2>
            </summary>
            <p className="app__hint">
              Secrets are left out. {view.secretCount} secret value{view.secretCount === 1 ? '' : 's'} held in memory only.
            </p>
            <pre data-testid="answers">{JSON.stringify(view.answers, null, 2)}</pre>
          </details>
        </aside>
      </main>
    </div>
  )
}
