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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import path from 'path'
import kleur from 'kleur'
import { log, success, warn } from './logger'
import { isKubectlInstalled, warnIfNativeWindowsShell } from './platform'

export const CONFIGURE_SHELL_USAGE = `
Usage: opencrvs environment configure-shell

Install Kubernetes aliases and functions (k, kgp, kexec, klogs, kns,
add-k8s-context, ...) for bash and zsh.

The aliases are written to ~/.opencrvs/k8s-aliases.sh, which is sourced from
your shell startup files. Run the command again to update them.

Options:
  -h, --help   Show this message.
`.trim()

const TEMPLATE_PATH = path.resolve(
  __dirname,
  'templates',
  'shell',
  'k8s-aliases.sh'
)
const CLI_PATH_PLACEHOLDER = '__OPENCRVS_TOOLKIT_CLI__'

// Relative to the home directory
export const ALIASES_FILE = '.opencrvs/k8s-aliases.sh'

const BLOCK_BEGIN =
  '# BEGIN OPENCRVS - Kubernetes aliases (yarn environment:configure-shell)'
const BLOCK_END = '# END OPENCRVS - Kubernetes aliases'
export const MANAGED_BLOCK = [
  BLOCK_BEGIN,
  `[ -f "$HOME/${ALIASES_FILE}" ] && . "$HOME/${ALIASES_FILE}"`,
  BLOCK_END
].join('\n')

export function renderAliases(template: string, cliPath: string) {
  // Git Bash understands C:/... but would treat backslashes as escapes
  return template
    .split(CLI_PATH_PLACEHOLDER)
    .join(cliPath.split(path.win32.sep).join('/'))
}

/**
 * Adds the managed block to a shell startup file, or replaces the block when
 * the file already has one, so running the command again is safe.
 */
export function upsertManagedBlock(content: string) {
  const start = content.indexOf(BLOCK_BEGIN)
  const end = content.indexOf(BLOCK_END, start)
  if (start !== -1 && end !== -1) {
    return (
      content.slice(0, start) +
      MANAGED_BLOCK +
      content.slice(end + BLOCK_END.length)
    )
  }
  const separator =
    content.length === 0 ? '' : content.endsWith('\n') ? '\n' : '\n\n'
  return `${content}${separator}${MANAGED_BLOCK}\n`
}

/**
 * Shell startup files to configure: the one of the current shell (created if
 * missing) plus any existing .bashrc / .zshrc.
 */
export function getShellStartupFiles(
  home: string,
  shell = process.env.SHELL ?? '',
  platform: NodeJS.Platform = process.platform
) {
  const shellName = path.basename(shell)
  // macOS terminals start bash as a login shell, which reads .bash_profile only
  const currentShellFile =
    shellName === 'zsh'
      ? '.zshrc'
      : shellName === 'bash'
        ? platform === 'darwin'
          ? '.bash_profile'
          : '.bashrc'
        : undefined

  const files = ['.bashrc', '.zshrc'].filter((file) =>
    existsSync(path.join(home, file))
  )
  if (currentShellFile && !files.includes(currentShellFile)) {
    files.unshift(currentShellFile)
  }
  if (files.length === 0) {
    files.push('.bashrc')
  }
  return files.map((file) => path.join(home, file))
}

export function configureShell({
  home,
  cliPath,
  shell,
  platform
}: {
  home: string
  cliPath: string
  shell?: string
  platform?: NodeJS.Platform
}) {
  const aliasesPath = path.join(home, ALIASES_FILE)
  mkdirSync(path.dirname(aliasesPath), { recursive: true })
  writeFileSync(
    aliasesPath,
    renderAliases(readFileSync(TEMPLATE_PATH, 'utf8'), cliPath),
    'utf8'
  )

  const startupFiles = getShellStartupFiles(home, shell, platform)
  for (const file of startupFiles) {
    const content = existsSync(file) ? readFileSync(file, 'utf8') : ''
    const updated = upsertManagedBlock(content)
    if (updated !== content) {
      writeFileSync(file, updated, 'utf8')
    }
  }

  return { aliasesPath, startupFiles }
}

export async function runConfigureShell(args: string[]) {
  if (args.includes('--help') || args.includes('-h')) {
    log(CONFIGURE_SHELL_USAGE)
    return
  }

  if (warnIfNativeWindowsShell()) {
    process.exit(1)
  }

  const shellName = path.basename(process.env.SHELL ?? '')
  if (shellName && !['bash', 'zsh'].includes(shellName)) {
    warn(
      kleur.yellow(
        `Your shell is ${shellName}. Only bash and zsh are supported, the aliases are installed for them only.`
      )
    )
  }

  const { aliasesPath, startupFiles } = configureShell({
    home: homedir(),
    // The bundled CLI: dist/cli.js inside node_modules/@opencrvs/toolkit
    cliPath: path.resolve(__filename)
  })

  success(`✅ Kubernetes aliases written to ${aliasesPath}`)
  log(`Loaded from:\n${startupFiles.map((file) => `  ${file}`).join('\n')}`)

  if (!isKubectlInstalled()) {
    warn(
      kleur.yellow(
        '\nkubectl was not found. Install it to use the aliases: https://kubernetes.io/docs/tasks/tools/'
      )
    )
  }

  log(
    `\nOpen a new terminal, or load the aliases in this one with:\n  source ${startupFiles[0]}`
  )
}
