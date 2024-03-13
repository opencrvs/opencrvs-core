/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TemplateTransformerData,
  TransformerPayload,
  ILanguagePayload,
  ILocationPayload
} from '@client/pdfRenderer/transformer/types'
import { userMessages } from '@client/i18n/messages'
import { HumanName } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'

export function getUserName(
  userDetails: Pick<
    UserDetails | NonNullable<UserDetails['localRegistrar']>,
    'name'
  >
) {
  const nameObj =
    userDetails.name &&
    userDetails.name.find((storedName: HumanName | null) => {
      const name = storedName as HumanName
      return name.use === 'en' // TODO should be replaced with 'intl.locale' when userDetails will have proper data
    })

  return nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''
}

export const userTransformers: IFunctionTransformer = {
  /*
    LocalRegistrarUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}'
  */
  LocalRegistrarUserName: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.localRegistrar
      ? getUserName(templateData.userDetails.localRegistrar)
      : ''
  },
  /*
    LoggedInUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}'
  */
  LoggedInUserName: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return getUserName(templateData.userDetails)
  },

  /*
    LoggedInUserOfficeName provides local office name of the loggedIn user.
  */
  LoggedInUserOfficeName: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.primaryOffice
      ? templateData.userDetails.primaryOffice.name || ''
      : ''
  },

  /*
    LocalRegistrarUserRole provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserRole: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.localRegistrar &&
      templateData.userDetails.localRegistrar.role
      ? intl.formatMessage(
          userMessages[templateData.userDetails.localRegistrar.role]
        )
      : ''
  },
  /*
    LoggedInUserRole provides the branded role of the loggedIn user.
  */
  LoggedInUserRole: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.systemRole
      ? intl.formatMessage(userMessages[templateData.userDetails.systemRole])
      : ''
  },

  /*
    LocalRegistrarUserSignature provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserSignature: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.localRegistrar &&
      templateData.userDetails.localRegistrar.signature
      ? templateData.userDetails.localRegistrar.signature.data || ''
      : ''
  },

  CRVSOfficeName: (
    templateData: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const langKey = payload && (payload as ILanguagePayload)
    if (!langKey || langKey.language === 'en') {
      return (
        (templateData.userDetails.primaryOffice &&
          templateData.userDetails.primaryOffice.name) ||
        ''
      )
    }
    return (
      (templateData.userDetails.primaryOffice &&
        templateData.userDetails.primaryOffice.alias &&
        templateData.userDetails.primaryOffice.alias[0]) ||
      ''
    )
  },

  CRVSLocationName: (
    templateData: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const key = payload && (payload as ILocationPayload)
    if (!key) {
      throw new Error('No payload found for this transformer')
    }
    if (!templateData.userDetails.catchmentArea) {
      return ''
    }
    const crvsLocation =
      templateData.userDetails.catchmentArea &&
      templateData.userDetails.catchmentArea.find((cArea) => {
        return (
          (cArea?.identifier &&
            cArea.identifier.find(
              (identifier) =>
                identifier?.system ===
                  'http://opencrvs.org/specs/id/jurisdiction-type' &&
                identifier.value === key.jurisdictionType
            )) ||
          false
        )
      })

    if (!key.language || key.language === 'en') {
      return (crvsLocation && crvsLocation.name) || ''
    }
    return (crvsLocation && crvsLocation.alias && crvsLocation.alias[0]) || ''
  }
}
