import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TemplateTransformerData,
  TransformerPayload,
  IOfflineAddressPayload
} from '@register/pdfRenderer/transformer/types'
import { getValueFromApplicationDataByKey } from '@register/pdfRenderer/transformer/utils'
import {
  IAvailableCountries,
  ICountry
} from '@register/views/PrintCertificate/utils'

const getKeyValues = (keys: any, templateData: TemplateTransformerData) =>
  keys.reduce((keyValues: { [key: string]: string }, key: string) => {
    keyValues[key] = getValueFromApplicationDataByKey(
      templateData.application.data,
      // Getting rid of { }
      key.substr(1, key.length - 2)
    )
    return keyValues
  }, {})

const getCountryValue = (
  countryCode: string,
  templateData: TemplateTransformerData
) => {
  return countryCode.toUpperCase() === window.config.COUNTRY.toUpperCase()
    ? countryCode
    : getValueFromApplicationDataByKey(
        templateData.application.data,
        // Getting rid of { }
        countryCode
      )
}

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
         - adddresses: Mendatory object. It is an object containing a countryCode and formatted keyes to determine how to parse local and international addresses and be able to traverse through the object structure
           and fetch the appropriate value if found otherwise will throw exception.  countryCode & localAddress are mandatory fields of the addresses object
           Ex: '{child.addressLine4}, {child.district}, {child.state}'
   */
  OfflineAddress: (
    templateData: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload,
    optionalData?: IAvailableCountries[]
  ) => {
    const params = payload && (payload as IOfflineAddressPayload)
    if (!params) {
      throw new Error('No payload found for this transformer')
    }

    if (!optionalData) {
      throw new Error('No countries found for this transformer')
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
    const countryValue = getCountryValue(
      matchedCondition.addresses.countryCode,
      templateData
    )
    const countries: ICountry[] = optionalData.filter(
      (country: IAvailableCountries) => {
        return country.language === params.language
      }
    )[0].countries as ICountry[]
    const countryMessage = countries.filter((country: ICountry) => {
      return country.value === countryValue
    })[0].name

    let value = ''
    if (matchedCondition.addresses.localAddress.match(/\{.*?\}/g) === null) {
      value = matchedCondition.addresses.localAddress
    } else if (countryValue === window.config.COUNTRY.toUpperCase()) {
      const keyValues = getKeyValues(
        matchedCondition.addresses.localAddress.match(/\{.*?\}/g),
        templateData
      )
      value = Object.keys(keyValues).reduce((value, key) => {
        if (keyValues[key] === undefined || keyValues[key] === '') {
          return value.replace(new RegExp(`${key}, `, 'g'), '')
        } else if (key.includes('country')) {
          return value.replace(new RegExp(`${key}`, 'g'), countryMessage || '')
        } else {
          const addresses =
            templateData.resource[
              matchedCondition.addressType as keyof typeof templateData.resource
            ]
          const address = addresses[keyValues[key] as keyof typeof addresses]
          return value.replace(
            new RegExp(`${key}`, 'g'),
            address[matchedCondition.addressKey] || ''
          )
        }
      }, matchedCondition.addresses.localAddress)
    } else if (params.language !== 'en') {
      value = countryMessage
    } else if (matchedCondition.addresses.internationalAddress) {
      const keyValues = getKeyValues(
        matchedCondition.addresses.internationalAddress.match(/\{.*?\}/g),
        templateData
      )
      value = Object.keys(keyValues).reduce((value, key) => {
        if (key.includes('country')) {
          return value.replace(new RegExp(`${key}`, 'g'), countryMessage || '')
        } else {
          return value.replace(new RegExp(`${key}`, 'g'), keyValues[key])
        }
      }, matchedCondition.addresses.internationalAddress)
    }
    return value
  }
}
