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

import { describe, expect, it } from 'vitest'
import {
  isLegacyEnvironment,
  needsObjectStorageAnswers,
  objectStorageNextSteps,
  parseStoredObjectStorage,
  resolveObjectStorage
} from './object-storage'

const nothingStored = parseStoredObjectStorage(undefined, undefined)

describe('parseStoredObjectStorage', () => {
  it('reads nothing from an environment that predates SeaweedFS', () => {
    expect(nothingStored).toEqual({ storage: undefined, migration: undefined })
  })

  it('reads both variables', () => {
    expect(parseStoredObjectStorage('seaweedfs', 'true')).toEqual({
      storage: 'seaweedfs',
      migration: true
    })
    expect(parseStoredObjectStorage('minio', 'false')).toEqual({
      storage: 'minio',
      migration: false
    })
  })

  it('refuses a store that is neither minio nor seaweedfs', () => {
    expect(() => parseStoredObjectStorage('s3', 'false')).toThrow(
      /S3_STORAGE must be minio or seaweedfs/
    )
  })

  it('refuses a migration flag that is neither true nor false', () => {
    expect(() => parseStoredObjectStorage('minio', 'yes')).toThrow(
      /MINIO_TO_SEAWEEDFS_MIGRATION_ENABLED must be true or false/
    )
  })
})

describe('isLegacyEnvironment', () => {
  it('is an environment that has values and does not say which store it uses', () => {
    expect(isLegacyEnvironment(true, nothingStored)).toBe(true)
  })

  it('is not a new environment, which has no values yet, even if a run was aborted after creating it', () => {
    expect(isLegacyEnvironment(false, nothingStored)).toBe(false)
  })

  it('is not an environment that already says which store it uses', () => {
    expect(
      isLegacyEnvironment(true, parseStoredObjectStorage('seaweedfs', 'false'))
    ).toBe(false)
    expect(
      isLegacyEnvironment(true, parseStoredObjectStorage('minio', 'false'))
    ).toBe(false)
  })
})

describe('needsObjectStorageAnswers', () => {
  it('asks a legacy environment', () => {
    expect(needsObjectStorageAnswers(true, nothingStored)).toBe(true)
  })

  it('asks again while MinIO is still in use or being copied, so the next phase can be chosen', () => {
    expect(
      needsObjectStorageAnswers(
        false,
        parseStoredObjectStorage('minio', 'false')
      )
    ).toBe(true)
    expect(
      needsObjectStorageAnswers(
        false,
        parseStoredObjectStorage('minio', 'true')
      )
    ).toBe(true)
    expect(
      needsObjectStorageAnswers(
        false,
        parseStoredObjectStorage('seaweedfs', 'true')
      )
    ).toBe(true)
  })

  it('does not ask a new environment, or one that has finished', () => {
    expect(needsObjectStorageAnswers(false, nothingStored)).toBe(false)
    expect(
      needsObjectStorageAnswers(
        false,
        parseStoredObjectStorage('seaweedfs', 'false')
      )
    ).toBe(false)
  })
})

