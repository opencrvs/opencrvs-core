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
   * `at` rather than an index: a record with no versions leaves
   * `selectedIndex` at -1, and indexing would type that away as a
   * `RecordVersion`, making the guards downstream look redundant.
   */
  const selected = versions.at(selectedIndex)

  /*
   * The previous version *of the same form*. Crossing forms describes no
   * change anyone made: a notification is partial by design, so its difference
   * from the first declaration is the record being completed rather than
   * edited, and a first registration carries what the declaration before it
   * carried.
   *
   * A version, never the previous action — CREATE precedes the first
   * declaration and carries an empty declaration, which would read as every
   * field being added.
   */
  const previous = versions
    .slice(0, Math.max(selectedIndex, 0))
    .filter(({ form }) => form === selected?.form)
    .at(-1)

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
