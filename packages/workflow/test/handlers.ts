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
import { rest } from 'msw'
import { practitioner } from './mocks/practitioner'
import { practitionerRoleBundle } from './mocks/practitionerRole'
import { user } from './mocks/user'
import { office, district, state } from './mocks/locations'
import { TransactionResponse } from '@workflow/records/fhir'
import { RecordEvent } from '@workflow/records/recordEvents'
import { URLReference } from '@opencrvs/commons/types'

const userHandler = rest.post(
  'http://localhost:3030/getUser',
  (_, res, ctx) => {
    return res(ctx.json(user))
  }
)

const practitionerHandler = rest.get(
  'http://localhost:3447/fhir/Practitioner/:practitionerId',
  (_, res, ctx) => {
    return res(ctx.json(practitioner))
  }
)

const practitionerRoleHandler = rest.get(
  'http://localhost:3447/fhir/PractitionerRole',
  (_, res, ctx) => {
    return res(ctx.json(practitionerRoleBundle))
  }
)

const locationHandler = rest.get(
  'http://localhost:3447/fhir/Location/:locationId',
  (req, res, ctx) => {
    const { locationId } = req.params
    const officeId = 'ce73938d-a188-4a78-9d19-35dfd4ca6957'
    const districtId = '0f7684aa-8c65-4901-8318-bf1e22c247cb'
    const stateId = 'ed6195ff-0f83-4852-832e-dc9db07151ff'

    if (locationId === officeId) {
      return res(ctx.json(office))
    } else if (locationId === districtId) {
      return res(ctx.json(district))
    } else if (locationId === stateId) {
      return res(ctx.json(state))
    }
    throw new Error(`no mock set for ${locationId}`)
  }
)

const indexBundleHandler = rest.post(
  'http://localhost:9090/record',
  (_, res, ctx) => {
    return res(ctx.status(200))
  }
)

const auditEventHandler = rest.post(
  'http://localhost:1050/events/birth/:action',
  (req, res, ctx) => {
    const { action } = req.params
    const knownActions = [
      'sent-notification-for-review',
      'sent-for-approval',
      'sent-for-updates',
      'waiting-external-validation',
      'registered',
      'certified',
      'reinstated',
      'issued'
    ] satisfies RecordEvent[]
    if (!knownActions.includes(action as (typeof knownActions)[number])) {
      throw new Error(`no mock set for "${action}" audit action`)
    }
    return res(ctx.status(200))
  }
)

const sendNotificationHandler = rest.post(
  'http://localhost:2020/birth/:event',
  (req, res, ctx) => {
    const { event } = req.params
    const knownActions = ['ready-for-review']
    if (!knownActions.includes(event as string)) {
      throw new Error(`no mock set for "${event}" notification event`)
    }
    return res(ctx.status(200))
  }
)

const notificationFlagsHandler = rest.get(
  'http://localhost:2021/informantSMSNotification',
  (_, res, ctx) => {
    return res(ctx.json([]))
  }
)

const duplicatesHandler = rest.post(
  'http://localhost:9090/search/duplicates/:event',
  (req, res, ctx) => {
    const { event } = req.params
    if (event === 'birth' || event === 'death') {
      return res(ctx.json([]))
    }
    throw new Error(`no mock set for ${event} duplicates`)
  }
)
const hearthHandler = rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
  const responseBundle: TransactionResponse = {
    resourceType: 'Bundle',
    entry: [
      {
        response: {
          status: '201',
          location:
            '/fhir/Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454/_history/ed8853ba-bdb3-41d3-9791-fe720267cc98' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/919495a1-56ed-4fa1-b045-2670b2c6ed63' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/RelatedPerson/fdd5e232-9a8c-4e0f-bd0c-ec5fb80f7501/_history/bb21e740-3e52-4c92-8b10-68e2a4ab6b17' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba/_history/0bff4de7-e595-4e47-8134-96e84f71b54f' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Patient/c42efef3-56c1-4d77-8a2f-b0df78f31a56/_history/bb634261-6c1f-4b89-a0e8-28b340b5eef2' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Patient/cf60f3c7-9ab9-491e-83cd-b6aadc772aa4/_history/97906f2f-0cf0-43cc-ae03-45b3cf6b6503' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Encounter/2e5b37ef-c3c2-4071-af56-d20a16e87891/_history/cf4454c2-5754-4bc9-b173-1622e61eda16' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Location/0f7684aa-8c65-4901-8318-bf1e22c247cb/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Location/ce73938d-a188-4a78-9d19-35dfd4ca6957/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Location/146251e9-df90-4068-82b0-27d8f979e8e2/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/PractitionerRole/f845d4fa-71fe-4d99-9f92-e5ed60838d1d/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      },
      {
        response: {
          status: '201',
          location:
            '/fhir/Location/ed6195ff-0f83-4852-832e-dc9db07151ff/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
        }
      }
    ],
    type: 'transaction-response'
  }

  return res(ctx.json(responseBundle))
})

const handlers = [
  userHandler,
  practitionerHandler,
  practitionerRoleHandler,
  locationHandler,
  notificationFlagsHandler,
  duplicatesHandler,
  indexBundleHandler,
  auditEventHandler,
  sendNotificationHandler,
  hearthHandler
]

export default handlers
