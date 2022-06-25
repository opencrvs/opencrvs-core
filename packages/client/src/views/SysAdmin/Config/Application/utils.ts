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
import {
  BirthActionId,
  DeathActionId,
  GeneralActionId
} from '@client/views/SysAdmin/Config/Application'
import { messages } from '@client/i18n/messages/views/config'
import { EMPTY_STRING } from '@client/utils/constants'
import { IActionType, IApplicationConfig, IState } from './DynamicModal'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/Application/mutations'
import { IOfflineData } from '@client/offline/reducer'
import { IFormConfigSettingsProps } from '@client/views/SysAdmin/Config/Forms/Wizard/FormConfigSettings'
import { updateOfflineConfigData } from '@client/offline/actions'
import { Dispatch } from 'redux'

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

export const getCurrency = (offlineCountryConfiguration: IOfflineData) => {
  const currency = new Intl.NumberFormat(
    offlineCountryConfiguration.config.CURRENCY.languagesAndCountry,
    {
      style: 'currency',
      currency: offlineCountryConfiguration.config.CURRENCY.isoCode
    }
  )
    .format(0)
    .replace(/[0-9.,]/g, '')

  return currency
}
export const getCurrencyObject = (value: string) => {
  const arr = value.split('-')
  return {
    isoCode: arr.pop(),
    languagesAndCountry: [arr.join('-')]
  }
}

export function isValidRegEx(pattern: string): boolean {
  try {
    const value = ''
    value.match(pattern)
  } catch {
    return false
  }
  if (pattern === '') return false
  return true
}

export function isValidExample(pattern: string, example: string) {
  if (
    !isValidRegEx(pattern) ||
    !new RegExp(pattern).test(example) ||
    !pattern ||
    !example
  ) {
    return false
  }
  return true
}

export const getCurrencySelectOptions = () => {
  const currencyOptions = [] as ICurrencyOptions[]
  countryList.all.forEach((element: ICountrylist) => {
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

export const getFormattedFee = (value: string) => {
  let fee = value.replace(/,/g, '')
  if (!isNaN(Number(fee)) || !fee) {
    const decimalPlaces = fee.toString().split('.')[1]
    if (decimalPlaces && decimalPlaces.length > 2) {
      const calcDec = Math.pow(10, 2)
      fee = (Math.trunc(parseFloat(fee) * calcDec) / calcDec).toString()
    }
    if (fee.slice(-1) === '.') {
      return fee
        ? Number(Number(fee).toFixed(1)).toLocaleString().concat('.')
        : EMPTY_STRING
    } else {
      const intValue = fee.split('.')
      if (!fee) {
        return EMPTY_STRING
      }

      if (intValue[1]) {
        return Number(intValue[0])
          .toLocaleString()
          .concat('.' + intValue[1])
      }
      return Number(intValue[0]).toLocaleString()
    }
  }
  return EMPTY_STRING
}

export const getTitle = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameLabel)
  if (changeModalName === GeneralActionId.COUNTRY_LOGO)
    return intl.formatMessage(messages.govermentLogoLabel)
  else if (changeModalName === GeneralActionId.CURRENCY)
    return intl.formatMessage(messages.currencyLabel)
  else if (changeModalName === BirthActionId.BIRTH_REGISTRATION_TARGET)
    return intl.formatMessage(messages.birthLegallySpecifiedDialogTitle)
  else if (changeModalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET)
    return intl.formatMessage(messages.birthDelayedDialogTitle)
  else if (changeModalName === DeathActionId.DEATH_REGISTRATION_TARGET)
    return intl.formatMessage(messages.deathLegallySpecifiedDialogTitle)
  else if (changeModalName === GeneralActionId.NID_NUMBER_PATTERN)
    return intl.formatMessage(messages.nidPatternTitle)
  else if (changeModalName === GeneralActionId.PHONE_NUMBER_PATTERN)
    return intl.formatMessage(messages.phoneNumberPatternTitle)
  else if (
    changeModalName === BirthActionId.BIRTH_ON_TIME_FEE ||
    changeModalName === DeathActionId.DEATH_ON_TIME_FEE
  )
    return intl.formatMessage(messages.onTimeFeeDialogTitle)
  else if (changeModalName === BirthActionId.BIRTH_LATE_FEE)
    return intl.formatMessage(messages.lateFeeDialogTitle)
  else if (
    changeModalName === BirthActionId.BIRTH_DELAYED_FEE ||
    changeModalName === DeathActionId.DEATH_DELAYED_FEE
  )
    return intl.formatMessage(messages.delayedFeeDialogTitle)
  else return EMPTY_STRING
}

export const getMessage = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameChangeMessage)
  else if (changeModalName === GeneralActionId.COUNTRY_LOGO)
    return intl.formatMessage(messages.govtLogoChangeMessage)
  else if (changeModalName === GeneralActionId.CURRENCY)
    return intl.formatMessage(messages.applicationCurrencyChangeMessage)
  else if (changeModalName === GeneralActionId.NID_NUMBER_PATTERN)
    return intl.formatMessage(messages.nidPatternChangeMessage)
  else if (changeModalName === GeneralActionId.PHONE_NUMBER_PATTERN)
    return intl.formatMessage(messages.phoneNumberChangeMessage)
  else return EMPTY_STRING
}

