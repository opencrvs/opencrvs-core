import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TemplateTransformerData,
  TransformerPayload,
  IOfflineAddressPayload
} from '@register/pdfRenderer/transformer/types'
import { getValueFromApplicationDataByKey } from '@register/pdfRenderer/transformer/utils'

export const offlineTransformers: IFunctionTransformer = {
  /*
    OfflineCompanyLogo provides the company logo from offline data.    
  */
  OfflineCompanyLogo: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.resource.assets.logo
  },

  // TODO: need to document
  OfflineAddress: (
    templateData: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const params = payload && (payload as IOfflineAddressPayload)
    if (!params) {
      throw new Error('No payload found for this transformer')
    }
    const matchedCondition = params.conditionalKeys.find(conditionalKey => {
      try {
        return conditionalKey.condition.matchValues.includes(
          getValueFromApplicationDataByKey(
            templateData.application.data,
            conditionalKey.condition.key
          )
        )
      } catch (error) {
        return false
      }
    })
    if (!matchedCondition) {
      throw new Error('No condition has matched for this transformer')
    }
    const keys = matchedCondition.formattedKeys.match(/\{.*?\}/g)
    const keyValues: { [key: string]: string } = {}
    keys &&
      keys.forEach(key => {
        keyValues[key] = getValueFromApplicationDataByKey(
          templateData.application.data,
          // Getting rid of { }
          key.substr(1, key.length - 2)
        )
      })
    let value = matchedCondition.formattedKeys
    Object.keys(keyValues).forEach(key => {
      const addresses =
        templateData.resource[
          matchedCondition.addressType as keyof typeof templateData.resource
        ]
      const address = addresses[keyValues[key] as keyof typeof addresses]
      value = value.replace(
        new RegExp(`${key}`, 'g'),
        address[matchedCondition.addressKey] || ''
      )
    })
    return value
  }
}
