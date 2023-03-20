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
import { OIDP_VERIFICATION_CALLBACK } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import formatDate from '@client/utils/date-formatting'
import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { v4 as uuid } from 'uuid'
import { OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY } from './OIDPVerificationCallback'

interface OIDPUserAddress {
  formatted?: string
  street_address?: string
  locality?: string
  region?: string
  postal_code?: string
  country?: string
}

interface OIDPUserInfo {
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
  nidUserInfo: OIDPUserInfo
) {
  const declarationDataSection = declaration.data[section]
  const fieldsModifiedByNidUserInfo = []
  if (nidUserInfo.birthdate) {
    declarationDataSection[`${section}BirthDate`] = formatDate(
      new Date(nidUserInfo.birthdate),
      'yyyy-MM-dd'
    )
    fieldsModifiedByNidUserInfo.push(`${section}BirthDate`)
  }

  const splitFullName = splitName(nidUserInfo.name)
  if (splitFullName.firstName) {
    declarationDataSection['firstNamesEng'] = splitFullName.firstName
    fieldsModifiedByNidUserInfo.push('firstNamesEng')
  }
  if (splitFullName.lastName) {
    declarationDataSection['familyNameEng'] = splitFullName.lastName
    fieldsModifiedByNidUserInfo.push('familyNameEng')
  }

  declarationDataSection['fieldsModifiedByNidUserInfo'] =
    fieldsModifiedByNidUserInfo
  declarationDataSection[`${section}NidVerification`] = 'verified'

  declarationDataSection['psut'] = nidUserInfo.sub
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