export const isApplyButtonDisabled = (
  state: IState,
  changeModalName: string
) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME) {
    return !Boolean(state.applicationName)
  } else if (changeModalName === GeneralActionId.COUNTRY_LOGO) {
    return !Boolean(state.govtLogo)
  } else if (changeModalName === GeneralActionId.CURRENCY) {
    return !Boolean(state.currency)
  } else if (changeModalName === BirthActionId.BIRTH_REGISTRATION_TARGET) {
    return !Boolean(state.birthRegistrationTarget)
  } else if (changeModalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET) {
    return (
      Number(state.birthLateRegistrationTarget) <
      Number(state.birthRegistrationTarget) + 2
    )
  } else if (changeModalName === DeathActionId.DEATH_REGISTRATION_TARGET) {
    return !Boolean(state.deathRegistrationTarget)
  } else if (changeModalName === BirthActionId.BIRTH_ON_TIME_FEE) {
    return !Boolean(state.birthOnTimeFee)
  } else if (changeModalName === BirthActionId.BIRTH_LATE_FEE) {
    return !Boolean(state.birthLateFee)
  } else if (changeModalName === BirthActionId.BIRTH_DELAYED_FEE) {
    return !Boolean(state.birthDelayedFee)
  } else if (changeModalName === DeathActionId.DEATH_ON_TIME_FEE) {
    return !Boolean(state.deathOnTimeFee)
  } else if (changeModalName === DeathActionId.DEATH_DELAYED_FEE) {
    return !Boolean(state.deathDelayedFee)
  } else if (changeModalName === GeneralActionId.NID_NUMBER_PATTERN) {
    return !isValidRegEx(state.nidPattern) || !Boolean(state.nidPattern)
  } else if (changeModalName === GeneralActionId.PHONE_NUMBER_PATTERN) {
    return (
      !isValidRegEx(state.phoneNumberPattern) ||
      !Boolean(state.phoneNumberPattern)
    )
  } else return true
}

export async function callApplicationConfigMutation(
  configProperty: IActionType,
  appConfig: IApplicationConfig,
  offlineCountryConfiguration: IOfflineData,
  dispatch: Dispatch,
  setIsValueUpdating: (value: boolean) => void
) {
  try {
    setIsValueUpdating(true)
    const res = await configApplicationMutations.mutateApplicationConfig(
      configProperty in GeneralActionId
        ? {
            [configProperty as GeneralActionId]:
              appConfig[configProperty as GeneralActionId]
          }
        : configProperty in BirthActionId
        ? { BIRTH: appConfig.BIRTH }
        : { DEATH: appConfig.DEATH }
    )
    if (res && res.data) {
      const updatedConfigs = res.data.updateApplicationConfig
      setIsValueUpdating(false)
      const offlineConfig = {
        config: {
          ...offlineCountryConfiguration.config,
          ...(configProperty in GeneralActionId && {
            [configProperty]: updatedConfigs[configProperty]
          }),
          ...(configProperty in BirthActionId && {
            BIRTH: updatedConfigs.BIRTH
          }),
          ...(configProperty in DeathActionId && {
            DEATH: updatedConfigs.DEATH
          })
        }
      }
      dispatch(updateOfflineConfigData(offlineConfig))
    }
  } catch (err) {
    throw err
  }
}

export async function callUpdateHideEventRegisterInformationMutation(
  hideEventEegisterInformation: boolean,
  props: IFormConfigSettingsProps
) {
  try {
    const res = await configApplicationMutations.mutateApplicationConfig({
      HIDE_EVENT_REGISTER_INFORMATION: hideEventEegisterInformation
    })
    if (res && res.data) {
      const HIDE_EVENT_REGISTER_INFORMATION =
        res.data.updateApplicationConfig.HIDE_EVENT_REGISTER_INFORMATION
      const offlineConfig = {
        config: {
          ...props.applicationConfig.config,
          HIDE_EVENT_REGISTER_INFORMATION
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    throw err
  }
}

export async function callUpdateAddressesMutation(
  numOfAddresses: number,
  props: IFormConfigSettingsProps
) {
  try {
    const res = await configApplicationMutations.mutateApplicationConfig({
      ADDRESSES: numOfAddresses
    })
    if (res && res.data) {
      const ADDRESSES = res.data.updateApplicationConfig.ADDRESSES
      const offlineConfig = {
        config: {
          ...props.applicationConfig.config,
          ADDRESSES
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    throw err
  }
}
