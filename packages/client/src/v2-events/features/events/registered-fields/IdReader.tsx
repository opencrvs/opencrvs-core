import React from 'react'
import { useIntl } from 'react-intl'
import {
  EventState,
  IdReaderField,
  IdReaderFieldValue
} from '@opencrvs/commons/client'
import { IdReader as IdReaderUI } from '@opencrvs/components/src/IdReader'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

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

function IdReaderInput({
  id,
  methods,
  onChange
}: {
  id: string
  methods: IdReaderField['methods']
  onChange: (data: IdReaderFieldValue) => void
}) {
  const intl = useIntl()
  const handleChange = (values: EventState) => {
    onChange(Object.values(values)[0])
  }
  return (
    <IdReaderUI
      dividerLabel={intl.formatMessage(messages.or)}
      manualInputInstructionLabel={intl.formatMessage(
        messages.manualInputInstructionLabel
      )}
    >
      <FormFieldGenerator fields={methods} id={id} onChange={handleChange} />
    </IdReaderUI>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
