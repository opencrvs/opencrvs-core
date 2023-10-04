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
  NATIONAL_ID_OIDP_CLIENT_ID,
  NATIONAL_ID_OIDP_BASE_URL,
  NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS,
  NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS
} from '@user-mgnt/constants'
import { ISystemModel } from '@user-mgnt/model/system'
import { pick } from 'lodash'
import { Types } from 'mongoose'

export const types = {
  NATIONAL_ID: 'NATIONAL_ID',
  HEALTH: 'HEALTH',
  RECORD_SEARCH: 'RECORD_SEARCH',
  WEBHOOK: 'WEBHOOK'
}

export const integratingSystemTypes = {
  OTHER: 'OTHER',
  MOSIP: 'MOSIP'
}

type MongooseQueriedSystem = ISystemModel & { _id: Types.ObjectId }

const pickSettings = (system: MongooseQueriedSystem) => {
  const openIdProviderClaims = convertClaimsToUserInfoClaims({
    openIdProviderEssentialClaims: NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS,
    openIdProviderVoluntaryClaims: NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS
  })

  const openIdConnectUrl =
    system.type === 'NATIONAL_ID' &&
    NATIONAL_ID_OIDP_CLIENT_ID &&
    NATIONAL_ID_OIDP_BASE_URL &&
    (NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS || NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS)
      ? {
          openIdProviderBaseUrl: NATIONAL_ID_OIDP_BASE_URL,
          openIdProviderClientId: NATIONAL_ID_OIDP_CLIENT_ID,
          openIdProviderClaims
        }
      : {}

  const webhook = system.settings.webhook.map((ite) => ({
    event: ite.event,
    permissions: ite.permissions
  }))

  return {
    ...openIdConnectUrl,
    webhook,
    dailyQuota: system.settings.dailyQuota
  }
}

/** Returns a curated `System` with only the params we want to expose */
export const pickSystem = (system: MongooseQueriedSystem) => {
  const directlyPassedParameters = pick(system, [
    'name',
    'status',
    'type',
    'integratingSystemType'
  ])

  return {
    ...directlyPassedParameters,
    _id: system._id.toString(),
    // TODO: client_id and sha_secret should be camelCased in the Mongoose-model
    shaSecret: system.sha_secret,
    clientId: system.client_id,
    settings: pickSettings(system)
  }
}

const convertClaimsToUserInfoClaims = ({
  openIdProviderEssentialClaims,
  openIdProviderVoluntaryClaims
}: {
  openIdProviderEssentialClaims: string | null
  openIdProviderVoluntaryClaims: string | null
}) => {
  const userinfo: Record<string, { essential: boolean }> = {}

  for (const claim of (openIdProviderVoluntaryClaims ?? '').split(',')) {
    userinfo[claim] = { essential: false }
  }

  for (const claim of (openIdProviderEssentialClaims ?? '').split(',')) {
    userinfo[claim] = { essential: true }
  }

  return JSON.stringify({
    userinfo,
    id_token: {}
  })
}
