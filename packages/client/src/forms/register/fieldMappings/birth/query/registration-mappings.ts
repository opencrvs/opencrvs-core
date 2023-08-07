/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  IFormData,
  TransformedData,
  IFormField,
  IFormFieldQueryMapFunction,
  IFormSectionData
} from '@client/forms'
import { userMessages } from '@client/i18n/messages'
import { formatUrl } from '@client/navigation'
import { VIEW_VERIFY_CERTIFICATE } from '@client/navigation/routes'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { getUserName } from '@client/pdfRenderer/transformer/userTransformer'
import format from '@client/utils/date-formatting'
import { Event, History, RegStatus } from '@client/utils/gateway'
import { GQLRegWorkflow } from '@opencrvs/gateway/src/graphql/schema'
import { cloneDeep, get } from 'lodash'
import { MessageDescriptor } from 'react-intl'
import QRCode from 'qrcode'
import { getAddressName } from '@client/views/SysAdmin/Team/utils'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import { countryAlpha3toAlpha2 } from '@client/utils/locationUtils'

export function transformStatusData(
  transformedData: IFormData,
  statusData: GQLRegWorkflow[],
  sectionId: string
) {
  const registrationStatus =
    statusData &&
    statusData.find((status) => {
      return status.type && status.type === 'REGISTERED'
    })
  transformedData[sectionId] = {
    ...transformedData[sectionId],
    commentsOrNotes:
      (statusData &&
        statusData[0] &&
        statusData[0].comments &&
        statusData[0].comments[0] &&
        statusData[0].comments[0].comment) ||
      ''
  }

  if (!registrationStatus) {
    return transformedData
  }
  transformedData[sectionId] = {
    ...transformedData[sectionId],
    regStatus: {
      type: registrationStatus.type || '',
      statusDate: registrationStatus.timestamp,
      officeName:
        (registrationStatus.office && registrationStatus.office.name) || '',
      officeAlias:
        (registrationStatus.office &&
          registrationStatus.office.alias &&
          registrationStatus.office.alias.join(' ')) ||
        '',
      officeAddressLevel3:
        (registrationStatus.office &&
          registrationStatus.office.address &&
          registrationStatus.office.address.district) ||
        '',
      officeAddressLevel4:
        (registrationStatus.office &&
          registrationStatus.office.address &&
          registrationStatus.office.address.state) ||
        ''
    }
  }
  return transformedData
}

export function getBirthRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = Event.Birth
  }

  if (queryData[sectionId].status) {
    transformStatusData(transformedData, queryData[sectionId].status, sectionId)
  }

  if (queryData[sectionId].informantsSignature) {
    transformedData[sectionId].informantsSignature =
      queryData[sectionId].informantsSignature
  }

  if (queryData[sectionId].informantsSignatureURI) {
    transformedData[sectionId].informantsSignatureURI =
      queryData[sectionId].informantsSignatureURI
  }
}

export function registrationNumberTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].registrationNumber) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'registrationNumber'
    ] = queryData[sectionId].registrationNumber
  }
}

export function groomSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].groomSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'groomSignature'
    ] = queryData[sectionId].groomSignature
  }
}

export function brideSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].brideSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'brideSignature'
    ] = queryData[sectionId].brideSignature
  }
}

export function witnessOneSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].witnessOneSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'witnessOneSignature'
    ] = queryData[sectionId].witnessOneSignature
  }
}

export function witnessTwoSignatureTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].witnessTwoSignature) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'witnessTwoSignature'
    ] = queryData[sectionId].witnessTwoSignature
  }
}

export function mosipAidTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].mosipAid) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'mosipAid'
    ] = queryData[sectionId].mosipAid
  }
}

export function mosipAidLabelTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].mosipAid) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'mosipAIDLabel'
    ] = 'MOSIP Application ID'
  }
}

export const certificateDateTransformer =
  (locale: string, dateFormat: string) =>
  (
    transformedData: IFormData,
    _: any,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string
  ) => {
    const prevLocale = window.__localeId__
    window.__localeId__ = locale
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'certificateDate'
    ] = format(new Date(), dateFormat)
    window.__localeId__ = prevLocale
  }

export const convertToLocal = (
  mobileWithCountryCode: string,
  alpha3CountryCode: string
) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */

  const countryCode = countryAlpha3toAlpha2(alpha3CountryCode)

  if (!countryCode) {
    return
  }

  const phoneUtil = PhoneNumberUtil.getInstance()

  if (!phoneUtil.isPossibleNumberString(mobileWithCountryCode, countryCode)) {
    return
  }
  const number = phoneUtil.parse(mobileWithCountryCode, countryCode)

  return phoneUtil
    .format(number, PhoneNumberFormat.NATIONAL)
    .replace(/[^A-Z0-9]+/gi, '')
}

