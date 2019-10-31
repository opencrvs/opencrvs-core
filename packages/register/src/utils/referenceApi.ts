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
import { ILocation } from '@register/offline/reducer'
import { getToken } from '@register/utils/authUtils'
import { ILanguage } from '@register/i18n/reducer'
import { ISerializedForm } from '@register/forms'
import * as ImageDownloader from 'image-to-base64'
import { IPDFTemplate } from '@register/pdfRenderer/transformer/types'
import { ICertificateCollectorDefinition } from '@register/views/PrintCertificate/VerifyCollector'

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: ILocation
}
export interface IDefinitionsResponse {
  languages: ILanguage[]
  forms: {
    registerForm: { birth: ISerializedForm; death: ISerializedForm }
    certificateCollectorDefinition: {
      birth: ICertificateCollectorDefinition
      death: ICertificateCollectorDefinition
    }
  }
  templates: {
    receipt?: IPDFTemplate
    certificates: {
      birth: IPDFTemplate
      death: IPDFTemplate
    }
  }
}
export interface IAssetResponse {
  logo: string
}

async function loadDefinitions(): Promise<IDefinitionsResponse> {
  const url = `${window.config.RESOURCES_URL}/definitions/register`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response
}

async function loadLocations(): Promise<ILocationDataResponse> {
  const url = `${window.config.RESOURCES_URL}/locations`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

async function loadFacilities(): Promise<IFacilitiesDataResponse> {
  const url = `${window.config.RESOURCES_URL}/facilities`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

async function loadAssets(): Promise<IAssetResponse> {
  const url = `${window.config.RESOURCES_URL}/assets/${window.config.COUNTRY_LOGO_FILE}`
  const base64Logo = await ImageDownloader(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  return {
    logo: `data:image;base64,${base64Logo}`
  }
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadDefinitions,
  loadAssets
}
