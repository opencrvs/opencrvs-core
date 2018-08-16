import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'
import { WrappedFieldProps } from 'redux-form'
import { Validation } from '../../utils/validate'

export const localizeInput = (
  Component: React.ComponentType<IInputFieldProps>
): React.ComponentType<IInputFieldProps & WrappedFieldProps> => {
  class LocalizedInput extends React.Component<
    { meta: { error: Validation } } & IInputFieldProps &
      InjectedIntlProps &
      WrappedFieldProps,
    {}
  > {
    render() {
      const { meta, intl, input, ...props } = this.props

      return (
        <Component
          {...input}
          {...props}
          meta={{
            touched: meta.touched,
            error:
              meta.error &&
              intl.formatMessage(meta.error.message, meta.error.values)
          }}
        />
      )
    }
  }
  return injectIntl(LocalizedInput)
}
