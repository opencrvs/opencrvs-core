import { IApplication } from '@register/applications'
import { InjectedIntl } from 'react-intl'
import { IPDFTemplate } from '@register/pdfRenderer'

export const fieldTransformers = {
  getIntlLabel: (
    template: IPDFTemplate,
    application: IApplication,
    intl: InjectedIntl,
    messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor
  ) => {
    return intl.formatMessage(messageDescriptor, { ...application.data })
  }
}
