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

// Helpers for the tests. Nothing in the CLI imports this file.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const created: string[] = []

/** A throwaway directory holding `files` (path relative to it -> content). */
export function createRepository(files: Record<string, string> = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'configurator-'))
  created.push(root)
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  return root
}

export function removeRepositories() {
  for (const directory of created.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
}

export const read = (root: string, path: string) =>
  readFileSync(join(root, path), 'utf8')

/** The shape of the `environment` input in the infrastructure repository's workflows. */
export const environmentInput = (options: string[], fallback = options[0]) =>
  [
    '      environment:',
    '        description: Environment',
    '        required: true',
    `        default: ${fallback}`,
    '        type: choice',
    '        options:',
    ...options.map((option) => `          - ${option}`)
  ].join('\n')

/** Another choice input with its own `options`, as `provision.yml` has. */
export const tagsInput = [
  '      tags:',
  '        type: choice',
  '        options:',
  '          - all',
  '          - users'
].join('\n')

/** A workflow with the given inputs and, like the real ones, an unrelated `options:` further down. */
export const workflow = (...inputs: string[]) =>
  [
    'name: Test',
    'on:',
    '  workflow_dispatch:',
    '    inputs:',
    ...inputs,
    'jobs:',
    '  run:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: ./.github/actions/ansible',
    '        with:',
    '          options: |-',
    '            --verbose',
    ''
  ].join('\n')
