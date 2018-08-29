import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'
import { IValidationResult } from '../../utils/validate'

// Wrapped component takes a validation object to be translated instead of an error string
type MetaPropsWithMessageDescriptors = {
  meta: { error: IValidationResult }
}

export function localizeInput<InputComponentProps>(
  Component: React.ComponentClass<IInputFieldProps & InputComponentProps>
): React.ComponentClass<IInputFieldProps & InputComponentProps> {
  type PropsForFinalComponent = InputComponentProps &
    MetaPropsWithMessageDescriptors &
    IInputFieldProps &
    InjectedIntlProps

  class LocalizedInput extends React.Component<PropsForFinalComponent, {}> {
    render() {
      const { meta, intl } = this.props

      return (
        <Component
          {...this.props}
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
  return injectIntl<PropsForFinalComponent>(LocalizedInput)
}