export const localPhoneTransformer =
  (transformedFieldName?: string, codeReplacement?: string) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const fieldName = transformedFieldName || field.name
    const msisdnPhone = get(queryData, fieldName as string) as unknown as string

    const localPhone = convertToLocal(msisdnPhone, window.config.COUNTRY)

    transformedData[sectionId][field.name] = localPhone
    return transformedData
  }

export const changeHirerchyQueryTransformer =
  (
    transformedFieldName?: string,
    transformerMethod?: IFormFieldQueryMapFunction
  ) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField,
    nestedField: IFormField
  ) => {
    if (transformedFieldName) {
      transformedData[sectionId][field.name]['nestedFields'][nestedField.name] =
        get(queryData, transformedFieldName)

      if (transformerMethod) {
        const clonedTransformedData = cloneDeep(transformedData)
        transformerMethod(clonedTransformedData, queryData, sectionId, field)

        transformedData[sectionId][field.name]['nestedFields'][
          nestedField.name
        ] = clonedTransformedData[sectionId][field.name]
      }
    } else {
      transformedData[sectionId][field.name]['nestedFields'][nestedField.name] =
        get(queryData, `${sectionId}.${nestedField.name}`)
    }

    return transformedData
  }

const getUserFullName = (history: History): string => {
  return history?.user ? getUserName(history.user) : ''
}

const getUserRole = (history: History): MessageDescriptor => {
  return (
    (history?.user && userMessages[history.user.systemRole]) || {
      defaultMessage: ' ',
      description: 'empty string',
      id: 'form.field.label.empty'
    }
  )
}

const getUserSignature = (history: History): string => {
  return history?.signature?.data as string
}

export const registrarNameUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    ({ action, regStatus }: History) =>
      !action && regStatus === RegStatus.Registered
  )
  transformedData[targetSectionId || sectionId][targetFieldName || 'userName'] =
    history?.user ? getUserName(history.user) : ''
}

export const roleUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    ({ action, regStatus }: History) =>
      !action && regStatus === RegStatus.Registered
  )

  transformedData[targetSectionId || sectionId][targetFieldName || 'role'] =
    history?.user?.systemRole
      ? (userMessages[history.user.systemRole] as MessageDescriptor &
          Record<string, string>)
      : ''
}

export const registrationLocationUserTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  offlineData?: IOfflineData
) => {
  const statusData: GQLRegWorkflow[] = queryData['registration'].status
  const registrationStatus =
    statusData &&
    statusData.find((status) => {
      return status.type && status.type === 'REGISTERED'
    })
  if (!registrationStatus?.office || !offlineData) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'registrationOffice'
    ] = ''
    return
  }
  const officeName = getAddressName(
    offlineData,
    registrationStatus.office as unknown as ILocation
  )

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'registrationOffice'
  ] = officeName
}

export const registrarSignatureUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    ({ action, regStatus }: History) =>
      !action && regStatus === RegStatus.Registered
  )

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'registrationOffice'
  ] = history?.signature?.data as string
}

export const userTransformer =
  (status: RegStatus) =>
  (
    transformedData: IFormData,
    _: any,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string,
    __?: IOfflineData
  ) => {
    if (!_.history) {
      return
    }
    const history: History = [..._.history]
      .reverse()
      .find(
        ({ action, regStatus }: History) =>
          !action && regStatus && regStatus === status
      )

    if (history) {
      transformedData[targetSectionId || sectionId][
        targetFieldName || 'registrar'
      ] = {
        name: getUserFullName(history),
        role: getUserRole(history),
        office: history?.office,
        signature: getUserSignature(history)
      } as IFormSectionData
    }
  }

export const registrationDateTransformer =
  (locale: string, dateFormat: string) =>
  (
    transformedData: IFormData,
    _: any,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string,
    __?: IOfflineData
  ) => {
    if (!_.history) {
      return
    }
    const history = _.history.find(
      ({ action, regStatus }: History) =>
        !action && regStatus === RegStatus.Registered
    )

    const prevLocale = window.__localeId__
    window.__localeId__ = locale
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'registrationDate'
    ] = format(new Date(history?.date), dateFormat)
    window.__localeId__ = prevLocale
  }

export const QRCodeTransformerTransformer = async (
  transformedData: IFormData,
  queryData: { id: string },
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  transformedData[targetSectionId || sectionId][targetFieldName || 'qrCode'] =
    await QRCode.toDataURL(
      `${window.location.protocol}//${window.location.host}${formatUrl(
        VIEW_VERIFY_CERTIFICATE,
        {
          declarationId: queryData.id
        }
      )}`
    )
}
