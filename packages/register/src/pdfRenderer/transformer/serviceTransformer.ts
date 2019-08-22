import { InjectedIntl } from 'react-intl'
import {
  IConditionalIntLabelPayload,
  TransformerData,
  IFunctionTransformer,
  TransformerPayload,
  IFeildValuePayload
} from '@register/pdfRenderer/transformer/types'
import {
  getEventDifference,
  getValueFromApplicationDataByKey
} from '@register/pdfRenderer/transformer/utils'

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
  },

  BanglaNumberConversion: (
    application: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    const key = payload && (payload as IFeildValuePayload)
    if (!key) {
      throw new Error('No payload found for this transformer')
    }
    let value = getValueFromApplicationDataByKey(
      application.data,
      key.valueKey
    ) as string
    const numMap: { [key: string]: string } = {
      0: '০',
      1: '১',
      2: '২',
      3: '৩',
      4: '৪',
      5: '৫',
      6: '৬',
      7: '৭',
      8: '৮',
      9: '৯'
    }
    Object.keys(numMap).forEach(engNumber => {
      value = value.replace(new RegExp(engNumber, 'g'), numMap[engNumber])
    })
    return value
  }
}
