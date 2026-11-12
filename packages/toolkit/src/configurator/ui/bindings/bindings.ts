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
// Shape of forms/bindings.yml: which stored values feed which form question.
// A question can have several targets (one-to-many). Which source wins when more
// than one has a value is decided by `precedence`.
export type SourceName = 'github' | 'file'

interface GitHubTarget {
  source: 'github'
  kind: 'variable' | 'secret'
  scope: 'environment' | 'repository'
  // Defaults to the question name.
  name?: string
  // Earlier names of the same secret or variable.
  legacy?: string[]
  parse?: string
}

interface FileTarget {
  source: 'file'
  // A template under templates/, e.g. inventory/inventory.template.yml
  template: string
  // The template variable whose value is read from the rendered file.
  var: string
  // 'container' returns the whole list the variable belongs to, not its values.
  collect?: 'container'
  parse?: string
}

type Target = GitHubTarget | FileTarget

interface Binding {
  precedence?: SourceName[]
  targets: Target[]
}

export interface Bindings {
  precedence: SourceName[]
  // Template path -> rendered file path inside an environment folder.
  files: Record<string, string>
  // In the flat layout (environments/<name>.yaml) an environment is one file. This is the rendered
  // file it holds, as it is read back; the other rendered files have no place there and are not written.
  flat?: string
  // Template variables that no question feeds, so rendering a template never leaves one blank.
  templates?: Record<string, { defaults?: Record<string, unknown>; derived?: string[] }>
  // Questions that hold no stored value, with the reason.
  ignore: Record<string, string>
  bindings: Record<string, Binding>
}

export const githubName = (question: string, target: GitHubTarget) => target.name ?? question
