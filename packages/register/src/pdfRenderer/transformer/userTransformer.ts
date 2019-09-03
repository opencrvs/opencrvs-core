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
    LoggedInUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}'
  */
  LoggedInUserName: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    const nameObj =
      userDetails.name &&
      (userDetails.name.find((storedName: GQLHumanName | null) => {
        const name = storedName as GQLHumanName
        return name.use === 'en' // TODO should be replaced with 'intl.locale' when userDetails will have proper data
      }) as GQLHumanName)
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
    LoggedInUserRole provides the branded role of the loggedIn user.
  */
  LoggedInUserRole: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return userDetails.role
      ? intl.formatMessage(userMessages[userDetails.role])
      : ''
  },

  /*
    LoggedInUserRole provides the branded role of the loggedIn user.
  */
  LoggedInUserSignature: (data: TransformableData, intl: IntlShape) => {
    const userDetails = data as IUserDetails
    return userDetails.signature ? userDetails.signature.data || '' : ''
  }
}
