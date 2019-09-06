import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TransformableData
} from '@register/pdfRenderer/transformer/types'
import { userMessages } from '@register/i18n/messages'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { IUserDetails } from '@register/utils/userUtils'

export const userTransformers: IFunctionTransformer = {
  /*
    LocalRegistrarUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}'
  */
  LocalRegistrarUserName: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    const nameObj =
      userDetails.localRegistrar.name &&
      (userDetails.localRegistrar.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === 'en' // TODO should be replaced with 'intl.locale' when userDetails will have proper data
        }
      ) as GQLHumanName)

    return nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
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
    LocalRegistrarUserSignature provides the branded role of the loggedIn user.
  */
  LocalRegistrarUserSignature: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return userDetails.localRegistrar.signature
      ? userDetails.localRegistrar.signature.data || ''
      : ''
  }
}
