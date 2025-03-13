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

/**
    This is an exact copy of `useEventFormData` except for `useSubscribeEventFormData`.
    Due to how `useSubscribeEventFormData` works, it’s not possible to use `useEventFormData`
    for adding additional metadata fields on review pages.
 */

import { create } from 'zustand'
import {
  EventState,
  deepDropNulls,
  ActionDocument
} from '@opencrvs/commons/client'

interface EventMetadata {
  metadata?: EventState
  setMetadata: (data: EventState) => void
  setInitialMetadataValues: (data: EventState) => void
  getMetadata: (initialValues?: ActionDocument['metadata']) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

function removeUndefinedKeys(data: EventState) {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
}
/**
 * Interface representing the form data and related operations for an event.
 *
 * @property {EventState} metadata - The current form values.
 * @property {function} setMetadata - Sets the form values.
 * @property {function} setInitialMetadataValues - Sets the form values only if they are empty.
 * This method is to be used when initializing the form state on load in form actions. Otherwise, what can happen is the user makes changes, for instance in correction views, reloads the page, and their changes get cleared out once the event is downloaded from the backend.
 * @property {function} getMetadata - Retrieves the form values.
 * @property {function} getTouchedFields - Retrieves the fields that have been touched.
 * @property {function} clear - Clears the form values.
 */

export const useEventMetadata = create<EventMetadata>()((set, get) => ({
  getMetadata: (initialValues: ActionDocument['metadata']) =>
    get().metadata || deepDropNulls(initialValues ?? {}),
  setMetadata: (data: EventState) => {
    const metadata = removeUndefinedKeys(data)
    return set(() => ({ metadata }))
  },
  setInitialMetadataValues: (data: EventState) => {
    const metadata = removeUndefinedKeys(data)
    return set(() => ({ metadata }))
  },
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().getMetadata()).map(([key]) => [key, true])
    ),
  clear: () => set(() => ({ metadata: undefined }))
}))
