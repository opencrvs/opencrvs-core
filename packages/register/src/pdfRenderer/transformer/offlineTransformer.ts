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

  /*
    OfflineAddress allows you to get coditional address fields from offline data
    @params: 
      -  conditionalKeys []: it expects an array of conditional blocks.
         - codition: holds the actual condition. Right now it's only equal matches
         - addressType: offline address type. Ex: facilities | locations
         - addressKey: field name of the address object. Ex: name | alias 
         - formattedKeys: Mendatory field. It will be able to traverse through the object structure
           and fetch the appropriate value if found otherwise will throw exception.
           Ex: '{child.addressLine4}, {child.district}, {child.state}'
   */
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
          // Will throw an exception when value is not found for given key
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
    const keyValues: { [key: string]: string } | null =
      keys &&
      keys.reduce((keyValues: { [key: string]: string }, key) => {
        keyValues[key] = getValueFromApplicationDataByKey(
          templateData.application.data,
          // Getting rid of { }
          key.substr(1, key.length - 2)
        )
        return keyValues
      }, {})

    if (!keyValues) {
      return matchedCondition.formattedKeys
    }
    const value = Object.keys(keyValues).reduce((value, key) => {
      const addresses =
        templateData.resource[
          matchedCondition.addressType as keyof typeof templateData.resource
        ]
      const address = addresses[keyValues[key] as keyof typeof addresses]
      return value.replace(
        new RegExp(`${key}`, 'g'),
        address[matchedCondition.addressKey] || ''
      )
    }, matchedCondition.formattedKeys)
    return value
  }
}
