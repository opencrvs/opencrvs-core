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
import { useEffect, useRef } from 'react'
import {
  isSelectableAtAnchor,
  LocationVersion,
  PlainDate,
  resolveVersion,
  UUID
} from '@opencrvs/commons/client'

/**
 * Clears a location/administrative-area field's value whenever the anchor
 * moves and the selected entity resolves to a different version than it did
 * before — whether that's because it's no longer selectable (inactivated, or
 * didn't exist yet) or simply because it was renamed. A version change
 * always invalidates the selection, even when the entity stays selectable,
 * so the registrar re-confirms rather than silently keeping a stale pick.
 *
 * Only runs while `enabled` (the field opted into `anchorToDateOfEvent`);
 * other fields keep their value untouched regardless of anchor changes.
 */
export function useClearStaleSelectionOnAnchorChange<
  T extends { versions: LocationVersion[] }
>({
  enabled,
  value,
  anchor,
  entities,
  onClear
}: {
  enabled: boolean
  value: string | null | undefined
  anchor: PlainDate
  entities: Map<UUID, T>
  onClear: () => void
}) {
  const previousAnchorRef = useRef(anchor)

  useEffect(() => {
    const previousAnchor = previousAnchorRef.current
    previousAnchorRef.current = anchor

    if (!enabled || !value || previousAnchor === anchor) {
      return
    }

    const id = UUID.safeParse(value).data
    const entity = id && entities.get(id)
    if (!entity) {
      return
    }

    const gotNewVersion =
      !isSelectableAtAnchor(entity.versions, anchor) ||
      resolveVersion(entity.versions, previousAnchor).versionId !==
        resolveVersion(entity.versions, anchor).versionId

    if (gotNewVersion) {
      onClear()
    }
  }, [enabled, value, entities, anchor, onClear])
}
