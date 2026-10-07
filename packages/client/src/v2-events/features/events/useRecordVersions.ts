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

import { useCallback, useMemo } from 'react'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import {
  EventConfig,
  EventDocument,
  EventIndex,
  RecordVersion,
  UUID,
  getEventStateAtVersion,
  getRecordVersions
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'

interface UseRecordVersions {
  /** Oldest first. Empty only for a record with no accepted declaration action. */
  versions: RecordVersion[]
  /** Undefined only when there are no versions at all. */
  selected?: RecordVersion
  selectedState: EventIndex
  isLatest: boolean
  selectVersion: (actionId: UUID) => void
}

/**
 * Resolves the `version` search param against the record's versions.
 *
 * An absent, unknown or stale `version` falls back to the newest version, so a
 * shared link keeps working after the record has moved on.
 */
export function useRecordVersions({
  event,
  configuration,
  currentState
}: {
  event: EventDocument
  configuration: EventConfig
  /** Used when the record has no selectable version yet. */
  currentState: EventIndex
}): UseRecordVersions {
  const [{ version }, setSearchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.EVENT.RECORD
  )

  const versions = useMemo(() => getRecordVersions(event), [event])

  const latest = versions.at(-1)
  const selected =
    versions.find(({ actionId }) => actionId === version) ?? latest

  const selectedState = useMemo(
    () =>
      selected
        ? getEventStateAtVersion(event, configuration, selected.actionId)
        : currentState,
    [event, configuration, selected, currentState]
  )

  const selectVersion = useCallback(
    (actionId: UUID) =>
      setSearchParams((previous) => ({ ...previous, version: actionId })),
    [setSearchParams]
  )

  return {
    versions,
    selected,
    selectedState,
    isLatest: !latest || selected?.actionId === latest.actionId,
    selectVersion
  }
}
