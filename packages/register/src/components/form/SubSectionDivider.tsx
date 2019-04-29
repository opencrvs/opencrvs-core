import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { ISubSectionProps } from '@opencrvs/components/lib/forms'
import { Omit } from 'utils'

import { SubSectionDivider as SubSectionDividerComponent } from '@opencrvs/components/lib/forms'

const messages = defineMessages({
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const SubSectionDivider = injectIntl(function FormInputField(
  props: Omit<ISubSectionProps, 'optionalLabel'> & InjectedIntlProps
) {
  return (
    <SubSectionDividerComponent
      {...props}
      optionalLabel={props.intl.formatMessage(messages.optionalLabel)}
    />
  )
})
