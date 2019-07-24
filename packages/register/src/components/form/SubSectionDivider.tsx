import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import {
  ISubSectionProps,
  SubSectionDivider as SubSectionDividerComponent
} from '@opencrvs/components/lib/forms'
import { Omit } from '@opencrvs/register/src/utils'
import { formMessages } from '@register/i18n/messages'

export const SubSectionDivider = injectIntl(function FormInputField(
  props: Omit<ISubSectionProps, 'optionalLabel'> & InjectedIntlProps
) {
  return (
    <SubSectionDividerComponent
      {...props}
      optionalLabel={props.intl.formatMessage(formMessages.optionalLabel)}
    />
  )
})
