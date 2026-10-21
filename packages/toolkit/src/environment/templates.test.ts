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
import {
  ObjectStorageAnswers,
  StoredObjectStorage,
  parseStoredObjectStorage,
  resolveObjectStorage
} from './object-storage'

const nothingStored = parseStoredObjectStorage(undefined, undefined)

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

/** What `environment init` writes for an environment in a given phase */
function render(
  legacy: boolean,
  stored: StoredObjectStorage,
  answers: ObjectStorageAnswers,
  backup: { backup_enabled: boolean; restore_enabled: boolean } = {
    backup_enabled: false,
    restore_enabled: false
  }
) {
  const objectStorage = resolveObjectStorage({ legacy, stored, answers })
  copyChartsValues('qa', {
    env: 'qa',
    environment_type: 'non-production',
    two_fa_enabled: false,
    traefik_mode: 'lets_encrypt',
    restore_environment_name: '',
    restore_type: 'dump',
    restore_host: '',
    backup_type: 'dump',
    backup_host: '',
    ...backup,
    minio_enabled: objectStorage.minioEnabled,
    seaweedfs_enabled: objectStorage.seaweedfsEnabled,
    minio_to_seaweedfs_enabled: objectStorage.migrationEnabled,
    services_use_seaweedfs: objectStorage.servicesUseSeaweedfs
  })
  const read = (chart: string) =>
    yaml.load(
      fs.readFileSync(
        path.join(directory, 'environments', 'qa', chart, 'values.yaml'),
        'utf8'
      )
    ) as Record<string, any>
  return {
    dependencies: read('dependencies'),
    services: read('opencrvs-services')
  }
}

describe('the values that environment init writes for each phase', () => {
  it('new environment: SeaweedFS only, services on SeaweedFS', () => {
    const { dependencies, services } = render(false, nothingStored, {})
    expect(dependencies.minio.enabled).toBe(false)
    expect(dependencies.seaweedfs.enabled).toBe(true)
    expect(dependencies.minio_to_seaweedfs).toBeUndefined()
    expect(services.s3.host).toBe(
      'seaweedfs-0.seaweedfs.opencrvs-deps-qa.svc.cluster.local'
    )
    expect(services.s3.external_subdomain).toBe('seaweedfs')
  })

  it('existing environment that has not started: both stores, no job, services on MinIO', () => {
    const { dependencies, services } = render(true, nothingStored, {
      migrate: false,
      storage: 'minio'
    })
    expect(dependencies.minio.enabled).toBe(true)
    expect(dependencies.seaweedfs.enabled).toBe(true)
    expect(dependencies.minio_to_seaweedfs).toBeUndefined()
    expect(services.s3.host).toBe(
      'minio-0.minio.opencrvs-deps-qa.svc.cluster.local'
    )
    expect(services.s3.external_subdomain).toBeUndefined()
  })

  it('migrating: both stores and the job, which checks the copy, services on MinIO', () => {
    const { dependencies, services } = render(true, nothingStored, {
      migrate: true,
      storage: 'minio'
    })
    expect(dependencies.minio.enabled).toBe(true)
    expect(dependencies.seaweedfs.enabled).toBe(true)
    expect(dependencies.minio_to_seaweedfs).toEqual({ enabled: true })
    expect(services.s3.host).toContain('minio-0.minio')
  })

  it('cut over: services on SeaweedFS, MinIO and the job stay, and the job stops checking the copy', () => {
    const { dependencies, services } = render(
      false,
      parseStoredObjectStorage('minio', 'true'),
      { migrate: true, storage: 'seaweedfs' }
    )
    expect(dependencies.minio.enabled).toBe(true)
    expect(dependencies.minio_to_seaweedfs).toEqual({
      enabled: true,
      verify: 'none'
    })
    expect(services.s3.host).toContain('seaweedfs-0.seaweedfs')
    expect(services.s3.external_subdomain).toBe('seaweedfs')
  })

  it('done: MinIO and the job are gone, as in a new environment', () => {
    const { dependencies, services } = render(
      false,
      parseStoredObjectStorage('seaweedfs', 'true'),
      { migrate: false, storage: 'seaweedfs' }
    )
    expect(dependencies.minio.enabled).toBe(false)
    expect(dependencies.seaweedfs.enabled).toBe(true)
    expect(dependencies.minio_to_seaweedfs).toBeUndefined()
    expect(services.s3.external_subdomain).toBe('seaweedfs')
  })

  it('keeps the settings of MinIO backups and restores, which apply while MinIO is deployed', () => {
    const { dependencies } = render(
      true,
      nothingStored,
      { migrate: false, storage: 'minio' },
      { backup_enabled: true, restore_enabled: false }
    )
    expect(dependencies.minio.enabled).toBe(true)
    expect(dependencies.minio.backup).toEqual({ type: 'dump' })
    expect(dependencies.minio.use_default_credentials).toBe(false)
  })
})

describe('every file that environment init writes', () => {
  function files(directory: string): string[] {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) =>
        entry.isDirectory()
          ? files(path.join(directory, entry.name))
          : [path.join(directory, entry.name)]
      )
  }

  it.each([
    ['a new environment', false, nothingStored, {}],
    [
      'a migrating environment',
      true,
      nothingStored,
      { migrate: true, storage: 'minio' as const }
    ],
    [
      'a cut over environment',
      false,
      parseStoredObjectStorage('minio', 'true'),
      { migrate: true, storage: 'seaweedfs' as const }
    ]
  ])(
    'has no placeholder left over, for %s',
    (_name, legacy, stored, answers) => {
      render(legacy, stored, answers, {
        backup_enabled: true,
        restore_enabled: true
      })

      for (const file of files(path.join(directory, 'environments', 'qa'))) {
        // `{ { name } }` is what a formatter makes of `{{name}}`. js-yaml accepts it
        // as a map and helm does not, so the file has to be caught here.
        expect(fs.readFileSync(file, 'utf8'), file).not.toMatch(
          /\{\s*\{|\}\s*\}/
        )
      }
    }
  )
})
