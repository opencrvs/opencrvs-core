import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'
import { WrappedFieldProps } from 'redux-form'
import { Validation } from '../../utils/validate'

export function localizeInput<WrappedComponentProps>(
  Component: React.ComponentClass<IInputFieldProps & WrappedComponentProps>
): React.ComponentClass<
  IInputFieldProps & WrappedFieldProps & WrappedComponentProps
> {
  type AllProps = WrappedComponentProps & {
    meta: { error: Validation }
  } & IInputFieldProps &
    InjectedIntlProps &
    WrappedFieldProps
  class LocalizedInput extends React.Component<AllProps, {}> {
    render() {
      const { meta, intl, input } = this.props

      return (
        <Component
          {...this.props}
          {...input}
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
  return injectIntl<AllProps>(LocalizedInput)
}
