import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TransformableData
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
  LocalRegistrarUserName: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return getUserName(userDetails.localRegistrar)
  },
  /*
    LoggedInUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}'
  */
  LoggedInUserName: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return getUserName(userDetails)
  },

  /*
    LoggedInUserOfficeName provides local office name of the loggedIn user.
  */
  LoggedInUserOfficeName: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return userDetails.primaryOffice ? userDetails.primaryOffice.name || '' : ''
  },

  /*
    LocalRegistrarUserRole provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserRole: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails

    return userDetails.localRegistrar.role
      ? intl.formatMessage(userMessages[userDetails.localRegistrar.role])
      : ''
  },
  /*
    LoggedInUserRole provides the branded role of the loggedIn user.
  */
  LoggedInUserRole: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails

    return userDetails.role
      ? intl.formatMessage(userMessages[userDetails.role])
      : ''
  },

  /*
    LocalRegistrarUserSignature provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserSignature: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return userDetails.localRegistrar.signature
      ? userDetails.localRegistrar.signature.data || ''
      : ''
  }
}
