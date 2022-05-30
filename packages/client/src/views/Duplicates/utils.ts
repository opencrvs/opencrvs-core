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
import gql from 'graphql-tag'
import { Registration, Maybe } from '@client/utils/gateway'

export type FetchDuplicateDeatilsQuery = {
  registration?: Maybe<Pick<Registration, 'trackingId'>>
}

export function createDuplicateDetailsQuery(ids: string[]) {
  const listQueryParams = () => {
    return ids.map((_, i) => `$duplicate${i}Id: ID!`).join(', ')
  }

  const writeQueryForId = (_: string, i: number) => `
    duplicate${i}: fetchRegistration(id: $duplicate${i}Id) {
      registration {
        trackingId
      }
    }`

  return gql`
    query fetchDuplicateDetails(${listQueryParams()}) {
      ${ids.map((_, i) => writeQueryForId(_, i)).join(',\n')}
    }
  `
}
