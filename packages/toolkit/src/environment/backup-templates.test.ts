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

import fs from 'fs'
import os from 'os'
import path from 'path'
import * as yaml from 'js-yaml'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyChartsValues } from './templates'

let directory: string

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'environment-init-'))
  vi.spyOn(process, 'cwd').mockReturnValue(directory)
  // The command logs every file it writes
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  fs.rmSync(directory, { recursive: true, force: true })
})

/** What `environment init` writes for the dependencies chart */
function renderDependencies(backup: {
  backup_enabled: boolean
  backup_type: string
}) {
  copyChartsValues('qa', {
    env: 'qa',
    environment_type: 'production',
    two_fa_enabled: true,
    traefik_mode: 'lets_encrypt',
    restore_enabled: false,
    restore_environment_name: '',
    restore_type: 'dump',
    restore_host: '',
    backup_host: '10.0.0.5',
    ...backup
  })
  const file = path.join(
    directory,
    'environments',
    'qa',
    'dependencies',
    'values.yaml'
  )
  return {
    text: fs.readFileSync(file, 'utf8'),
    values: yaml.load(fs.readFileSync(file, 'utf8')) as Record<string, any>
  }
}

describe('the backup of SeaweedFS in the values that environment init writes', () => {
  it.each(['dump', 'differential'])(
    'follows the backup type of the other datastores: %s',
    (type) => {
      const { values } = renderDependencies({
        backup_enabled: true,
        backup_type: type
      })
      expect(values.seaweedfs).toEqual({ backup: { type } })
      expect(values.minio.backup).toEqual({ type })
      expect(values.postgres.backup).toEqual({ type })
    }
  )

  it('writes no seaweedfs key without a backup, as an empty one would delete the settings of the chart', () => {
    const { values, text } = renderDependencies({
      backup_enabled: false,
      backup_type: ''
    })
    expect('seaweedfs' in values).toBe(false)
    expect(text).not.toMatch(/^seaweedfs:/m)
  })

  it('leaves no placeholder behind', () => {
    const { text } = renderDependencies({
      backup_enabled: true,
      backup_type: 'differential'
    })
    // `{ { name } }` is what a formatter makes of `{{name}}`: js-yaml accepts it as a map and
    // helm does not
    expect(text).not.toMatch(/\{\s*\{|\}\s*\}/)
  })
})
