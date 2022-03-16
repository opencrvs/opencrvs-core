/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { countries as countryList, lookup } from 'country-data'
import { orderBy, uniqBy, omit } from 'lodash'
import { IntlShape } from 'react-intl'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { messages } from '@client/i18n/messages/views/config'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  ICurrency,
  IFullProps,
  State
} from '@client/views/SysAdmin/Config/DynamicModal'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'

interface ICurrencyOptions {
  [key: string]: string
}

type ICountrylist = {
  alpha2: string
  alpha3: string
  countryCallingCodes: string[]
  currencies: string[]
  emoji: string
  ioc: string
  languages: string[]
  name: string
  status: string
}

export const getCurrencyObject = (value: string) => {
  const arr = value.split('-')
  return {
    isoCode: arr.pop(),
    languagesAndCountry: [arr.join('-')]
  }
}

export const getCurrencySelectOptions = () => {
  const currencyOptions = [] as ICurrencyOptions[]
  countryList.all.map((element: ICountrylist) => {
    const countryLanguage = lookup.languages({
      alpha3: element.languages[0]
    })
    const countryCurrency = lookup.currencies({
      code: element.currencies[0]
    })

    if (Boolean(element.currencies.length) && Boolean(countryLanguage[0])) {
      currencyOptions.push({
        value: `${countryLanguage[0].alpha2}-${element.alpha2}-${element.currencies[0]}`,
        label: countryCurrency[0].name
      })
    }
  })
  const uniqCurrencyOptions = uniqBy(currencyOptions, 'label')
  const sortedCountryOptions = orderBy(uniqCurrencyOptions, ['label'], ['asc'])
  return sortedCountryOptions
}

export const getTitle = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameLabel)
  else if (changeModalName === GeneralActionId.CURRENCY)
    return intl.formatMessage(messages.currencyLable)
  else return EMPTY_STRING
}

export const getMessage = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameChangeMessage)
  else if (changeModalName === GeneralActionId.GOVT_LOGO)
    return intl.formatMessage(messages.govtLogoChangeMessage)
  else if (changeModalName === GeneralActionId.CURRENCY)
    return intl.formatMessage(messages.applicationCurrencyChangeMessage)
  else return EMPTY_STRING
}

export const isApplyButtonDisabled = (
  state: State,
  changeModalName: string
) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME) {
    return !Boolean(state.applicationName)
  } else if (changeModalName === GeneralActionId.GOVT_LOGO) {
    return !Boolean(state.govtLogo)
  } else if (changeModalName === GeneralActionId.CURRENCY) {
    return !Boolean(state.currency)
  } else return true
}

export async function callUpdateApplicationNameMutation(
  applicationName: string,
  props: IFullProps,
  updatingValue: (value: boolean) => void,
  setError: (errorMessage: string) => void
) {
  try {
    updatingValue(true)
    const res = await configApplicationMutations.mutateApplicationConfig({
      APPLICATION_NAME: applicationName
    })
    if (res && res.data) {
      updatingValue(false)
      const APPLICATION_NAME = res.data.updateApplicationConfig.APPLICATION_NAME
      const offlineConfig = {
        config: {
          ...props.offlineCountryConfiguration.config,
          APPLICATION_NAME
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    setError(props.intl.formatMessage(messages.applicationConfigChangeError))
  }
}

export async function callUpdateGovtLogoMutation(
  govtLogo: string,
  logoFileName: string,
  props: IFullProps,
  updatingValue: (value: boolean) => void,
  setError: (errorMessage: string) => void
) {
  try {
    updatingValue(true)

    const COUNTRY_LOGO = {
      file: govtLogo,
      fileName: logoFileName
    }
    const res = await configApplicationMutations.mutateApplicationConfig({
      COUNTRY_LOGO
    })
    if (res && res.data) {
      updatingValue(false)
      const COUNTRY_LOGO_FILE =
        res.data.updateApplicationConfig.COUNTRY_LOGO.file
      const COUNTRY_LOGO_FILE_NAME =
        res.data.updateApplicationConfig.COUNTRY_LOGO.fileName
      const updatedOfflineConfig = {
        config: {
          ...props.offlineCountryConfiguration.config,
          COUNTRY_LOGO: {
            file: COUNTRY_LOGO_FILE,
            fileName: COUNTRY_LOGO_FILE_NAME
          }
        }
      }
      props.updateConfig(updatedOfflineConfig)
    }
  } catch (err) {
    setError(props.intl.formatMessage(messages.govtLogoChangeError))
  }
}

export async function callUpdateApplicationCurrencyMutation(
  currency: ICurrency,
  props: IFullProps,
  updatingValue: (value: boolean) => void,
  setError: (errorMessage: string) => void
) {
  try {
    const res = await configApplicationMutations.mutateApplicationConfig({
      CURRENCY: currency
    })
    if (res && res.data) {
      updatingValue(false)
      const CURRENCY = res.data.updateApplicationConfig.CURRENCY
      omit(CURRENCY, ['__typename'])
      const offlineConfig = {
        config: {
          ...props.offlineCountryConfiguration.config,
          CURRENCY
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    setError(props.intl.formatMessage(messages.applicationConfigChangeError))
  }
}
