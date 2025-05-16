import React from 'react'
import {
  Toaster as ReactHotToaster,
  Renderable,
  ToastBar,
  toast
} from 'react-hot-toast'
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { Button } from '@opencrvs/components/lib/buttons'
import { Icon } from '@opencrvs/components/lib/Icon'

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
  padding: 0 1rem;
`

// TODO CIHAN: fix font

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
    <ReactHotToaster position="bottom-center" toastOptions={{ duration: 6000 }}>
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => {
            return (
              <>
                {icon}
                <Message>{getMessage(message)}</Message>
                {t.type !== 'loading' && (
                  <Button onClick={() => toast.dismiss(t.id)}>
                    <Icon color="primary" name="Close" size="large" />
                  </Button>
                )}
              </>
            )
          }}
        </ToastBar>
      )}
    </ReactHotToaster>
  )
}
