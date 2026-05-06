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
import { deepDropNulls, FileFieldValue } from '@opencrvs/commons/client'
import { create } from 'zustand'

type EventState = {
  primaryOfficeId?: string
  role?: string
  name?: { firstname: string; surname: string }
  phoneNumber?: string
  email?: string
  fullHonorificName?: string
  device?: string
  signature?: FileFieldValue
  [key: string]: unknown
}

interface UserFormState {
  userForm?: EventState
  setUserForm: (data: EventState) => void
  getUserForm: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

export const useUserFormState = create<UserFormState>()((set, get) => ({
  getUserForm: (initialValues?: EventState) =>
    get().userForm || deepDropNulls(initialValues ?? {}),
  setUserForm: (data: EventState) => {
    return set(() => ({ userForm: data }))
  },
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().getUserForm()).map(([key]) => [key, true])
    ),
  clear: () => set(() => ({ userForm: undefined }))
}))
