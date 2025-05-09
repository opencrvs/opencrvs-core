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
    for adding annotation fields on review pages.
 */

import { create } from 'zustand'
import { EventState, deepDropNulls } from '@opencrvs/commons/client'

interface ActionAnnotationProps {
  annotation?: EventState
  setAnnotation: (data: EventState) => void
  getAnnotation: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
  registrationNumber?: string
}

function removeUndefinedKeys(data: EventState) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )
}
/**
 * Interface representing the form data and related operations for an event.
 *
 * @property {EventState} annotation - The current form values.
 * @property {function} setAnnotation - Sets the form values.
 * @property {function} setInitialAnnotationValues - Sets the form values only if they are empty.
 * This method is to be used when initializing the form state on load in form actions. Otherwise, what can happen is the user makes changes, for instance in correction views, reloads the page, and their changes get cleared out once the event is downloaded from the backend.
 * @property {function} getAnnotation - Retrieves the form values.
 * @property {function} getTouchedFields - Retrieves the fields that have been touched.
 * @property {function} clear - Clears the form values.
 */

export const useActionAnnotation = create<ActionAnnotationProps>()(
  (set, get) => ({
    getAnnotation: (initialValues?: EventState) =>
      get().annotation || deepDropNulls(initialValues ?? {}),
    setAnnotation: (data: EventState) => {
      const annotation = removeUndefinedKeys(data)
      return set(() => ({ annotation }))
    },
    getTouchedFields: () =>
      Object.fromEntries(
        Object.entries(get().getAnnotation()).map(([key]) => [key, true])
      ),
    clear: () => set(() => ({ annotation: undefined }))
  })
)
