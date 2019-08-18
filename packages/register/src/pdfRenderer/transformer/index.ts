import { IApplication } from '@register/applications'
import { InjectedIntl } from 'react-intl'
import {
  getValueFromApplicationDataByKey,
  getEventMessageDescription
} from '@register/pdfRenderer/transformer/utils'
import { Event, IFormSectionData } from '@register/forms'
import {
  IIntLabelPayload,
  IConditionalIntLabelPayload,
  IApplicantNamePayload,
  IFeildValuePayload,
  IDateFeildValuePayload
} from '@register/pdfRenderer/transformer/types'
import moment from 'moment'
import { IUserDetails } from '@opencrvs/register/src/utils/userUtils'
import { userMessages } from '@register/i18n/messages'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

function getEventDifference(application: IApplication) {
  let eventDate
  if (application.event === Event.BIRTH) {
    eventDate = application.data.child.birthDate as string
  } else if (application.event === Event.DEATH) {
    eventDate = application.data.deathEvent.deathDate as string
  }
  if (!eventDate) {
    throw new Error(`No event date found for given event: ${application.event}`)
  }
  const eventAgeInDays = moment(Date.now()).diff(moment(eventDate), 'days')
  if (eventAgeInDays <= 45) {
    return '45d-'
  } else if (eventAgeInDays > 1825) {
    return '5y+'
  } else {
    return '45d+'
  }
}

export const fieldTransformers = {
  //TODO: NEED TO EXPLAIN HERE
  getIntlLabel: (
    application: IApplication,
    intl: InjectedIntl,
    message: IIntLabelPayload
  ) => {
    let messageValues = {}
    if (message.messageValues) {
      Object.keys(message.messageValues).forEach(valueKey => {
        const messageValue =
          valueKey === 'event'
            ? intl.formatMessage(getEventMessageDescription(application.event))
            : getValueFromApplicationDataByKey(
                application.data,
                (message.messageValues && message.messageValues[valueKey]) || ''
              )
        if (messageValue !== null) {
          messageValues = {
            ...messageValues,
            ...{
              [valueKey]: messageValue
            }
          }
        }
      })
    }
    return intl.formatMessage(message.messageDescriptor, messageValues)
  },

  //TODO: NEED TO EXPLAIN HERE
  getApplicantName: (
    application: IApplication,
    intl: InjectedIntl,
    nameFormat: IApplicantNamePayload
  ) => {
    let applicantObj: IFormSectionData
    if (application.event === Event.BIRTH) {
      applicantObj = application.data.child
    } else if (application.event === Event.DEATH) {
      applicantObj = application.data.deceased
    }

    let applicantName = ''
    nameFormat[intl.locale].forEach(field => {
      applicantName = applicantName.concat(`${applicantObj[field]} `)
    })
    return applicantName.substr(0, applicantName.length - 1)
  },

  //TODO: NEED TO EXPLAIN HERE
  getFieldValue: (
    application: IApplication,
    intl: InjectedIntl,
    key: IFeildValuePayload
  ) => {
    return getValueFromApplicationDataByKey(application.data, key.valueKey)
  },

  //TODO: NEED TO EXPLAIN HERE
  getDateFieldValue: (
    application: IApplication,
    intl: InjectedIntl,
    key: IDateFeildValuePayload
  ) => {
    const dateValue = key.valueKey
      ? getValueFromApplicationDataByKey(application.data, key.valueKey)
      : Date.now()
    if (!dateValue) {
      return null
    }
    moment.locale(intl.locale)
    return moment(dateValue).format(key.format)
  },

  //TODO: NEED TO EXPLAIN HERE
  getLoggedInUserName: (userDetails: IUserDetails, intl: InjectedIntl) => {
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

  //TODO: NEED TO EXPLAIN HERE
  getLoggedInUserFieldValue: (
    userDetails: IUserDetails,
    intl: InjectedIntl,
    key: IFeildValuePayload
  ) => {
    return getValueFromApplicationDataByKey(userDetails, key.valueKey)
  },

  //TODO: NEED TO EXPLAIN HERE
  getLoggedInUserRole: (userDetails: IUserDetails, intl: InjectedIntl) => {
    return userDetails.role
      ? intl.formatMessage(userMessages[userDetails.role])
      : ''
  },

  //TODO: NEED TO EXPLAIN HERE
  getLoggedInUserRoleAndName: (
    userDetails: IUserDetails,
    intl: InjectedIntl
  ) => {
    return `${fieldTransformers.getLoggedInUserRole(
      userDetails,
      intl
    )}, ${fieldTransformers.getLoggedInUserName(userDetails, intl)}`
  },

  //TODO: NEED TO EXPLAIN HERE
  getServiceLabel: (
    application: IApplication,
    intl: InjectedIntl,
    messages: IConditionalIntLabelPayload
  ) => {
    return intl.formatMessage(
      messages[
        `${getEventDifference(application)}${application.event.toLowerCase()}`
      ]
    )
  },

  //TODO: NEED TO EXPLAIN HERE
  getServiceAmount: (
    application: IApplication,
    intl: InjectedIntl,
    messages: IConditionalIntLabelPayload
  ) => {
    return intl.formatMessage(messages[`${getEventDifference(application)}`])
  }
}
