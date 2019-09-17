import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TemplateTransformerData
} from '@register/pdfRenderer/transformer/types'
import { userMessages } from '@register/i18n/messages'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { IUserDetails } from '@register/utils/userUtils'

function getUserName(userDetails: Pick<IUserDetails, 'name'>) {
  const nameObj =
    userDetails.name &&
    (userDetails.name.find((storedName: GQLHumanName | null) => {
      const name = storedName as GQLHumanName
      return name.use === 'en' // TODO should be replaced with 'intl.locale' when userDetails will have proper data
    }) as GQLHumanName)

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
    return getUserName(templateData.userDetails.localRegistrar)
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
    return templateData.userDetails.localRegistrar.role
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
    return templateData.userDetails.role
      ? intl.formatMessage(userMessages[templateData.userDetails.role])
      : ''
  },

  /*
    LocalRegistrarUserSignature provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserSignature: (
    templateData: TemplateTransformerData,
    intl: IntlShape
  ) => {
    return templateData.userDetails.localRegistrar.signature
      ? templateData.userDetails.localRegistrar.signature.data || ''
      : ''
  }
}
