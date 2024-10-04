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
import { http, HttpResponse, graphql } from 'msw'
import {
  FetchUserQuery,
  FetchUserQueryVariables,
  GetSystemRolesQuery,
  GetSystemRolesQueryVariables
} from '@client/utils/gateway'
import healthFacilities from './sources/healthFacilities'
import adminStructures from './sources/adminStructures'
import offices from './sources/offices'
import config from './sources/config'
import forms from './sources/forms'
import content from './sources/content'
import { registrar } from './sources/userResponses'
import systemRoles from './sources/systemRoles'

const userHandler = graphql.query<FetchUserQuery, FetchUserQueryVariables>(
  'fetchUser',
  () => {
    return HttpResponse.json(
      {
        data: registrar
      },
      {
        headers: {
          'X-Version': '1.5.0'
        }
      }
    )
  }
)

const systemRolesHandler = graphql.query<
  GetSystemRolesQuery,
  GetSystemRolesQueryVariables
>('getSystemRoles', () => {
  return HttpResponse.json(
    {
      data: systemRoles
    },
    {
      headers: {
        'X-Version': '1.5.0'
      }
    }
  )
})

const locationHandler = http.get(
  'http://localhost:7070/location',
  ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    if (type === 'CRVS_OFFICE') {
      return HttpResponse.json(offices)
    } else if (type === 'ADMIN_STRUCTURE') {
      return HttpResponse.json(adminStructures)
    } else if (type === 'HEALTH_FACILITY') {
      return HttpResponse.json(healthFacilities)
    }
    throw new Error('Unimplemented')
  }
)

const configHandler = http.get('http://localhost:2021/config', () => {
  return HttpResponse.json(config)
})

const formsHandler = http.get('http://localhost:2021/forms', () => {
  return HttpResponse.json(forms, { status: 201 })
})

const contentHandler = http.get('http://localhost:3040/content/client', () => {
  return HttpResponse.json(content)
})

const certificatesHandler = http.get(
  'http://localhost:3535/certificates/:event',
  ({ params }) => {
    const { event } = params
    if (event === 'birth') {
      return new HttpResponse('dummy')
    } else if (event === 'death') {
      return new HttpResponse('dummy')
    } else if (event === 'marriage') {
      return new HttpResponse('dummy')
    }
    throw new Error('Unimplemented')
  }
)

const handlers = [
  locationHandler,
  userHandler,
  configHandler,
  formsHandler,
  contentHandler,
  certificatesHandler,
  systemRolesHandler
]

export default handlers
