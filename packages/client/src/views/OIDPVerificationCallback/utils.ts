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

import { IDeclaration, IPrintableDeclaration } from '@client/declarations'
import { isDefaultCountry } from '@client/forms/utils'
import { OIDP_VERIFICATION_CALLBACK } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import formatDate from '@client/utils/date-formatting'
import { camelCase } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { v4 as uuid } from 'uuid'

const OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY = 'oidp-verification-nonce'

interface OIDPUserAddress {
  formatted?: string | null
  street_address?: string | null
  locality?: string | null
  region?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string | null
}

interface oidpUserInfo {
  sub: string
  name?: string | null
  given_name?: string | null
  family_name?: string | null
  middle_name?: string | null
  nickname?: string | null
  preferred_username?: string | null
  profile?: string | null
  picture?: string | null
  website?: string | null
  email?: string | null
  email_verified?: boolean | null
  gender?: string | null
  birthdate?: string | null
  zoneinfo?: string | null
  locale?: string | null
  phone_number?: string | null
  phone_number_verified?: boolean | null
  address?: OIDPUserAddress | null
  updated_at?: number | null
}

interface UserInfo {
  oidpUserInfo: oidpUserInfo
  districtFhirId?: string | null
  stateFhirId?: string | null
  locationLevel3FhirId?: string | null
}

interface INidCallbackState {
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

  // initialise the section (mother/father/informant) if it doesn't exist
  if (!declaration.data[section]) {
    declaration.data[section] = {}
  }

  const declarationDataSection = declaration.data[section]
  const fieldsModifiedByNidUserInfo = []
  const splitFullName = splitName(oidpUserInfo.name)

  if (oidpUserInfo.birthdate) {
    // Deceased don't have "deceased" -prefix
    const dataSection = section === 'deceased' ? '' : section
    declarationDataSection[camelCase(`${dataSection}BirthDate`)] = formatDate(
      new Date(oidpUserInfo.birthdate),
      'yyyy-MM-dd'
    )
    fieldsModifiedByNidUserInfo.push(camelCase(`${dataSection}BirthDate`))
  }

  if (splitFullName.firstName) {
    declarationDataSection['firstNamesEng'] = splitFullName.firstName
    fieldsModifiedByNidUserInfo.push('firstNamesEng')
  }
  if (splitFullName.lastName) {
    declarationDataSection['familyNameEng'] = splitFullName.lastName
    fieldsModifiedByNidUserInfo.push('familyNameEng')
  }

  if (oidpUserInfo.address?.country) {
    declarationDataSection['countryPrimary'] = oidpUserInfo.address.country
    fieldsModifiedByNidUserInfo.push('countryPrimary')

    if (isDefaultCountry(oidpUserInfo.address.country)) {
      //populate default country specific address fields
      if (nidUserInfo.stateFhirId) {
        declarationDataSection['statePrimary'] = nidUserInfo.stateFhirId
        fieldsModifiedByNidUserInfo.push('statePrimary')
      }
      if (nidUserInfo.districtFhirId) {
        declarationDataSection['districtPrimary'] = nidUserInfo.districtFhirId
        fieldsModifiedByNidUserInfo.push('districtPrimary')
      }
      if (nidUserInfo.locationLevel3FhirId) {
        declarationDataSection['locationLevel3Primary'] =
          nidUserInfo.locationLevel3FhirId
        fieldsModifiedByNidUserInfo.push('locationLevel3Primary')
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
        declarationDataSection['locationLevel3Primary'] =
          oidpUserInfo.address.city
        fieldsModifiedByNidUserInfo.push('locationLevel3Primary')
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

    if (section === 'spouse') {
      declarationDataSection['primaryAddressSameAsOtherPrimary'] = false
    }
  }

  declarationDataSection['fieldsModifiedByNidUserInfo'] =
    fieldsModifiedByNidUserInfo
  declarationDataSection[`${section}NidVerification`] = oidpUserInfo.sub
}

function generateNonce() {
  return uuid()
}

function splitName(name: string | undefined | null = '') {
  if (!name) {
    return { firstName: '', lastName: '' }
  }

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
