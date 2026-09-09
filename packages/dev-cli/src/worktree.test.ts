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
import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { inspectWorktree } from './worktree'

/**
 * A real repository, because this is the one module in the package that reads
 * git's own answers. Faking `git rev-parse` would only assert that the fake
 * matches the assumption being tested.
 */
let root: string
let primary: string
let linked: string

function git(args: string[], cwd: string): void {
  execFileSync('git', args, { cwd, stdio: 'ignore' })
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ocrvs-wt-'))
  primary = path.join(root, 'primary')
  linked = path.join(root, 'feature-a')

  fs.mkdirSync(primary)
  git(['init', '--quiet', '--initial-branch=main', '.'], primary)
  git(
    [
      '-c',
      'user.email=dev@example.org',
      '-c',
      'user.name=dev',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'root'
    ],
    primary
  )
  git(['worktree', 'add', '--quiet', '-b', 'feature-a', linked], primary)
})

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('inspectWorktree', () => {
  it('reports the primary checkout as primary', () => {
    expect(inspectWorktree(primary)).toEqual({
      path: primary,
      isPrimary: true
    })
  })

  it('reports a `git worktree add` checkout as linked', () => {
    expect(inspectWorktree(linked)).toEqual({ path: linked, isPrimary: false })
  })

  it('treats a directory that is not a git repository as a normal checkout', () => {
    const tarball = path.join(root, 'tarball')

    fs.mkdirSync(tarball)

    expect(inspectWorktree(tarball)).toEqual({
      path: tarball,
      isPrimary: true
    })
  })

  it('never calls a directory that does not exist the primary checkout', () => {
    // What a registry entry points at after its worktree is deleted. Reading
    // it as primary is what makes `env:destroy` mistake an orphan for the
    // default environment and refuse to clean it up.
    expect(inspectWorktree(path.join(root, 'deleted')).isPrimary).toBe(false)
  })
})
