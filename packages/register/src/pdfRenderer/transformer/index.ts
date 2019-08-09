import { IApplication } from '@register/applications'
import { InjectedIntl } from 'react-intl'
import { getValueFromApplicationDataByKey } from '@register/pdfRenderer/transformer/utils'
import { Event, IFormSectionData } from '@register/forms'
import {
  IIntLabelPayload,
  IApplicantNamePayload
} from '@register/pdfRenderer/transformer/types'

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
            ? application.event.toString()
            : getValueFromApplicationDataByKey(
                application,
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
  }
}
