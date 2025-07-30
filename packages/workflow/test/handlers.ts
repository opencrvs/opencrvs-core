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
import { http, HttpResponse } from 'msw'
import { practitioner } from './mocks/practitioner'
import { practitionerRoleBundle } from './mocks/practitionerRole'
import { user } from './mocks/user'
import { office, district, state } from './mocks/locations'
import { RecordEvent } from '@workflow/records/record-events'
import { TransactionResponse } from '@opencrvs/commons/types'
import * as fixtures from '@opencrvs/commons/fixtures'
import { UUID } from '@opencrvs/commons'

const userHandler = http.post('http://localhost:3030/getUser', () => {
  return HttpResponse.json(user)
})

const practitionerHandler = http.get(
  'http://localhost:3447/fhir/Practitioner/:practitionerId',
  () => {
    return HttpResponse.json(practitioner)
  }
)

const practitionerRoleHandler = http.get(
  'http://localhost:3447/fhir/PractitionerRole',
  () => {
    return HttpResponse.json(practitionerRoleBundle)
  }
)

const practitionerRoleHistoryHandler = http.get(
  'http://localhost:3447/fhir/PractitionerRole/:practitionerId/_history',
  () => {
    return HttpResponse.json({
      resourceType: 'Bundle',
      type: 'history',
      entry: []
    })
  }
)

const hierarchyHandler = http.get(
  'http://localhost:2021/locations/ce73938d-a188-4a78-9d19-35dfd4ca6957/hierarchy',
  () => {
    return HttpResponse.json([
      fixtures.savedAdministrativeLocation({
        id: '0f7684aa-8c65-4901-8318-bf1e22c247cb' as UUID,
        name: 'Ibombo',
        partOf: { reference: 'Location/0' as `Location/${UUID}` }
      }),
      fixtures.savedAdministrativeLocation({
        id: 'ce73938d-a188-4a78-9d19-35dfd4ca6957' as UUID,
        name: 'Ibombo District Office',
        partOf: {
          reference:
            'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb' as `Location/${UUID}`
        }
      })
    ])
  }
)

const locationHandler = http.get(
  'http://localhost:3447/fhir/Location/:locationId',
  ({ params }) => {
    const { locationId } = params
    const officeId = 'ce73938d-a188-4a78-9d19-35dfd4ca6957'
    const districtId = '0f7684aa-8c65-4901-8318-bf1e22c247cb'
    const stateId = 'ed6195ff-0f83-4852-832e-dc9db07151ff'

    if (locationId === officeId) {
      return HttpResponse.json(office)
    } else if (locationId === districtId) {
      return HttpResponse.json(district)
    } else if (locationId === stateId) {
      return HttpResponse.json(state)
    }
    throw new Error(`no mock set for ${locationId}`)
  }
)

const indexBundleHandler = http.post('http://localhost:9090/record', () => {
  return HttpResponse.json(null, { status: 200 })
})

const auditEventHandler = http.post(
  'http://localhost:1050/events/birth/:action',
  ({ params }) => {
    const { action } = params
    const knownActions = [
      'sent-notification-for-review',
      'sent-for-approval',
      'sent-for-updates',
      'waiting-external-validation',
      'registered',
      'certified',
      'reinstated',
      'issued',
      'downloaded',
      'archived',
      'unassigned'
    ] satisfies RecordEvent[]
    if (!knownActions.includes(action as (typeof knownActions)[number])) {
      throw new Error(`no mock set for "${action}" audit action`)
    }
    return HttpResponse.json(null, { status: 200 })
  }
)

const sendNotificationHandler = http.post(
  'http://localhost:2020/birth/:event',
  ({ params }) => {
    const { event } = params
    const knownActions = ['ready-for-review', 'sent-for-updates']
    if (!knownActions.includes(event as string)) {
      throw new Error(`no mock set for "${event}" notification event`)
    }
    return HttpResponse.json(null, { status: 200 })
  }
)

const notificationFlagsHandler = http.get(
  'http://localhost:2021/informantSMSNotification',
  () => {
    return HttpResponse.json([])
  }
)

const duplicatesHandler = http.post(
  'http://localhost:9090/search/duplicates/:event',
  ({ params }) => {
    const { event } = params
    if (event === 'birth' || event === 'death') {
      return HttpResponse.json([])
    }
    throw new Error(`no mock set for ${event} duplicates`)
  }
)
const hearthHandler = http.post('http://localhost:3447/fhir', () => {
  const responseBundle: TransactionResponse = {
    resourceType: 'Bundle',
    type: 'batch-response',
    entry: []
  }

  return HttpResponse.json(responseBundle)
})

const handlers = [
  userHandler,
  practitionerHandler,
  practitionerRoleHandler,
  practitionerRoleHistoryHandler,
  hierarchyHandler,
  locationHandler,
  notificationFlagsHandler,
  duplicatesHandler,
  indexBundleHandler,
  auditEventHandler,
  sendNotificationHandler,
  hearthHandler
]

export default handlers
