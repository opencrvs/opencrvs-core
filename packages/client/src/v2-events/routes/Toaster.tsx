import React from 'react'
import { Toaster as ReactHotToaster, ToastBar, toast } from 'react-hot-toast'
import { MessageDescriptor, useIntl } from 'react-intl'
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

export function Toaster() {
  const { formatMessage } = useIntl()

  return (
    <ReactHotToaster position="bottom-center" toastOptions={{ duration: 6000 }}>
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => {
            const msgElement = message?.valueOf() as React.ReactElement
            const messageValue = msgElement.props?.children
            console.log(messageValue)
            const toastTranslation =
              messageValue in availableToasts &&
              availableToasts[messageValue as ToastKey]

            console.log(toastTranslation)

            const displayedMessage = toastTranslation
              ? formatMessage(toastTranslation)
              : message

            console.log(displayedMessage)

            // console.log(JSON.stringify(message, null, 2))
            // console.log(rest)
            // const toastConfig =  availableToasts[message]
            // const toastMessage = formatMessage(toastConfig.message)

            return (
              <>
                {icon}
                {displayedMessage}
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
