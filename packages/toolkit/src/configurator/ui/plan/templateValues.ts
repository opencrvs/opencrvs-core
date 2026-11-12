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
import type { Bindings } from '../bindings/bindings.ts'
import { formatWith } from '../bindings/parsers.ts'
import { DEFAULT_HOSTS } from './dependencyHosts.ts'

interface Context {
  environment: string
  answers: Record<string, unknown>
  // Values already taken from questions, by template variable.
  fromQuestions: Record<string, unknown>
}

// Values worked out from other values, the way `yarn environment:init` does.
export const DERIVED: Record<string, (context: Context) => unknown> = {
  env: ({ environment }) => environment,
  // A cluster is a single node unless it has workers or a backup server (the CLI passes a string).
  single_node: ({ fromQuestions }) =>
    (fromQuestions.kube_worker_nodes as unknown[] | undefined)?.length || fromQuestions.backup_host ? 'false' : 'true',
  backup_enabled: ({ answers }) => answers.BACKUP_OR_RESTORE === 'backup',
  restore_enabled: ({ answers }) => answers.BACKUP_OR_RESTORE === 'restore',
  opencrvs_environment: ({ environment }) => environment,
  // On unless the question says otherwise (the template reads it only to switch tracing on).
  monitoring_enabled: ({ answers }) => answers.MONITORING_ENABLED !== false,
  lets_encrypt: ({ answers }) => answers.TRAEFIK_MODE === 'lets_encrypt',
  static_ssl: ({ answers }) => answers.TRAEFIK_MODE === 'static_ssl'
}

// The template variable a file target feeds. `users.name` with collect: container belongs to `users`.
const variableOf = (target: { var: string; collect?: 'container' }) => (target.collect === 'container' ? target.var.split('.')[0]! : target.var)

// Every file target of a template, with the question that feeds it.
function* fileTargets(template: string, bindings: Bindings) {
  for (const [question, binding] of Object.entries(bindings.bindings)) {
    for (const target of binding.targets) {
      if (target.source === 'file' && target.template === template) yield { question, target, variable: variableOf(target) }
    }
  }
}

// The address of a built-in component, for each variable of the template that a question with one feeds
// (see DEFAULT_HOSTS). A component that is built in has no host question on screen, and a hidden question is not
// part of the answers, so the component runs at its address in the cluster. One address can feed several
// variables: the collector endpoint is in the services chart and in Traefik's tracing block.
// Nothing here is listed by hand: the questions come from DEFAULT_HOSTS and the variables from bindings.yml.
export function builtInValues(template: string, environment: string, bindings: Bindings): Record<string, string> {
  const values: Record<string, string> = {}
  for (const { question, variable } of fileTargets(template, bindings)) {
    const address = DEFAULT_HOSTS[question]
    if (address) values[variable] = address(environment)
  }
  return values
}

// The data a template is rendered with: defaults, then question values (reverse of how they are
// read back), then the built-in addresses of what has no answer, then derived values.
// `answers` must only hold what is on screen (see src/form/active.ts).
export function templateValues(
  template: string,
  environment: string,
  answers: Record<string, unknown>,
  bindings: Bindings
): Record<string, unknown> {
  const fromQuestions: Record<string, unknown> = {}
  for (const { question, target, variable } of fileTargets(template, bindings)) {
    if (answers[question] !== undefined) fromQuestions[variable] = formatWith(target.parse, answers[question])
  }

  const config = bindings.templates?.[template]
  const values: Record<string, unknown> = { ...(config?.defaults ?? {}), ...fromQuestions }
  for (const [variable, address] of Object.entries(builtInValues(template, environment, bindings))) {
    if (!values[variable]) values[variable] = address
  }
  for (const name of config?.derived ?? []) {
    const derive = DERIVED[name]
    if (!derive) throw new Error(`${template}: no derived value named "${name}"`)
    values[name] = derive({ environment, answers, fromQuestions })
  }
  return values
}
