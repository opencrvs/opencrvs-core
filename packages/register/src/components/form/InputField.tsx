import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  IInputFieldProps,
  InputField as InputFieldComponent
} from '@opencrvs/components/lib/forms'
import { Omit } from '@opencrvs/register/src/utils'
import { formMessages } from '@register/i18n/messages'

export const InputField = injectIntl(function FormInputField(
  props: Omit<IInputFieldProps, 'optionalLabel'> & IntlShapeProps
) {
  return (
    <InputFieldComponent
      {...props}
      optionalLabel={props.intl.formatMessage(formMessages.optionalLabel)}
    />
  )
})
