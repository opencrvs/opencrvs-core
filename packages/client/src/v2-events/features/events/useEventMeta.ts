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
import { createJSONStorage, persist } from 'zustand/middleware'
import { ActionFormData } from '@opencrvs/commons/client'
import { storage } from '@client/storage'

interface EventMetadata {
  metadata: ActionFormData
  setMetadata: (eventId: string, data: ActionFormData) => void
  setInitialMetadataValues: (eventId: string, data: ActionFormData) => void
  getMetadata: (
    eventId: string,
    initialValues?: ActionFormData
  ) => ActionFormData
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
  eventId: string
}

function removeUndefinedKeys(data: ActionFormData) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
}
/**
 * Interface representing the form data and related operations for an event.
 *
 * @property {ActionFormData} metadata - The current form values.
 * @property {function} setMetadata - Sets the form values for a given event ID.
 * @property {function} setInitialMetadataValues - Sets the form values for a given event ID only if they are empty.
 * This method is to be used when initializing the form state on load in form actions. Otherwise, what can happen is the user makes changes, for instance in correction views, reloads the page, and their changes get cleared out once the event is downloaded from the backend.
 * @property {function} getMetadata - Retrieves the form values for a given event ID.
 * @property {function} getTouchedFields - Retrieves the fields that have been touched.
 * @property {function} clear - Clears the form values.
 * @property {string} eventId - The ID of the event.
 */

export const useEventMetadata = create<EventMetadata>()(
  persist(
    (set, get) => ({
      metadata: {},
      eventId: '',
      getMetadata: (eventId: string, initialValues?: ActionFormData) =>
        get().eventId === eventId ? get().metadata : initialValues ?? {},
      setMetadata: (eventId: string, data: ActionFormData) => {
        const metadata = removeUndefinedKeys(data)
        return set(() => ({ eventId, metadata }))
      },
      setInitialMetadataValues: (eventId: string, data: ActionFormData) => {
        if (get().eventId === eventId) {
          return
        }
        const metadata = removeUndefinedKeys(data)
        return set(() => ({ eventId, metadata }))
      },
      getTouchedFields: () =>
        Object.fromEntries(
          Object.entries(get().metadata).map(([key, value]) => [key, true])
        ),
      clear: () => set(() => ({ eventId: '', metadata: {} }))
    }),
    {
      name: 'event-meta-data',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          return storage.getItem(key)
        },
        setItem: async (key, value) => {
          await storage.setItem(key, value)
        },
        removeItem: async (key) => {
          await storage.removeItem(key)
        }
      }))
    }
  )
)
