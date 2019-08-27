import { InjectedIntl } from 'react-intl'
import {
  IFunctionTransformer,
  TransformerData
} from '@register/pdfRenderer/transformer/types'
import { userMessages } from '@register/i18n/messages'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

export const userTransformers: IFunctionTransformer = {
  /*
    LoggedInUserName provides the username of the loggedIn user.
    format: '{firstName} {familyName}' 
  */
  LoggedInUserName: (userDetails: TransformerData, intl: InjectedIntl) => {
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
  LoggedInUserOfficeName: (
    userDetails: TransformerData,
    intl: InjectedIntl
  ) => {
    return userDetails.primaryOffice ? userDetails.primaryOffice.name || '' : ''
  },

  /*
    LoggedInUserRole provides the branded role of the loggedIn user.     
  */
  LoggedInUserRole: (userDetails: TransformerData, intl: InjectedIntl) => {
    return userDetails.role
      ? intl.formatMessage(userMessages[userDetails.role])
      : ''
  }
}
