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
import Handlebars from 'handlebars'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Bindings } from '../ui/bindings/bindings.ts'
import { templateValues } from '../ui/plan/templateValues.ts'
import { ENVIRONMENT_FILES, fileTargets, SAFE_NAME } from './environments.ts'

interface RenderInput {
  environment: string
  // The form's answers that are on screen. Secrets are not needed and must not be passed.
  values: Record<string, unknown>
  bindings: Bindings
  // Reads a template by its path under templates/.
  readTemplate: (path: string) => string
}

// Renders every template listed under `files:` in bindings.yml, the way the CLI does
// (same Handlebars, same worker label helper). Returns the files by their path inside the environment folder.
export function renderEnvironmentFiles({ environment, values, bindings, readTemplate }: RenderInput): Record<string, string> {
  const files: Record<string, string> = {}
  for (const [template, output] of Object.entries(bindings.files)) {
    const handlebars = Handlebars.create()
    handlebars.registerHelper('data_label_idx', (value: unknown) => Number.parseInt(String(value), 10) + 2)
    files[output] = handlebars.compile(readTemplate(template))(templateValues(template, environment, values, bindings))
  }
  return files
}

// Writes rendered files where the layout puts them (see fileTargets): environments/<name>/<path> in
// the tree layout, the one file environments/<name>.yaml in the flat layout. Only the known paths
// are accepted, so this can never be used to write anything else, and values.override.yaml is
// never touched. Returns the places written, relative to environments/.
export async function writeEnvironmentFiles(
  dir: string,
  environment: string,
  files: Record<string, string>,
  flatFile?: string
): Promise<string[]> {
  if (!SAFE_NAME.test(environment)) throw new Error('Invalid environment name.')
  for (const path of Object.keys(files)) {
    if (!ENVIRONMENT_FILES.includes(path)) throw new Error(`Refusing to write ${path}.`)
  }
  const { targets } = await fileTargets(dir, environment, flatFile)
  const written: string[] = []
  for (const [path, text] of Object.entries(files)) {
    const target = targets[path]
    if (target === null || target === undefined) continue // no place for it in this layout
    await mkdir(dirname(join(dir, target)), { recursive: true })
    await writeFile(join(dir, target), text)
    written.push(target)
  }
  return written
}