describe('resolveObjectStorage', () => {
  describe('the phases of an environment, in order', () => {
    it('new environment: SeaweedFS only', () => {
      expect(
        resolveObjectStorage({
          legacy: false,
          stored: nothingStored,
          answers: {}
        })
      ).toEqual({
        storage: 'seaweedfs',
        migrationEnabled: false,
        minioEnabled: false,
        seaweedfsEnabled: true,
        servicesUseSeaweedfs: true
      })
    })

    it('existing environment, migration declined: both stores run, services stay on MinIO', () => {
      expect(
        resolveObjectStorage({
          legacy: true,
          stored: nothingStored,
          answers: { migrate: false, storage: 'minio' }
        })
      ).toEqual({
        storage: 'minio',
        migrationEnabled: false,
        minioEnabled: true,
        seaweedfsEnabled: true,
        servicesUseSeaweedfs: false
      })
    })

    it('existing environment, migrating: both stores run, the job copies, services stay on MinIO', () => {
      expect(
        resolveObjectStorage({
          legacy: true,
          stored: nothingStored,
          answers: { migrate: true, storage: 'minio' }
        })
      ).toEqual({
        storage: 'minio',
        migrationEnabled: true,
        minioEnabled: true,
        seaweedfsEnabled: true,
        servicesUseSeaweedfs: false
      })
    })

    it('cut over: services use SeaweedFS, and MinIO and the job stay for the last copy', () => {
      expect(
        resolveObjectStorage({
          legacy: false,
          stored: parseStoredObjectStorage('minio', 'true'),
          answers: { migrate: true, storage: 'seaweedfs' }
        })
      ).toEqual({
        storage: 'seaweedfs',
        migrationEnabled: true,
        minioEnabled: true,
        seaweedfsEnabled: true,
        servicesUseSeaweedfs: true
      })
    })

    it('done: SeaweedFS only, as a new environment', () => {
      expect(
        resolveObjectStorage({
          legacy: false,
          stored: parseStoredObjectStorage('seaweedfs', 'true'),
          answers: { migrate: false, storage: 'seaweedfs' }
        })
      ).toEqual({
        storage: 'seaweedfs',
        migrationEnabled: false,
        minioEnabled: false,
        seaweedfsEnabled: true,
        servicesUseSeaweedfs: true
      })
    })
  })

  describe('a run that asks nothing keeps what is stored', () => {
    it('an environment that finished stays on SeaweedFS', () => {
      const resolved = resolveObjectStorage({
        legacy: false,
        stored: parseStoredObjectStorage('seaweedfs', 'false'),
        answers: {}
      })
      expect(resolved.minioEnabled).toBe(false)
      expect(resolved.storage).toBe('seaweedfs')
    })

    it('a new environment never gets MinIO back when init runs again', () => {
      // The second run sees an environment with values, but it also sees S3_STORAGE
      const second = resolveObjectStorage({
        legacy: isLegacyEnvironment(
          true,
          parseStoredObjectStorage('seaweedfs', 'false')
        ),
        stored: parseStoredObjectStorage('seaweedfs', 'false'),
        answers: {}
      })
      expect(second.minioEnabled).toBe(false)
    })
  })

  it('uses MinIO when it is stored, whatever the migration flag says', () => {
    expect(
      resolveObjectStorage({
        legacy: false,
        stored: parseStoredObjectStorage('minio', 'false'),
        answers: {}
      })
    ).toMatchObject({ storage: 'minio', minioEnabled: true })
  })

  it('keeps MinIO as long as the job copies from it, even when the services use SeaweedFS', () => {
    expect(
      resolveObjectStorage({
        legacy: false,
        stored: nothingStored,
        answers: { migrate: true, storage: 'seaweedfs' }
      })
    ).toMatchObject({ minioEnabled: true, servicesUseSeaweedfs: true })
  })

  it('always deploys SeaweedFS', () => {
    for (const legacy of [true, false]) {
      expect(
        resolveObjectStorage({
          legacy,
          stored: nothingStored,
          answers: {}
        }).seaweedfsEnabled
      ).toBe(true)
    }
  })
})

describe('objectStorageNextSteps', () => {
  const steps = (
    legacy: boolean,
    stored: ReturnType<typeof parseStoredObjectStorage>,
    answers: Parameters<typeof resolveObjectStorage>[0]['answers']
  ) =>
    objectStorageNextSteps(resolveObjectStorage({ legacy, stored, answers }), {
      legacy,
      stored
    }).join('\n')

  it('tells a new environment to create the DNS records of SeaweedFS', () => {
    const text = steps(false, nothingStored, {})
    expect(text).toMatch(/only object store/)
    expect(text).toMatch(/seaweedfs\.<domain>/)
    expect(text).toMatch(/seaweedfs-console\.<domain>/)
    expect(text).not.toMatch(/\/data\/minio/)
  })

  it('says that an environment that has not started keeps using MinIO', () => {
    const text = steps(true, nothingStored, {
      migrate: false,
      storage: 'minio'
    })
    expect(text).toMatch(/keep using MinIO/)
    expect(text).toMatch(/not copied/)
  })

  it('says that a migrating environment copies on each deployment and keeps using MinIO', () => {
    const text = steps(true, nothingStored, { migrate: true, storage: 'minio' })
    expect(text).toMatch(/copied from MinIO to SeaweedFS on every deployment/)
    expect(text).toMatch(/keep using MinIO/)
    expect(text).toMatch(/free disk space/)
  })

  it('says what a cut over environment needs: the DNS records, and a last copy before MinIO goes', () => {
    const text = steps(false, parseStoredObjectStorage('minio', 'true'), {
      migrate: true,
      storage: 'seaweedfs'
    })
    expect(text).toMatch(/use SeaweedFS/)
    expect(text).toMatch(/seaweedfs\.<domain>/)
    expect(text).toMatch(/last copy/)
    expect(text).toMatch(/turn copying off/)
  })

  it('advises to delete the data of MinIO only once everything is confirmed to work', () => {
    const text = steps(false, parseStoredObjectStorage('seaweedfs', 'true'), {
      migrate: false,
      storage: 'seaweedfs'
    })
    expect(text).toMatch(/MinIO is no longer deployed/)
    expect(text).toMatch(/\/data\/minio/)
    expect(text).toMatch(/confirmed that everything works/)
  })
})
