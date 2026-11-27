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
import type { Bindings } from '../bindings/bindings'
import { githubName } from '../bindings/bindings'
import { formatWith } from '../bindings/parsers'
import type { Snapshot } from '../bindings/snapshot'

// What happens to one GitHub variable or secret when the plan is applied.
//   new        does not exist yet
//   update     exists with another value (a secret's value is unknown, so an entered secret is always an update)
//   unchanged  exists with the same value: nothing is written
//   keep       a secret that exists and was left empty: nothing is written
type Status = 'new' | 'update' | 'unchanged' | 'keep'

export interface PlanItem {
  id: string
  kind: 'variable' | 'secret'
  scope: 'environment' | 'repository'
  name: string
  question: string
  // For a secret this is the secret itself: keep it in memory, never show it.
  value: string
  status: Status
  note?: string
}

export interface Plan {
  environment: string
  // False when GitHub was skipped: then there is nothing to write there.
  github: boolean
  createEnvironment: boolean
  items: PlanItem[]
}

interface PlanInput {
  environment: string
  // The answers on screen (see src/form/active.ts), secrets included.
  values: Record<string, unknown>
  // Read just now, so the statuses describe GitHub as it is.
  snapshot: Snapshot
  bindings: Bindings
  // Environment secrets made for this plan instead of being answered, by name (see src/plan/backupSecrets.ts).
  // They have no question, so bindings.yml does not list them.
  generated?: Record<string, string>
}

const present = (value: unknown) => value !== undefined && value !== null && value !== ''

export function buildPlan({ environment, values, snapshot, bindings, generated = {} }: PlanInput): Plan {
  const github = snapshot.github
  const items: PlanItem[] = []
  if (!github) return { environment, github: false, createEnvironment: false, items }

  for (const [question, binding] of Object.entries(bindings.bindings)) {
    for (const target of binding.targets) {
      if (target.source !== 'github') continue
      const name = githubName(question, target)
      const state = target.scope === 'repository' ? github.repository : github.environment
      const raw = values[question]
      const id = `${target.scope}:${target.kind}:${name}`
      if (items.some((item) => item.id === id)) continue

      if (target.kind === 'variable') {
        if (!present(raw)) continue
        const value = String(formatWith(target.parse, raw))
        if (value === '') continue // GitHub variables cannot be empty, so there is nothing to write
        const existing = state.variables[name]
        const status: Status = existing === undefined ? 'new' : existing === value ? 'unchanged' : 'update'
        items.push({ id, kind: 'variable', scope: target.scope, name, question, value, status })
      } else if (present(raw)) {
        const legacy = (target.legacy ?? []).find((old) => state.secretNames.includes(old))
        const exists = state.secretNames.includes(name)
        items.push({
          id,
          kind: 'secret',
          scope: target.scope,
          name,
          question,
          value: String(raw),
          status: exists ? 'update' : 'new',
          ...(!exists && legacy ? { note: `an older secret ${legacy} exists and is left as it is` } : {})
        })
      } else if (snapshot.definedSecrets.includes(question)) {
        items.push({ id, kind: 'secret', scope: target.scope, name, question, value: '', status: 'keep' })
      }
    }
  }

  // A generated secret is always written; one that exists is replaced, and its old value is gone.
  for (const [name, value] of Object.entries(generated)) {
    const id = `environment:secret:${name}`
    if (items.some((item) => item.id === id)) continue
    const status: Status = github.environment.secretNames.includes(name) ? 'update' : 'new'
    items.push({ id, kind: 'secret', scope: 'environment', name, question: name, value, status })
  }

  // Repository-level items first, then the environment's; variables before secrets.
  const rank = (item: PlanItem) => (item.scope === 'repository' ? 0 : 2) + (item.kind === 'variable' ? 0 : 1)
  items.sort((a, b) => rank(a) - rank(b))
  return { environment, github: true, createEnvironment: !snapshot.exists.github, items }
}

// Items that actually change something on GitHub.
export const writes = (plan: Plan) => plan.items.filter((item) => item.status === 'new' || item.status === 'update')
