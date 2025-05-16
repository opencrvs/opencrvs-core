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

import React from 'react'
import {
  Toaster as ReactHotToaster,
  Renderable,
  ToastBar
} from 'react-hot-toast'
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'

export enum ToastKey {
  NOT_ASSIGNED_ERROR = 'v2.errors.notAssigned'
}

const availableToasts: Record<ToastKey, MessageDescriptor> = {
  [ToastKey.NOT_ASSIGNED_ERROR]: {
    id: 'v2.errors.notAssigned',
    defaultMessage: "You've been unassigned from the event",
    description: 'User not assigned error toast message'
  }
}

const Message = styled.span`
  margin: 0 1rem;
  font-family: ${({ theme }) => theme.fontFamily};
`

export function Toaster() {
  const { formatMessage } = useIntl()

  // When calling the react-hot-toast toast.<success/error/etc.>() function, the string message is transformed into a React element.
  // This function extracts the actual message from the React element, so we can fetch the matching translation with it.
  function getMessage(message: Renderable) {
    const msgElement = message?.valueOf() as React.ReactElement
    const messageValue = msgElement.props.children
    const translation =
      messageValue in availableToasts &&
      availableToasts[messageValue as ToastKey]

    return translation ? formatMessage(translation) : message
  }

  return (
    <ReactHotToaster
      position="bottom-center"
      toastOptions={{ duration: 6000, style: { maxWidth: '30rem' } }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => {
            return (
              <>
                {icon}
                <Message>{getMessage(message)}</Message>
              </>
            )
          }}
        </ToastBar>
      )}
    </ReactHotToaster>
  )
}
