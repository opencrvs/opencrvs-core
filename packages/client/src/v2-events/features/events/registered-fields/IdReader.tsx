import React from 'react'
import { useIntl } from 'react-intl'
import {
  FieldType,
  IdReaderField,
  IdReaderFieldValue
} from '@opencrvs/commons/client'
import { QrReader } from '@opencrvs/components/src/IdReader/readers/QrReader/QrReader'
import { IdReader as IdReaderUI } from '@opencrvs/components/src/IdReader'
import {
  tutorialMessages,
  messages as qrReaderMessages
} from '@client/i18n/messages/views/qr-reader'

const messages = {
  or: {
    id: 'views.idReader.label.or',
    defaultMessage: 'Or',
    description: 'Label that shows on the divider'
  },
  manualInputInstructionLabel: {
    id: 'views.idReader.label.manualInput',
    defaultMessage: 'Complete fields below',
    description: 'Label that shows below the divider on the id reader component'
  }
}

function GeneratedReaderInput(
  props: IdReaderField['methods'][number] & {
    onChange: (data: IdReaderFieldValue) => void
  }
) {
  const intl = useIntl()
  if (props.type === FieldType.QR_READER) {
    return (
      <QrReader
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

  // TODO: complete
  // if (props.type === FieldType.EXTERNAL_AUTHENTICATOR) {
  //   return <LinkButton.Input configuration={props.configuration} id="" />
  // }

  throw new Error('Unsupported reading method type: ' + props.type)
}

function IdReaderInput({
  methods,
  onChange
}: {
  methods: IdReaderField['methods']
  onChange: (data: IdReaderFieldValue) => void
}) {
  const intl = useIntl()

  return (
    <IdReaderUI
      dividerLabel={intl.formatMessage(messages.or)}
      manualInputInstructionLabel={intl.formatMessage(
        messages.manualInputInstructionLabel
      )}
    >
      {methods.map((method) => (
        <GeneratedReaderInput
          key={method.type}
          onChange={onChange}
          {...method}
        />
      ))}
    </IdReaderUI>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
