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
import { useEffect, useState, type FormEvent } from 'react'
import type { ConnectionPort, ConnectionResult } from '../github/connection'
import type { LocalServerPort } from '../local/port'
import { AppHeader } from './AppHeader'

export interface Connected {
  owner: string
  repo: string
  login: string
  missingPermissions: string[]
}

interface Props {
  local: LocalServerPort
  connection: ConnectionPort
  onConnected: (connected: Connected) => void
  onSkip: () => void
}

// First screen: ask for a GitHub token, or skip GitHub. The token lives in this component's
// state only; it is not stored, put in a URL, or logged, and is dropped once connected.
export function ConnectStep({ local, connection, onConnected, onSkip }: Props) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [serverNote, setServerNote] = useState<string>()

  // Pre-fill the repository from `git remote origin`, as reported by the dev server.
  useEffect(() => {
    local.getRepository().then(
      (repository) => {
        if (repository) {
          setOwner(repository.owner)
          setRepo(repository.repo)
        } else {
          setServerNote('The project folder has no GitHub remote, so the repository is empty.')
        }
      },
      () => setServerNote('The local dev server is not reachable, so the repository and the environments folder cannot be read.')
    )
  }, [local])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    let result: ConnectionResult
    try {
      result = await connection.connect({ token, owner, repo })
    } catch {
      result = { ok: false, error: 'Could not reach GitHub.' }
    }
    setBusy(false)
    if (result.ok) {
      setToken('')
      onConnected({ owner: owner.trim(), repo: repo.trim(), login: result.login, missingPermissions: result.missingPermissions })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="connect-page">
      <AppHeader />
      <main className="connect">
        <section className="connect__card connect__welcome" aria-labelledby="welcome-title" data-testid="welcome">
          <h2 id="welcome-title">Welcome</h2>
          <p>
            OpenCRVS environment configuration form gives you a simple way to set up and manage your OpenCRVS environment.
          </p>

          <h3>What does the installer do?</h3>
          <ul>
            <li>Asks the questions for the environment, one page at a time, and checks the answers as you go.</li>
            <li>
              Loads what already exists for it, from GitHub and from the <code>environments/</code> folder, so you can
              update an environment instead of starting again.
            </li>
            <li>Generates the secrets that are needed. They are held in memory only.</li>
          </ul>

          <h3>What is configured?</h3>
          <ul>
            <li>Users and passwords.</li>
            <li>Ansible inventory for Host OS configuration and Kubernetes setup.</li>
            <li>Helm values for OpenCRVS, dependencies, traefik and monitoring.</li>
            <li>GitHub Actions workflows.</li>
          </ul>
        </section>

        <form className="connect__card" onSubmit={submit}>
          <h2>Connect to GitHub</h2>
          <p className="connect__hint">
            The token is kept in memory only. It will also be used to provision servers and to register the self-hosted
            runner, so it must be allowed to manage the repository's environments, secrets and variables and to trigger
            its workflows.
          </p>

          <div className="connect__row">
            <label>
              Repository owner
              <input value={owner} onChange={(event) => setOwner(event.target.value)} autoComplete="off" spellCheck={false} />
            </label>
            <label>
              Repository
              <input value={repo} onChange={(event) => setRepo(event.target.value)} autoComplete="off" spellCheck={false} />
            </label>
          </div>
          {serverNote && <p className="connect__note">{serverNote}</p>}

          <label>
            GitHub token
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="ghp_…"
            />
          </label>

          {error && (
            <p className="connect__error" role="alert">
              {error}
            </p>
          )}

          <div className="connect__actions">
            <button type="submit" disabled={busy || !owner.trim() || !repo.trim() || !token}>
              {busy ? 'Connecting…' : 'Connect'}
            </button>
            <button type="button" className="connect__skip" disabled={busy} onClick={onSkip}>
              Skip GitHub integration
            </button>
          </div>
          <p className="connect__hint">
            Without GitHub the existing environments come from the <code>environments/</code> folder, and nothing is read
            from or written to GitHub.
          </p>
        </form>
      </main>
    </div>
  )
}
