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

import { spawnSync } from 'child_process'
import kleur from 'kleur'
import { warn } from './logger'

/**
 * Windows is supported only through WSL (reported as linux) or Git Bash
 * (reported as win32, with MSYSTEM set by the MSYS2 runtime). PowerShell and
 * cmd are reported as win32 without MSYSTEM.
 */
export function isNativeWindowsShell(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env
) {
  return platform === 'win32' && !env.MSYSTEM
}

export function warnIfNativeWindowsShell() {
  if (!isNativeWindowsShell()) {
    return false
  }
  warn(
    kleur.yellow(
      [
        'Native Windows shells (PowerShell, cmd) are not supported.',
        'Please run this command from WSL or Git Bash.'
      ].join(' ')
    )
  )
  return true
}

export function isKubectlInstalled() {
  const result = spawnSync('kubectl', ['version', '--client'], {
    stdio: 'ignore'
  })
  return !result.error && result.status === 0
}
