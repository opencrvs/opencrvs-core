import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import { isEqual } from 'lodash'
import {
  EventState,
  FieldValue,
  IdReaderField,
  IdReaderFieldValue
} from '@opencrvs/commons/client'
import { IdReader as IdReaderUI } from '@opencrvs/components/src/IdReader'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

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
  const validatorContext = useValidatorContext()
  const fieldValues = useRef<FieldValue | undefined>(undefined)

  /**
   *
   * @param updated values of the reading methods
   * @returns only the updated value of one of the reading methods
   */
  const handleChange = (values: EventState) => {
    const prevValues = fieldValues.current

    for (const key of Object.keys(values)) {
      if (!isEqual(prevValues?.[key], values[key])) {
        fieldValues.current = values
        onChange(values as IdReaderFieldValue)
        return
      }
    }
  }

  return (
    <IdReaderUI
      dividerLabel={intl.formatMessage(messages.or)}
      manualInputInstructionLabel={intl.formatMessage(
        messages.manualInputInstructionLabel
      )}
    >
      <FormFieldGenerator
        fields={methods}
        id={id}
        validatorContext={validatorContext}
        onChange={handleChange}
      />
    </IdReaderUI>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
