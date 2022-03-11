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

import { IntlShape } from 'react-intl'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { messages } from '@client/i18n/messages/views/config'
import { EMPTY_STRING } from '@client/utils/constants'
import { IState, IFullProps, ITempPhoneNumber } from './DynamicModal'
import { configApplicationMutations } from './mutations'

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

export const getTitle = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameLabel)
  else if (changeModalName === GeneralActionId.NID_PATTERN)
    return intl.formatMessage(messages.nidPatternTitle)
  else if (changeModalName === GeneralActionId.PHONE_NUMBER)
    return intl.formatMessage(messages.phoneNumberPatternTitle)
  else return EMPTY_STRING
}

export const getMessage = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameChangeMessage)
  else if (changeModalName === GeneralActionId.NID_PATTERN)
    return intl.formatMessage(messages.nidPatternChangeMessage)
  else if (changeModalName === GeneralActionId.PHONE_NUMBER)
    return intl.formatMessage(messages.phoneNumberChangeMessage)
  else return EMPTY_STRING
}

export const isApplyButtonDisabled = (
  state: IState,
  changeModalName: string
) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME) {
    return !Boolean(state.applicationName)
  } else if (changeModalName === GeneralActionId.NID_PATTERN) {
    return !isValidRegEx(state.nidPattern) || !Boolean(state.nidPattern)
  } else if (changeModalName === GeneralActionId.PHONE_NUMBER) {
    return (
      !isValidRegEx(state.phoneNumberPattern) ||
      !Boolean(state.phoneNumberPattern)
    )
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

export async function callUpdateNIDPatternMutation(
  nidPattern: string,
  props: IFullProps,
  updatingValue: (value: boolean) => void,
  setError: (errorMessage: string) => void
) {
  try {
    updatingValue(true)
    const res = await configApplicationMutations.mutateApplicationConfig({
      NID_NUMBER_PATTERN: nidPattern
    })
    if (res && res.data) {
      updatingValue(false)
      const NID_NUMBER_PATTERN =
        res.data.updateApplicationConfig.NID_NUMBER_PATTERN
      const offlineConfig = {
        config: {
          ...props.offlineCountryConfiguration.config,
          NID_NUMBER_PATTERN
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    setError(props.intl.formatMessage(messages.applicationConfigChangeError))
  }
}

export async function callUpdatePhoneNumberPatternMutation(
  phoneNumberPattern: ITempPhoneNumber,
  props: IFullProps,
  updatingValue: (value: boolean) => void,
  setError: (errorMessage: string) => void
) {
  try {
    updatingValue(true)
    const res = await configApplicationMutations.mutateApplicationConfig({
      PHONE_NUMBER_PATTERN: phoneNumberPattern
    })
    if (res && res.data) {
      updatingValue(false)
      const PHONE_NUMBER_PATTERN =
        res.data.updateApplicationConfig.PHONE_NUMBER_PATTERN
      const offlineConfig = {
        config: {
          ...props.offlineCountryConfiguration.config,
          PHONE_NUMBER_PATTERN
        }
      }
      props.updateConfig(offlineConfig)
    }
  } catch (err) {
    setError(props.intl.formatMessage(messages.applicationConfigChangeError))
  }
}
