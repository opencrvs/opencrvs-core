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
import {
  findLocalEventDocument,
  findLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
import { isTemporaryId } from '@client/v2-events/utils'

/**
 * Returns the locally stored event a temporary id points to.
 *
 * Events are created optimistically with a temporary id. Once the creation request
 * succeeds, the local copy is stored under both the temporary and the canonical id,
 * so anything queued while the event was unsynced can look up the canonical version.
 *
 * @throws if the event has not been created on the server yet, so that the calling
 * mutation is retried instead of referring to an id the server cannot resolve.
 */
export function getCreatedEvent(temporaryId: string) {
  const localVersion =
    findLocalEventIndex(temporaryId) || findLocalEventDocument(temporaryId)

  if (!localVersion || isTemporaryId(localVersion.id)) {
    throw new Error('Event that has not been stored yet cannot be actioned on')
  }

  return localVersion
}

/**
 * Replaces temporary event ids in a file path with the canonical ones.
 *
 * File paths are built from the event id (`events/<eventId>/<filename>`), which means
 * a file attached before the event has synced would otherwise be both uploaded to and
 * referenced from a path the server cannot resolve.
 *
 * @throws if the path refers to an event that has not been created on the server yet.
 */
export function resolveTemporaryIdInPath<T extends string>(path: T): T {
  return path
    .split('/')
    .map((chunk) => (isTemporaryId(chunk) ? getCreatedEvent(chunk).id : chunk))
    .join('/') as T
}
