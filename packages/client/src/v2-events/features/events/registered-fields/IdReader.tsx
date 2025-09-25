import React from 'react'
import { useIntl } from 'react-intl'
import { FieldType } from '@opencrvs/commons/client'
import { QrReader } from '@opencrvs/components/src/IdReader/readers/QrReader/QrReader'
import { IdReader as IdReaderUI } from '@opencrvs/components/src/IdReader'
import { LinkButton } from './LinkButton'

interface ReadingMethod {
  type: (typeof FieldType)[keyof typeof FieldType]
  // @todo: add proper type
  configuration?: Record<string, any>
}

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

function GeneratedReaderInput(props: ReadingMethod) {
  if (props.type === FieldType.QR_READER) {
    return (
      <QrReader
        labels={{
          button: 'Scan ID QR code',
          scannerDialogSupportingCopy: '',
          tutorial: { cameraCleanliness: '', distance: '', lightBalance: '' }
        }}
        onScan={(data) => console.log(data)}
      />
    )
  }

  if (props.type === FieldType.EXTERNAL_AUTHENTICATOR) {
    return (
      <LinkButton.Input
        configuration={{
          url: props.configuration?.url,
          text: props.configuration?.text
        }}
        id=""
      />
    )
  }

  throw new Error('Unsupported reading method type: ' + props.type)
}

function IdReaderInput({ methods }: { methods: ReadingMethod[] }) {
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
          configuration={method.configuration}
          type={method.type}
        />
      ))}
    </IdReaderUI>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
