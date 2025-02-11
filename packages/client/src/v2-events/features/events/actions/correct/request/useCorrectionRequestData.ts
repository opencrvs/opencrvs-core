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
import { createJSONStorage, persist } from 'zustand/middleware'
import { ActionFormData } from '@opencrvs/commons/client'
import { storage } from '@client/storage'
interface CorrectionRequestData {
  formValues: ActionFormData
  setFormValues: (data: ActionFormData) => void
  getFormValues: () => ActionFormData
  clear: () => void
}

function removeUndefinedKeys(data: ActionFormData) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
}

export const useCorrectionRequestData = create<CorrectionRequestData>()(
  persist(
    (set, get) => ({
      formValues: {},
      eventId: '',
      getFormValues: () => get().formValues,
      setFormValues: (data: ActionFormData) => {
        const formValues = removeUndefinedKeys(data)
        return set(() => ({ formValues }))
      },
      clear: () => set(() => ({ formValues: {} }))
    }),
    {
      name: 'correction-form-data',
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
