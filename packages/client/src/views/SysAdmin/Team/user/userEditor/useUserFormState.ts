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
import {
  deepDropNulls,
  FileFieldValue,
  getUUID,
  UUID
} from '@opencrvs/commons/client'
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
  userId?: string
  /**
   * The id of the next user that the user editor creates. The editor uploads
   * files of the new user, for example the signature, to `users/<newUserId>/`
   * before the user exists, and sends the id to `user.create`. `clear()` sets
   * a new id, so each new user gets a different id.
   */
  newUserId: UUID
  userForm?: EventState
  setUserForm: (data: EventState, userId?: string) => void
  getUserForm: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

export const useUserFormState = create<UserFormState>()((set, get) => ({
  newUserId: getUUID(),
  getUserForm: (initialValues?: EventState) =>
    get().userForm || deepDropNulls(initialValues ?? {}),
  setUserForm: (data: EventState, userId?: string) => {
    return set(() => ({ userForm: data, ...(userId ? { userId } : {}) }))
  },
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().getUserForm()).map(([key]) => [key, true])
    ),
  clear: () =>
    set(() => ({
      userForm: undefined,
      userId: undefined,
      newUserId: getUUID()
    }))
}))
