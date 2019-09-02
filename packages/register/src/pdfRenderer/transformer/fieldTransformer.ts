import { IntlShape } from 'react-intl'
import {
  getValueFromApplicationDataByKey,
  getEventMessageDescription,
  getExecutorFieldValue
} from '@register/pdfRenderer/transformer/utils'
import {
  IIntLabelPayload,
  IConditionExecutorPayload,
  IApplicantNamePayload,
  IFeildValuePayload,
  INumberFeildConversionPayload,
  IDateFeildValuePayload,
  IFunctionTransformer,
  TransformableData,
  TransformerPayload,
  IFormattedFeildValuePayload
} from '@register/pdfRenderer/transformer/types'
import moment from 'moment'
import { IFormSectionData } from '@register/forms'
import { IApplication } from '@register/applications'

export const fieldTransformers: IFunctionTransformer = {
  /*
    IntlLabel transforms the internationalized label
    @params:
      - messageDescriptor: Mendatory field, which will be used get the appropriate key
      - MessageValues: Optional field, which will be used to replace any value on the meessage descriptor (if needed)
  */
  IntlLabel: (
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
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

        messageValues = {
          ...messageValues,
          ...{
            [valueKey]: messageValue
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
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
    const formatPayload = payload && (payload as IApplicantNamePayload)
    if (!formatPayload) {
      throw new Error('No payload found for this transformer')
    }
    if (!formatPayload.key[application.event]) {
      throw new Error(
        `No data key defined on payload for event: ${application.event}`
      )
    }
    const applicantObj: IFormSectionData = getValueFromApplicationDataByKey(
      application.data,
      formatPayload.key[application.event]
    )
    let applicantName = ''
    formatPayload.format[
      formatPayload.language ? formatPayload.language : intl.locale
    ].forEach(field => {
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
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
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
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
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

    const locale = formatPayload.language ? formatPayload.language : intl.locale
    if (formatPayload.momentLocale && formatPayload.momentLocale[locale]) {
      require(`moment/${formatPayload.momentLocale[locale]}`)
    }
    moment.locale(locale)
    return moment(dateValue).format(formatPayload.format)
  },

  /*
    FormattedFieldValue transforms the value for one/many given keys from the application data in a provided format
    @params:
      - formattedKeys: Mendatory field. It will be able to traverse through the object structure
      and fetch the appropriate value if found otherwise will throw exception.
      Ex: '{child.firstName}, {child.lastName}'
  */
  FormattedFieldValue: (
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
    const key = payload && (payload as IFormattedFeildValuePayload)
    if (!key) {
      throw new Error('No payload found for this transformer')
    }
    const keys = key.formattedKeys.match(/\{.*?\}/g)
    const keyValues: { [key: string]: string } = {}
    keys &&
      keys.forEach(key => {
        keyValues[key] = getValueFromApplicationDataByKey(
          application.data,
          // Getting rid of { }
          key.substr(1, key.length - 2)
        )
      })
    let value = key.formattedKeys
    Object.keys(keyValues).forEach(key => {
      value = value.replace(new RegExp(`${key}`, 'g'), keyValues[key] || '')
    })
    return value
  },

  /*
    ConditionExecutor allows us to run provided conditions on given from and to fields
    From/To fields can be a key from the application data or can be ExecutorKey type.
    ExecutorKey type allows us to define different type of default data. Ex: CURRENT_DATE
    Conditions is an array of type, minDiff, maxDiff and output
    Based on matched condition, this transformer will render the result based on output type
  */
  ConditionExecutor: (
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
    const params = payload && (payload as IConditionExecutorPayload)
    if (!params) {
      throw new Error('No payload found for this transformer')
    }
    const fromValue = getExecutorFieldValue(params.fromKey, application)
    const toValue = getExecutorFieldValue(params.toKey, application)

    let value = null
    params.conditions.forEach(condition => {
      if (condition.type === 'COMPARE_DATE_IN_DAYS') {
        const diffInDays = moment(toValue).diff(moment(fromValue), 'days')
        if (
          diffInDays >= condition.minDiff &&
          diffInDays <= condition.maxDiff
        ) {
          value = fieldTransformers.IntlLabel(
            application,
            intl,
            condition.output
          )
        }
      }
    })
    return value
  },

  /*
    NumberConversion allows us to convert any number to given format
    @params:
     - valueKey: Mendatory field. It will be able to traverse through the object structure
      and fetch the appropriate value if found otherwise will throw exception. Ex: 'registration.registrationNumber'
     - conversionMap: Mendatory field. ex: { 0: '০', 1: '১'}
  */
  NumberConversion: (
    data: TransformableData,
    intl: IntlShape,
    payload?: TransformerPayload
  ) => {
    const application = data as IApplication
    const params = payload && (payload as INumberFeildConversionPayload)
    if (!params) {
      throw new Error('No payload found for this transformer')
    }
    let value = getValueFromApplicationDataByKey(
      application.data,
      params.valueKey
    ) as string
    Object.keys(params.conversionMap).forEach(number => {
      value = value.replace(
        new RegExp(number, 'g'),
        params.conversionMap[number]
      )
    })
    return value
  }
}
