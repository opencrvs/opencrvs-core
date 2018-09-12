import * as React from 'react'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'
import { IValidationResult } from '../../utils/validate'
import { Omit } from '../../utils'

// Wrapped component takes a validation object to be translated instead of an error string
export type MetaPropsWithMessageDescriptors = {
  error: IValidationResult
  touched: boolean
}

type PropsForFinalComponent = Omit<
  Omit<IInputFieldProps, 'meta'>,
  'description'
> & {
  meta: MetaPropsWithMessageDescriptors
  description?: FormattedMessage.MessageDescriptor
  onChange: (value: string | string[] | React.ChangeEvent<any>) => void
}

export function localizeInput<InputComponentProps>(
  Component: React.ComponentClass<IInputFieldProps & InputComponentProps>
): React.ComponentClass<PropsForFinalComponent> {
  class LocalizedInput extends React.Component<
    PropsForFinalComponent & InputComponentProps & InjectedIntlProps,
    {}
  > {
    render() {
      const { meta, intl, description } = this.props

      return (
        <Component
          {...this.props}
          description={
            description &&
            intl.formatMessage(
              // No idea why cast was needed. Typescript doesn't
              // seem to figure out it can't be undefined anymore
              description as FormattedMessage.MessageDescriptor
            )
          }
          meta={{
            touched: meta.touched,
            error:
              meta.error &&
              intl.formatMessage(meta.error.message, meta.error.props)
          }}
        />
      )
    }
  }
  return injectIntl<PropsForFinalComponent & InputComponentProps>(
    LocalizedInput
  )
}
