import React from 'react'
import {
  Toaster as ReactHotToaster,
  Renderable,
  ToastBar
} from 'react-hot-toast'
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { family } from '@opencrvs/components/lib/fonts'

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
  font-family: ${family};
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
