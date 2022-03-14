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
import { IFullProps, State } from '@client/views/SysAdmin/Config/DynamicModal'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'

export const getTitle = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameLabel)
  else if (changeModalName === GeneralActionId.GOVT_LOGO)
    return intl.formatMessage(messages.govermentLogoLabel)
  else return EMPTY_STRING
}

export const getMessage = (intl: IntlShape, changeModalName: string) => {
  if (changeModalName === GeneralActionId.APPLICATION_NAME)
    return intl.formatMessage(messages.applicationNameChangeMessage)
  else if (changeModalName === GeneralActionId.GOVT_LOGO)
    return intl.formatMessage(messages.govtLogoChangeMessage)
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
