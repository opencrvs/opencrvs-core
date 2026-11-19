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
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Files read from an environment, relative to its folder. Only these are ever
// returned, so the API cannot be used to read anything else on disk.
// `values.override.yaml` files belong to the user and are deliberately left out.
export const ENVIRONMENT_FILES = ['inventory.yml', 'dependencies/values.yaml', 'traefik/values.yaml', 'opencrvs-services/values.yaml']

const INVENTORY = ENVIRONMENT_FILES[0]!
const YAML_FILE = /\.ya?ml$/
export const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

interface EnvironmentList {
  names: string[]
  // folders: environments/<name>/inventory.yml   files: environments/<name>.yaml   none: nothing found
  layout: 'folders' | 'files' | 'none'
}

// Subfolders win; if there are none, the names of *.yaml / *.yml files are used.
export async function listEnvironmentNames(dir: string): Promise<EnvironmentList> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return { names: [], layout: 'none' }
  }

  const folders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  if (folders.length > 0) {
    return { names: folders.map((entry) => entry.name).sort(), layout: 'folders' }
  }

  const files = entries.filter((entry) => entry.isFile() && YAML_FILE.test(entry.name))
  if (files.length > 0) {
    return { names: files.map((entry) => entry.name.replace(YAML_FILE, '')).sort(), layout: 'files' }
  }
  return { names: [], layout: 'none' }
}

async function readIfPresent(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return undefined
  }
}

// Returns the known files that exist for an environment, keyed by their path
// inside the environment folder. Unknown names return undefined. In the flat layout the one
// file is returned under `flatFile` (the rendered file it holds, `flat:` in bindings.yml).
export async function readEnvironmentFiles(
  dir: string,
  name: string,
  flatFile: string = INVENTORY
): Promise<Record<string, string> | undefined> {
  if (!SAFE_NAME.test(name)) return undefined
  const { names, layout } = await listEnvironmentNames(dir)
  if (!names.includes(name)) return undefined

  const files: Record<string, string> = {}
  if (layout === 'files') {
    // .yml first, so that .yaml wins if both exist.
    for (const extension of ['.yml', '.yaml']) {
      const text = await readIfPresent(join(dir, `${name}${extension}`))
      if (text !== undefined) files[flatFile] = text
    }
    return files
  }

  for (const file of ENVIRONMENT_FILES) {
    const text = await readIfPresent(join(dir, name, file))
    if (text !== undefined) files[file] = text
  }
  return files
}

// Where each rendered file goes for an environment, relative to environments/. A file with no
// place in the layout is null: in the flat layout only `flatFile` has one. An environment that
// does not exist yet is created in the tree layout, unless the folder already holds flat files.
export async function fileTargets(
  dir: string,
  name: string,
  flatFile: string = INVENTORY
): Promise<{ layout: EnvironmentList['layout']; targets: Record<string, string | null> }> {
  const { layout } = await listEnvironmentNames(dir)
  const targets: Record<string, string | null> = {}
  if (layout === 'files') {
    // Keep the extension the environment already has; .yaml wins if both exist (as when reading).
    const hasYaml = (await readIfPresent(join(dir, `${name}.yaml`))) !== undefined
    const hasYml = (await readIfPresent(join(dir, `${name}.yml`))) !== undefined
    const extension = hasYml && !hasYaml ? '.yml' : '.yaml'
    for (const path of ENVIRONMENT_FILES) targets[path] = path === flatFile ? `${name}${extension}` : null
  } else {
    for (const path of ENVIRONMENT_FILES) targets[path] = `${name}/${path}`
  }
  return { layout, targets }
}

interface Repository {
  owner: string
  repo: string
}

// Accepts git@github.com:owner/repo.git and https://github.com/owner/repo(.git)
export function parseGitRemote(url: string): Repository | null {
  const match = url.trim().match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/)
  return match ? { owner: match[1]!, repo: match[2]! } : null
}

// Reads the url of remote "origin" from .git/config, without running git (which can refuse to
// work in a mounted folder owned by another user, as in a container).
export async function readGitRemote(cwd: string): Promise<string | undefined> {
  const config = await readIfPresent(join(cwd, '.git', 'config'))
  if (config === undefined) return undefined
  let inOrigin = false
  for (const line of config.split(/\r?\n/)) {
    const section = line.match(/^\s*\[(.*)\]\s*$/)
    if (section) {
      inOrigin = /^remote\s+"origin"$/.test(section[1]!.trim())
      continue
    }
    const url = inOrigin ? line.match(/^\s*url\s*=\s*(.+?)\s*$/) : null
    if (url) return url[1]
  }
  return undefined
}
