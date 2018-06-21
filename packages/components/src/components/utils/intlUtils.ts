import { FormattedMessage, InjectedIntl } from 'react-intl'

export interface IIntlDynamicProps {
  [key: string]: {
    [key: string]: string | number
  }
}

export const getDynamicKeysFromString = (
  myString: string,
  expression: RegExp
): string[] | null => {
  return myString.match(expression)
}

export const substituteDynamicIntlProps = (
  intl: InjectedIntl,
  message: FormattedMessage.MessageDescriptor,
  dynamicProps?: IIntlDynamicProps
): string => {
  const messageString = message.defaultMessage ? message.defaultMessage : ''
  const dynamicKeys: string[] | null = getDynamicKeysFromString(
    messageString,
    new RegExp('(?<={)(.*)(?=})', 'g')
  )
  if (dynamicKeys && dynamicKeys.length > 0 && dynamicProps) {
    return intl.formatMessage(message, dynamicProps[message.id])
  } else {
    return intl.formatMessage(message)
  }
}
