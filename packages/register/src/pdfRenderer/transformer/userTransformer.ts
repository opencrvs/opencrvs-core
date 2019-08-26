import { InjectedIntl } from 'react-intl'
import {
  IFunctionTransformer,
  TransformerData,
  IFeildValuePayload,
  TransformerPayload
} from '@register/pdfRenderer/transformer/types'
import { getValueFromApplicationDataByKey } from '@register/pdfRenderer/transformer/utils'
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
    LoggedInUserFieldValue transforms the value for any given key from the userDetails data
    @params: 
      - key: Mendatory field. It will be able to traverse through the object structure 
      and fetch the appropriate value if found otherwise will throw exception. Ex: 'primaryOffice.name'        
  */
  LoggedInUserFieldValue: (
    userDetails: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    const key = payload && (payload as IFeildValuePayload)
    if (!key) {
      throw new Error('No payload found for this transformer')
    }

    return getValueFromApplicationDataByKey(userDetails, key.valueKey)
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
