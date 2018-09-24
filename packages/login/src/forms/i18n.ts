import { InjectedIntl } from 'react-intl'
import { IValidationResult } from '@opencrvs/login/src/utils/validate'

export function localiseValidationError(
  intl: InjectedIntl,
  error: IValidationResult
) {
  return intl.formatMessage(error.message, error.props)
}
