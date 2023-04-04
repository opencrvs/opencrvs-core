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

import { IDeclaration, IPrintableDeclaration } from '@client/declarations'
import { isDefaultCountry } from '@client/forms/utils'
import { OIDP_VERIFICATION_CALLBACK } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import formatDate from '@client/utils/date-formatting'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { v4 as uuid } from 'uuid'

export const OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY =
  'oidp-verification-nonce'

interface OIDPUserAddress {
  formatted?: string
  street_address?: string
  locality?: string
  region?: string
  postal_code?: string
  city?: string
  country?: string
}

interface oidpUserInfo {
  sub: string
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phone_number?: string
  phone_number_verified?: boolean
  address?: OIDPUserAddress
  updated_at?: number
}

interface UserInfo {
  oidpUserInfo: oidpUserInfo
  districtFhirId?: string
  stateFhirId?: string
}

export interface INidCallbackState {
  pathname: string | undefined
  declarationId: string | undefined
  section: string | undefined
}

export function useQueryParams() {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

export function addNidUserInfoToDeclaration(
  declaration: IDeclaration,
  section: string,
  nidUserInfo: UserInfo
) {
  const oidpUserInfo = nidUserInfo.oidpUserInfo
  const declarationDataSection = declaration.data[section]
  const fieldsModifiedByNidUserInfo = []
  const splitFullName = splitName(oidpUserInfo.name)

  if (oidpUserInfo.birthdate) {
    declarationDataSection[`${section}BirthDate`] = formatDate(
      new Date(oidpUserInfo.birthdate),
      'yyyy-MM-dd'
    )
    fieldsModifiedByNidUserInfo.push(`${section}BirthDate`)
  }

  if (splitFullName.firstName) {
    declarationDataSection['firstNamesEng'] = splitFullName.firstName
    fieldsModifiedByNidUserInfo.push('firstNamesEng')
  }
  if (splitFullName.lastName) {
    declarationDataSection['familyNameEng'] = splitFullName.lastName
    fieldsModifiedByNidUserInfo.push('familyNameEng')
  }

  if (oidpUserInfo.address) {
    const country = oidpUserInfo.address.country
    if (!country) {
      return
    }

    declarationDataSection['countryPrimary'] = country
    fieldsModifiedByNidUserInfo.push('countryPrimary')

    if (isDefaultCountry(country)) {
      //populate default country specific address fields
      if (nidUserInfo.stateFhirId) {
        declarationDataSection['StatePrimary'] = nidUserInfo.stateFhirId
        fieldsModifiedByNidUserInfo.push('StatePrimary')
      }
      if (nidUserInfo.districtFhirId) {
        declarationDataSection['districtPrimary'] = nidUserInfo.districtFhirId
        fieldsModifiedByNidUserInfo.push('districtPrimary')
      }

      if (oidpUserInfo.address.city) {
        declarationDataSection['cityUrbanOptionPrimary'] =
          oidpUserInfo.address.city
        fieldsModifiedByNidUserInfo.push('cityUrbanOptionPrimary')
      }
      if (oidpUserInfo.address.street_address) {
        declarationDataSection['addressLine2UrbanOptionPrimary'] =
          oidpUserInfo.address.street_address
        fieldsModifiedByNidUserInfo.push('addressLine2UrbanOptionPrimary')
      }
      if (oidpUserInfo.address.postal_code) {
        declarationDataSection['postCodePrimary'] =
          oidpUserInfo.address.postal_code
        fieldsModifiedByNidUserInfo.push('postCodePrimary')
      }
    } else {
      //populate international address fields
      if (oidpUserInfo.address.region) {
        declarationDataSection['internationalStatePrimary'] =
          oidpUserInfo.address.region
        fieldsModifiedByNidUserInfo.push('internationalStatePrimary')
      }
      if (oidpUserInfo.address.locality) {
        declarationDataSection['internationalDistrictPrimary'] =
          oidpUserInfo.address.locality
        fieldsModifiedByNidUserInfo.push('internationalDistrictPrimary')
      }
      if (oidpUserInfo.address.city) {
        declarationDataSection['internationalCityPrimary'] =
          oidpUserInfo.address.city
        fieldsModifiedByNidUserInfo.push('internationalCityPrimary')
      }
      if (oidpUserInfo.address.street_address) {
        declarationDataSection['internationalAddressLine1Primary'] =
          oidpUserInfo.address.street_address
        fieldsModifiedByNidUserInfo.push('internationalAddressLine1Primary')
      }
      if (oidpUserInfo.address.postal_code) {
        declarationDataSection['internationalPostcodePrimary'] =
          oidpUserInfo.address.postal_code
        fieldsModifiedByNidUserInfo.push('internationalPostcodePrimary')
      }
    }

    if (section === 'father') {
      declarationDataSection['primaryAddressSameAsOtherPrimary'] = false
    }
  }

  declarationDataSection['fieldsModifiedByNidUserInfo'] =
    fieldsModifiedByNidUserInfo
  declarationDataSection[`${section}NidVerification`] = oidpUserInfo.sub
}

export function generateNonce() {
  return uuid()
}

export function splitName(name = '') {
  const [firstName, ...lastName] = name.split(' ').filter(Boolean)
  return {
    firstName: firstName,
    lastName: lastName.join(' ')
  }
}

export function saveDraftAndRedirectToNidIntegration(
  declaration: IDeclaration | IPrintableDeclaration,
  writeDeclration: (
    declaration: IDeclaration | IPrintableDeclaration,
    callback?: (() => void) | undefined
  ) => void,
  offlineCountryConfig: IOfflineData,
  declarationId: string,
  currentSection: string,
  currentPathname: string
) {
  writeDeclration(declaration)

  const nonce = generateNonce()
  window.localStorage.setItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY, nonce)
  const nidSystemSetting = offlineCountryConfig.systems.find(
    (s) => s.type === 'NATIONAL_ID'
  )?.settings

  if (!nidSystemSetting) {
    return
  }
  const url = new URL(`${nidSystemSetting?.openIdProviderBaseUrl}authorize`)

  url.searchParams.append('nonce', nonce)
  url.searchParams.append(
    'client_id',
    nidSystemSetting?.openIdProviderClientId || ''
  )
  url.searchParams.append(
    'redirect_uri',
    `${window.location.origin}${OIDP_VERIFICATION_CALLBACK}`
  )
  url.searchParams.append('response_type', 'code')
  url.searchParams.append('scope', 'openid profile')
  url.searchParams.append('acr_values', 'mosip:idp:acr:static-code')
  const stateToBeSent: INidCallbackState = {
    pathname: currentPathname,
    declarationId: declarationId,
    section: currentSection
  }
  url.searchParams.append('state', JSON.stringify(stateToBeSent))
  url.searchParams.append('claims', nidSystemSetting.openIdProviderClaims || '')
  window.location.href = url.toString()
}

export const useCheckNonce = () => {
  const params = useQueryParams()
  const [nonceOk, setNonceOk] = useState(false)

  useEffect(() => {
    if (!params.get('nonce')) {
      throw new Error('No nonce provided from OIDP callback.')
    }

    const nonceMatches =
      window.localStorage.getItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY) ===
      params.get('nonce')

    if (nonceMatches) {
      window.localStorage.removeItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY)
      setNonceOk(true)
    } else {
      throw new Error(
        'Nonce did not match the one sent to the integration before callback'
      )
    }
  }, [params])

  return nonceOk
}

export const useExtractCallBackState = () => {
  const params = useQueryParams()

  useEffect(() => {
    if (!params.get('state')) {
      throw new Error('No state provided from OIDP callback.')
    }
  }, [params])

  const { pathname, declarationId, section } = JSON.parse(
    params.get('state') ?? '{}'
  ) as INidCallbackState

  return { pathname, declarationId, section }
}
