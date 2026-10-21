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

/*
 * Which object store an environment runs, and how it moves from MinIO to SeaweedFS.
 *
 * Two variables of the GitHub environment hold the state, and every run of
 * `environment init` reads them back, so that the generated values do not depend
 * on anything but what is stored:
 *
 * - S3_STORAGE: the store the OpenCRVS services use, `minio` or `seaweedfs`.
 *   An environment that was set up before SeaweedFS does not have it.
 * - MINIO_TO_SEAWEEDFS_MIGRATION_ENABLED: whether the dependencies chart copies
 *   the objects of MinIO into SeaweedFS on each deployment.
 *
 * An environment goes through these phases. SeaweedFS is deployed in all of them.
 *
 *   phase                  S3_STORAGE  migration  MinIO
 *   new environment        seaweedfs   false      off
 *   existing, not started  minio       false      on
 *   migrating              minio       true       on
 *   cut over               seaweedfs   true       on, for a last copy
 *   done                   seaweedfs   false      off
 *
 * MinIO is needed while the services use it, and while the job copies from it.
 */

export const S3_STORAGE_VARIABLE = 'S3_STORAGE'
export const MIGRATION_VARIABLE = 'MINIO_TO_SEAWEEDFS_MIGRATION_ENABLED'

export type S3Storage = 'minio' | 'seaweedfs'

export type StoredObjectStorage = {
  storage: S3Storage | undefined
  migration: boolean | undefined
}

export type ObjectStorageAnswers = {
  migrate?: boolean
  storage?: S3Storage
}

export type ObjectStorage = {
  /** The store the OpenCRVS services use */
  storage: S3Storage
  /** The dependencies chart copies MinIO into SeaweedFS on each deployment */
  migrationEnabled: boolean
  minioEnabled: boolean
  seaweedfsEnabled: true
  servicesUseSeaweedfs: boolean
}

/**
 * @throws when a variable was changed by hand to something that is not a value
 * of it, instead of guessing which store the environment runs
 */
export function parseStoredObjectStorage(
  storage: string | undefined,
  migration: string | undefined
): StoredObjectStorage {
  if (storage !== undefined && storage !== 'minio' && storage !== 'seaweedfs') {
    throw new Error(
      `${S3_STORAGE_VARIABLE} must be minio or seaweedfs, found '${storage}'`
    )
  }
  if (
    migration !== undefined &&
    migration !== 'true' &&
    migration !== 'false'
  ) {
    throw new Error(
      `${MIGRATION_VARIABLE} must be true or false, found '${migration}'`
    )
  }
  return {
    storage,
    migration: migration === undefined ? undefined : migration === 'true'
  }
}

/**
 * An environment that was set up before SeaweedFS: it has values already, and
 * none of them says which store it uses. Having values is what tells it from a
 * new environment, which exists on GitHub as soon as the command starts, before
 * anything is stored. The environment does not stay one: this run stores
 * S3_STORAGE, so the next run is not a legacy environment.
 */
export function isLegacyEnvironment(
  hasEnvironmentValues: boolean,
  stored: StoredObjectStorage
) {
  return hasEnvironmentValues && stored.storage === undefined
}

/**
 * MinIO is part of the environment, so the user chooses the next phase: whether
 * to copy, and when to switch the services. A new environment, and one that has
 * finished, have nothing to choose.
 */
export function needsObjectStorageAnswers(
  legacy: boolean,
  stored: StoredObjectStorage
) {
  return legacy || stored.storage === 'minio' || stored.migration === true
}

export function resolveObjectStorage({
  legacy,
  stored,
  answers
}: {
  legacy: boolean
  stored: StoredObjectStorage
  answers: ObjectStorageAnswers
}): ObjectStorage {
  const storage: S3Storage =
    answers.storage ?? stored.storage ?? (legacy ? 'minio' : 'seaweedfs')
  const migrationEnabled = answers.migrate ?? stored.migration ?? false

  return {
    storage,
    migrationEnabled,
    minioEnabled: storage === 'minio' || migrationEnabled,
    seaweedfsEnabled: true,
    servicesUseSeaweedfs: storage === 'seaweedfs'
  }
}

/**
 * What to tell the user about the phase that the answers lead to. SeaweedFS has
 * hostnames of its own, which MinIO's records do not cover.
 */
export function objectStorageNextSteps(
  resolved: ObjectStorage,
  previous: { legacy: boolean; stored: StoredObjectStorage }
): string[] {
  const dnsRecords =
    'Make sure DNS has records for seaweedfs.<domain> and seaweedfs-console.<domain>, or a wildcard record that covers them.'

  if (resolved.storage === 'minio' && !resolved.migrationEnabled) {
    return [
      'The OpenCRVS services keep using MinIO. SeaweedFS is deployed next to it and is not used yet, and the data of MinIO is not copied.',
      'Run this command again and turn copying on to start the migration.'
    ]
  }

  if (resolved.storage === 'minio') {
    return [
      'The documents are copied from MinIO to SeaweedFS on every deployment, and the OpenCRVS services keep using MinIO.',
      'SeaweedFS needs free disk space on the data node as large as the data of MinIO.',
      'The copy can run any number of times. When it has finished and you have checked the result, run this command again and choose SeaweedFS to switch the services.'
    ]
  }

  if (resolved.migrationEnabled) {
    return [
      'The OpenCRVS services use SeaweedFS. MinIO stays, and the copy still runs on each deployment, to bring over what was written to MinIO right before the switch.',
      dnsRecords,
      'Once the last copy has run and everything works, run this command again and turn copying off. That removes MinIO from the deployment, and its data stays on the disk.'
    ]
  }

  const finishing =
    previous.legacy ||
    previous.stored.storage === 'minio' ||
    previous.stored.migration === true

  if (finishing) {
    return [
      'MinIO is no longer deployed, and SeaweedFS is the only object store of this environment.',
      'The data of MinIO is still on the data node, in /data/minio. Delete it once you have confirmed that everything works.',
      dnsRecords
    ]
  }

  return ['SeaweedFS is the only object store of this environment.', dnsRecords]
}
