import { InjectedIntl } from 'react-intl'
import {
  IConditionalIntLabelPayload,
  TransformerData,
  IFunctionTransformer,
  TransformerPayload
} from '@register/pdfRenderer/transformer/types'
import { getEventDifference } from '@register/pdfRenderer/transformer/utils'

export const serviceTransformers: IFunctionTransformer = {
  /*
    ServiceLabel provides the right service label based on the application data
    @params: 
      - [option]: Mendatory field which a list of message descriptors for different service options for different events
                  TODO: need to think a generic way to find right service
  */
  ServiceLabel: (
    application: TransformerData,
    intl: InjectedIntl,
    messages?: TransformerPayload
  ) => {
    return (
      (messages &&
        intl.formatMessage(
          (messages as IConditionalIntLabelPayload)[
            `${getEventDifference(
              application
            )}${application.event.toLowerCase()}`
          ]
        )) ||
      ''
    )
  },

  /*
    ServiceAmount provides the right service amount based on the application data
    @params: 
      - [option]: Mendatory field which a list of message descriptors of different amounts for different service options
                  TODO: need to think a generic way to find right service
  */

  ServiceAmount: (
    application: TransformerData,
    intl: InjectedIntl,
    messages?: TransformerPayload
  ) => {
    return (
      (messages &&
        intl.formatMessage(
          (messages as IConditionalIntLabelPayload)[
            `${getEventDifference(application)}`
          ]
        )) ||
      ''
    )
  }
}
