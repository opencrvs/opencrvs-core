import { useIntl } from 'react-intl'
import React from 'react'
import { QrReader as QrReaderUI } from '@opencrvs/components/lib/IdReader/readers/QrReader/QrReader'
import { QrReaderField } from '@opencrvs/commons/client'
import {
  tutorialMessages,
  messages as qrReaderMessages
} from '@client/i18n/messages/views/qr-reader'

interface QrReaderInputProps {
  configuration: QrReaderField['configuration']
  onChange: (data: unknown) => void
}

function QrReaderInput(props: QrReaderInputProps) {
  const intl = useIntl()
  return (
    <QrReaderUI
      fullWidth
      labels={{
        button: intl.formatMessage(qrReaderMessages.button),
        scannerDialogSupportingCopy: intl.formatMessage(
          qrReaderMessages.scannerDialogSupportingCopy
        ),
        tutorial: {
          cameraCleanliness: intl.formatMessage(
            tutorialMessages.cameraCleanliness
          ),
          distance: intl.formatMessage(tutorialMessages.distance),
          lightBalance: intl.formatMessage(tutorialMessages.lightBalance)
        }
      }}
      validator={props.configuration?.validator}
      onScan={(data) => props.onChange(data)}
    />
  )
}

export const QrReader = {
  Input: QrReaderInput,
  Output: null
}
