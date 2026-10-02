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
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import {
  ALIASES_FILE,
  MANAGED_BLOCK,
  configureShell,
  getShellStartupFiles,
  renderAliases,
  upsertManagedBlock
} from './configure-shell'
import { isNativeWindowsShell } from './platform'

describe('upsertManagedBlock', () => {
  it('adds the block to an empty file', () => {
    expect(upsertManagedBlock('')).toBe(`${MANAGED_BLOCK}\n`)
  })

  it('appends the block after existing content', () => {
    expect(upsertManagedBlock('export FOO=1')).toBe(
      `export FOO=1\n\n${MANAGED_BLOCK}\n`
    )
  })

  it('replaces an existing block and keeps the rest of the file', () => {
    const outdated = MANAGED_BLOCK.replace('[ -f', '# old\n[ -f')
    const content = `before\n${outdated}\nafter\n`
    expect(upsertManagedBlock(content)).toBe(
      `before\n${MANAGED_BLOCK}\nafter\n`
    )
  })

  it('does not change a file that is already configured', () => {
    const content = upsertManagedBlock('export FOO=1\n')
    expect(upsertManagedBlock(content)).toBe(content)
  })
})

describe('renderAliases', () => {
  it('points add-k8s-context to the toolkit CLI', () => {
    expect(
      renderAliases(
        `alias add-k8s-context='node "__OPENCRVS_TOOLKIT_CLI__" environment add-k8s-context'`,
        '/repo/node_modules/@opencrvs/toolkit/dist/cli.js'
      )
    ).toBe(
      `alias add-k8s-context='node "/repo/node_modules/@opencrvs/toolkit/dist/cli.js" environment add-k8s-context'`
    )
  })

  it('uses forward slashes for Windows paths', () => {
    expect(
      renderAliases('__OPENCRVS_TOOLKIT_CLI__', 'C:\\repo\\dist\\cli.js')
    ).toBe('C:/repo/dist/cli.js')
  })
})

describe('getShellStartupFiles', () => {
  let home: string

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), 'configure-shell-'))
  })

  afterEach(() => {
    rmSync(home, { recursive: true, force: true })
  })

  const names = (files: string[]) => files.map((file) => path.basename(file))

  it('uses the startup file of the current shell', () => {
    expect(names(getShellStartupFiles(home, '/bin/zsh', 'darwin'))).toEqual([
      '.zshrc'
    ])
    expect(names(getShellStartupFiles(home, '/bin/bash', 'linux'))).toEqual([
      '.bashrc'
    ])
  })

  it('uses .bash_profile for bash on macOS', () => {
    expect(names(getShellStartupFiles(home, '/bin/bash', 'darwin'))).toEqual([
      '.bash_profile'
    ])
  })

  it('also configures other existing startup files', () => {
    writeFileSync(path.join(home, '.bashrc'), '')
    expect(names(getShellStartupFiles(home, '/bin/zsh', 'linux'))).toEqual([
      '.zshrc',
      '.bashrc'
    ])
  })

  it('falls back to .bashrc for an unknown shell', () => {
    expect(names(getShellStartupFiles(home, '', 'linux'))).toEqual(['.bashrc'])
  })
})

describe('configureShell', () => {
  let home: string

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), 'configure-shell-'))
  })

  afterEach(() => {
    rmSync(home, { recursive: true, force: true })
  })

  it('writes the aliases and sources them from the shell startup file', () => {
    const cliPath = '/repo/node_modules/@opencrvs/toolkit/dist/cli.js'
    writeFileSync(path.join(home, '.zshrc'), 'export FOO=1\n')

    const { aliasesPath, startupFiles } = configureShell({
      home,
      cliPath,
      shell: '/bin/zsh',
      platform: 'darwin'
    })

    expect(aliasesPath).toBe(path.join(home, ALIASES_FILE))
    const aliases = readFileSync(aliasesPath, 'utf8')
    expect(aliases).toContain("alias kgp='kubectl get pods'")
    expect(aliases).toContain('function kns()')
    expect(aliases).toContain(`node "${cliPath}" environment add-k8s-context`)
    expect(aliases).not.toContain('/opt/opencrvs/scripts')

    expect(startupFiles).toEqual([path.join(home, '.zshrc')])
    expect(readFileSync(startupFiles[0], 'utf8')).toBe(
      `export FOO=1\n\n${MANAGED_BLOCK}\n`
    )
  })

  it('can run again without duplicating the block', () => {
    const options = {
      home,
      cliPath: '/cli.js',
      shell: '/bin/bash',
      platform: 'linux' as const
    }
    configureShell(options)
    const { startupFiles } = configureShell(options)
    expect(readFileSync(startupFiles[0], 'utf8')).toBe(`${MANAGED_BLOCK}\n`)
  })
})

describe('isNativeWindowsShell', () => {
  it('detects PowerShell and cmd', () => {
    expect(isNativeWindowsShell('win32', {})).toBe(true)
  })

  it('allows Git Bash, WSL, macOS and Linux', () => {
    expect(isNativeWindowsShell('win32', { MSYSTEM: 'MINGW64' })).toBe(false)
    expect(isNativeWindowsShell('linux', {})).toBe(false)
    expect(isNativeWindowsShell('darwin', {})).toBe(false)
  })
})
