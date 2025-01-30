/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  IFormData,
  TransformedData,
  IFormField,
  IFormSectionData
} from '@client/forms'
import { formatUrl } from '@client/navigation'
import { VIEW_VERIFY_CERTIFICATE } from '@client/navigation/routes'
import {
  AdminStructure,
  ILocation,
  IOfflineData
} from '@client/offline/reducer'
import format from '@client/utils/date-formatting'
import {
  EventRegistration,
  History,
  RegStatus,
  RegWorkflow
} from '@client/utils/gateway'
import { get } from 'lodash'
import { MessageDescriptor } from 'react-intl'
import QRCode from 'qrcode'
import { getAddressName } from '@client/views/SysAdmin/Team/utils'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import {
  countryAlpha3toAlpha2,
  getLocationHierarchy
} from '@client/utils/locationUtils'
import { createNamesMap } from '@client/utils/data-formatting'
import { LANG_EN } from '@client/utils/constants'

/** @deprecated Use userTransformer instead */
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
    history?.user.role.label ?? ''
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
  alpha3CountryCode?: string
) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  alpha3CountryCode = alpha3CountryCode === 'FAR' ? 'ZMB' : alpha3CountryCode

  const phoneUtil = PhoneNumberUtil.getInstance()
  const number = phoneUtil.parse(mobileWithCountryCode)
  const countryCode = alpha3CountryCode
    ? countryAlpha3toAlpha2(alpha3CountryCode)
    : phoneUtil.getRegionCodeForNumber(number)

  if (!countryCode) {
    return
  }

  if (!phoneUtil.isPossibleNumberString(mobileWithCountryCode, countryCode)) {
    return
  }
  let nationalFormat = phoneUtil
    .format(number, PhoneNumberFormat.NATIONAL)
    .replace(/[^A-Z0-9]+/gi, '')

  // This is a special case for countries that have a national prefix of 0
  if (
    phoneUtil.getNddPrefixForRegion(countryCode, true) === '0' &&
    !nationalFormat.startsWith('0')
  ) {
    nationalFormat = '0' + nationalFormat
  }
  return nationalFormat
}

export const localPhoneTransformer =
  (transformedFieldName?: string, _codeReplacement?: string) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const fieldName = transformedFieldName || field.name
    const msisdnPhone = get(queryData, fieldName as string) as unknown as string
    if (!msisdnPhone) {
      return transformedData
    }
    const localPhone = convertToLocal(msisdnPhone, window.config.COUNTRY)

    transformedData[sectionId][field.name] = localPhone
    return transformedData
  }

const getUserFullName = (history: History): string => {
  return history?.user?.name ? createNamesMap(history.user.name)[LANG_EN] : ''
}

const getUserRole = (history: History): MessageDescriptor => {
  return (
    history?.user?.role.label || {
      defaultMessage: ' ',
      description: 'empty string',
      id: 'form.field.label.empty'
    }
  )
}

const getUserSignature = (history: History): string => {
  return history?.signature?.data as string
}

export const userTransformer =
  (...statuses: RegStatus[]) =>
  (
    transformedData: IFormData,
    event: EventRegistration,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string,
    offlineData?: IOfflineData
  ) => {
    if (!event.history) {
      return
    }
    const history = [...(event.history as History[])]
      .reverse()
      .find(
        ({ action, regStatus }: History) =>
          !action && regStatus && statuses.includes(regStatus)
      )

    if (history?.location && offlineData) {
      const { country, ...locationHierarchyIds } = getLocationHierarchy(
        history.location.id,
        offlineData.locations
      )
      const locationHierarchy: Record<
        string,
        string | AdminStructure | undefined
      > = { country }

      for (const [key, value] of Object.entries(locationHierarchyIds)) {
        locationHierarchy[`${key}Id`] = value
        locationHierarchy[key] = offlineData.locations[value]
      }

      transformedData[targetSectionId || sectionId][
        targetFieldName || 'registrar'
      ] = {
        name: getUserFullName(history),
        role: getUserRole(history),
        office: history.office,
        officeId: history.office?.id,
        date: history.date,
        ...locationHierarchy,
        signature: getUserSignature(history),
        comments: history.comments?.[0]?.comment
      } as IFormSectionData
    }
  }
/** @deprecated Use userTransformer instead */
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
    getUserFullName(history)
}
export const registrationLocationUserTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  offlineData?: IOfflineData
) => {
  const statusData: RegWorkflow[] = queryData['registration'].status
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

export const QRCodeTransformer = async (
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

export const trackingIDTransformer = (
  transformedData: IFormData,
  _: EventRegistration,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  if (!_.registration?.trackingId) {
    return
  }
  transformedData[targetSectionId || sectionId][
    targetFieldName || 'trackingId'
  ] = !_.registration?.trackingId
}
