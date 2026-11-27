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
import type { Snapshot } from '../bindings/snapshot'

export type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; name: string }
  | { kind: 'new'; name: string }
  | { kind: 'loaded'; snapshot: Snapshot }
  | { kind: 'error'; name: string; message: string }

// Short text for a value in a message: tables and lists are counted, not printed.
function show(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  const text = String(value)
  return text.length > 40 ? `${text.slice(0, 37)}…` : text
}

const where = (candidate: { source: string; origin: string }) =>
  candidate.source === 'github' ? `GitHub (${candidate.origin})` : candidate.origin

// Tells the user what was found for the environment they picked, and where sources disagreed.
export function EnvironmentStatus({ status }: { status: Status }) {
  if (status.kind === 'idle') return null

  if (status.kind === 'loading') {
    return <div className="banner">Loading “{status.name}”…</div>
  }
  if (status.kind === 'new') {
    return <div className="banner">“{status.name}” is a new environment. There is nothing to load.</div>
  }
  if (status.kind === 'error') {
    return (
      <div className="banner banner--error" role="alert">
        Could not load “{status.name}”: {status.message}
      </div>
    )
  }

  const { snapshot } = status
  const found = [snapshot.exists.github && 'GitHub', snapshot.exists.files && 'local files'].filter(Boolean).join(' and ')
  return (
    <div className="banner" data-testid="environment-status">
      <strong>Updating “{snapshot.environment}”.</strong> Found in {found}.
      {snapshot.definedSecrets.length > 0 && (
        <> {snapshot.definedSecrets.length} secrets are already set on GitHub; they stay as they are unless you enter a new value.</>
      )}
      {snapshot.conflicts.length > 0 && (
        <ul className="banner__conflicts">
          {snapshot.conflicts.map(({ question, winner, others }) => (
            <li key={question}>
              <code>{question}</code>: used {show(winner.value)} from {where(winner)}; {others.map((other) => `${where(other)} has ${show(other.value)}`).join(', ')}.
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
