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

import React, { PropsWithChildren, useContext, createContext } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import { Toast, ToastType } from '@opencrvs/components'

interface ToastConfig {
  type: ToastType
  message: MessageDescriptor
}

export enum ToastKey {
  NOT_ASSIGNED_ERROR = 'not-assigned-error',
  EVENT_CREATED = 'event-created'
}

const availableToasts: Record<ToastKey, ToastConfig> = {
  [ToastKey.NOT_ASSIGNED_ERROR]: {
    type: 'error',
    message: {
      id: 'v2.errors.notAssigned',
      defaultMessage: "You've been unassigned from the event",
      description: 'User not assigned error toast message'
    }
  },
  [ToastKey.EVENT_CREATED]: {
    type: 'success',
    message: {
      id: 'v2.errors.notAssigned',
      defaultMessage: "You've been unassigned from the event",
      description: 'User not assigned error toast message'
    }
  }
}

const ToastContext = createContext<{
  toasts: ToastKey[]
  addToast: (toastKey: ToastKey) => void
}>({
  toasts: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addToast: () => {}
})

export function useToastContext() {
  return useContext(ToastContext)
}

export function ToastContainer({ children }: PropsWithChildren) {
  const intl = useIntl()

  // TODO CIHAN: poista EVENT_CREATED
  const [toasts, setToasts] = React.useState<ToastKey[]>([
    ToastKey.EVENT_CREATED
  ])

  const addToast = (toastKey: ToastKey) =>
    setToasts((prev) => [...prev, toastKey])

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      {toasts.map((toastKey) => (
        <Toast
          key={toastKey}
          id={toastKey}
          type={availableToasts[toastKey].type}
          onClose={() =>
            setToasts((prev) => prev.filter((t) => t !== toastKey))
          }
        >
          {intl.formatMessage(availableToasts[toastKey].message)}
        </Toast>
      ))}
    </ToastContext.Provider>
  )
}
