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

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ActionInput } from '@opencrvs/commons/client'
import { storage } from '@client/storage'

type FormData = ActionInput['data']

interface EventFormData {
  formValues: FormData
  setFormValues: (eventId: string, data: FormData) => void
  getFormValues: (eventId: string, initialValues?: FormData) => FormData
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
  eventId: string
}

export const useEventFormData = create<EventFormData>()(
  persist(
    (set, get) => ({
      formValues: {},
      eventId: '',
      getFormValues: (eventId: string, initialValues?: FormData) =>
        get().eventId === eventId ? get().formValues : initialValues ?? {},
      setFormValues: (eventId: string, data: FormData) =>
        set(() => ({ eventId, formValues: data })),
      getTouchedFields: () =>
        Object.fromEntries(
          Object.entries(get().formValues).map(([key, value]) => [key, true])
        ),
      clear: () => set(() => ({ eventId: '', formValues: {} }))
    }),
    {
      name: 'event-form-data',
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
