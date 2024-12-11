import { MessageDescriptor, useIntl } from 'react-intl'
import mapKeys from 'lodash/mapKeys'

const INTERNAL_SEPARATOR = '___'
function convertDotToTripleUnderscore(
  obj: Record<string, any>
): Record<string, any> {
  return mapKeys(obj, (value, key) => key.replace(/\./g, INTERNAL_SEPARATOR))
}

function convertDotInCurlyBraces(str: string): string {
  return str.replace(/{([^}]+)}/g, (match, content) => {
    // Replace dots with triple underscores within the curly braces
    const transformedContent = content.replace(/\./g, INTERNAL_SEPARATOR)
    return `{${transformedContent}}`
  })
}

export const useIntlFormatMessageWithFlattenedParams = () => {
  const intl = useIntl()

  const formatMessage = (
    message: MessageDescriptor,
    params?: Record<string, any>
  ) => {
    return intl.formatMessage(
      {
        id: message.id,
        description: message.description,
        defaultMessage: convertDotInCurlyBraces(
          message.defaultMessage as string
        )
      },
      convertDotToTripleUnderscore(params ?? {})
    )
  }

  return {
    ...intl,
    formatMessage
  }
}
