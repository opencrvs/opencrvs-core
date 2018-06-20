import { FormattedMessage } from 'react-intl'

export interface IIntlDynamicProps {
  [key: string]: {
    [key: string]: string | number
  }
}

export const substituteDynamicIntlProps = (
  message: FormattedMessage.MessageDescriptor,
  options?: IIntlDynamicProps
): string => {
  const dynamicProps = /see (chapter \d+(\.\d)*)/i

  return ''
}
