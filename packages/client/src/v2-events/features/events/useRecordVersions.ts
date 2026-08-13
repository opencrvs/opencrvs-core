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
  /** The version immediately before the selected one. Absent on the first. */
  previous?: RecordVersion
  /** State at `previous`, for comparing against. Absent on the first version. */
  previousState?: EventIndex
  isLatest: boolean
  selectVersion: (actionId: UUID) => void
  /** Whether the view marks up what changed from `previous`. */
  showChanges: boolean
  setShowChanges: (show: boolean) => void
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
  const [{ version, changes }, setSearchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.EVENT.RECORD
  )

  const versions = useMemo(() => getRecordVersions(event), [event])

  const requestedIndex = versions.findIndex(
    ({ actionId }) => actionId === version
  )

  /*
   * Resolve the index, not just the version. An absent, unknown or stale
   * `version` falls back to the newest — and everything downstream of the
   * selection, `previous` included, has to fall back with it.
   */
  const selectedIndex =
    requestedIndex >= 0 ? requestedIndex : versions.length - 1

  /*
   * `at` rather than an index, because a record with no versions yet leaves
   * `selectedIndex` at -1 and there is genuinely nothing to select. Indexing
   * types that away as a `RecordVersion`, which then makes every guard
   * downstream look redundant when it is the one thing holding the empty case
   * up.
   */
  const selected = versions.at(selectedIndex)

  /*
   * Compare against the previous *version*, never the previous action. A
   * record's first declaration is preceded by CREATE, which carries an empty
   * declaration — diffing against it would report every field as an addition.
   * CREATE is not a version, so indexing into `versions` avoids that.
   */
  const previous = selectedIndex > 0 ? versions[selectedIndex - 1] : undefined

  const selectedState = useMemo(
    () =>
      selected
        ? getEventStateAtVersion(event, configuration, selected.actionId)
        : currentState,
    [event, configuration, selected, currentState]
  )

  const previousState = useMemo(
    () =>
      previous
        ? getEventStateAtVersion(event, configuration, previous.actionId)
        : undefined,
    [event, configuration, previous]
  )

  const setShowChanges = useCallback(
    (show: boolean) =>
      setSearchParams((current) => ({
        ...current,
        changes: show || undefined
      })),
    [setSearchParams]
  )

  const selectVersion = useCallback(
    (actionId: UUID) =>
      /*
       * Selecting a version drops the comparison. The new version may have no
       * previous version or no changes, in which case there is nothing to show
       * and the toggle would not be offered.
       */
      setSearchParams((current) => ({
        ...current,
        version: actionId,
        changes: undefined
      })),
    [setSearchParams]
  )

  return {
    versions,
    selected,
    selectedState,
    previous,
    previousState,
    isLatest: selectedIndex === versions.length - 1,
    selectVersion,
    showChanges: Boolean(changes && previous),
    setShowChanges
  }
}
