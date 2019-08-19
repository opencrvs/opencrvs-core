import { InjectedIntl } from 'react-intl'
import {
  getValueFromApplicationDataByKey,
  getEventMessageDescription
} from '@register/pdfRenderer/transformer/utils'
import {
  IIntLabelPayload,
  IApplicantNamePayload,
  IFeildValuePayload,
  IDateFeildValuePayload,
  IFunctionTransformer,
  TransformerData,
  TransformerPayload
} from '@register/pdfRenderer/transformer/types'
import moment from 'moment'

export const fieldTransformers: IFunctionTransformer = {
  /*
    IntlLabel transforms the internationalized label
    @params: 
      - messageDescriptor: Mendatory field, which will be used get the appropriate key
      - MessageValues: Optional field, which will be used to replace any value on the meessage descriptor (if needed)  
  */
  IntlLabel: (
    application: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    let messageValues = {}
    const message = payload && (payload as IIntLabelPayload)
    if (!message) {
      throw new Error('No payload found for this transformer')
    }
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

  /*
    ApplicantName transforms the applicant name from the application data
    @params: 
      - key: Mendatory field. Need to provide event wise source object key. Ex: 'birth': 'data.child'  
      - format: Mendatory field. Need to provide locale wise name fields which will be concatenated together with spaces 
  */
  ApplicantName: (
    application: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    const formatPayload = payload && (payload as IApplicantNamePayload)
    if (!formatPayload) {
      throw new Error('No payload found for this transformer')
    }
    if (!formatPayload.key[application.event]) {
      throw new Error(
        `No data key defined on payload for event: ${application.event}`
      )
    }
    const applicantObj = getValueFromApplicationDataByKey(
      application.data,
      formatPayload.key[application.event]
    )
    let applicantName = ''
    formatPayload.format[intl.locale].forEach(field => {
      applicantName = applicantName.concat(`${applicantObj[field] || ''} `)
    })
    return applicantName.substr(0, applicantName.length - 1)
  },

  /*
    FieldValue transforms the value for any given key from the application data
    @params: 
      - key: Mendatory field. It will be able to traverse through the object structure 
      and fetch the appropriate value if found otherwise will throw exception. Ex: 'child.dob'        
  */
  FieldValue: (
    application: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    const key = payload && (payload as IFeildValuePayload)
    if (!key) {
      throw new Error('No payload found for this transformer')
    }
    return getValueFromApplicationDataByKey(application.data, key.valueKey)
  },

  /*
    DateFieldValue transforms the date value for any given key from the application data
    @params: 
      - key: Optional field. It will be able to traverse through the object structure 
      and fetch the appropriate value if found otherwise will throw exception. Ex: 'child.dob'        
      If key is not provided, it will take current time as dateValue
      - format: Mendatory field. Formats the extracted date value by this given format. 
  */
  DateFieldValue: (
    application: TransformerData,
    intl: InjectedIntl,
    payload?: TransformerPayload
  ) => {
    const formatPayload = payload && (payload as IDateFeildValuePayload)
    if (!formatPayload) {
      throw new Error('No payload found for this transformer')
    }
    const dateValue = formatPayload.key
      ? getValueFromApplicationDataByKey(
          application.data,
          formatPayload.key[application.event]
        )
      : Date.now()
    if (!dateValue) {
      return null
    }
    moment.locale(intl.locale)
    return moment(dateValue).format(formatPayload.format)
  }
}
