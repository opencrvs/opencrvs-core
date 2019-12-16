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
import * as Joi from 'joi'
import * as Hapi from 'hapi'
import { graphql } from 'graphql'
import { getExecutableSchema } from '@gateway/graphql/config'
import * as stringify from 'csv-stringify'
import * as flatten from 'flat'

export default {
  method: 'GET',
  path: '/registrations/death/export',
  handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const query = request.query as {
      fromDate: string
      toDate: string
    }

    const response = await graphql(
      getExecutableSchema(),
      `
        query data($fromDate: Date!, $toDate: Date!) {
          searchDeathRegistrations(fromDate: $fromDate, toDate: $toDate) {
            id
            deceased {
              name {
                use
                firstNames
                familyName
              }
              birthDate
              gender
              maritalStatus
              nationality
              identifier {
                id
                type
                otherType
              }
              gender
              deceased {
                deathDate
              }
              address {
                type
                line
                district
                state
                city
                postalCode
                country
              }
            }
            informant {
              relationship
              otherRelationship
              individual {
                identifier {
                  id
                  type
                  otherType
                }
                name {
                  use
                  firstNames
                  familyName
                }
                nationality
                birthDate
                telecom {
                  system
                  value
                }
                address {
                  type
                  line
                  district
                  state
                  city
                  postalCode
                  country
                }
              }
            }
            father {
              name {
                use
                firstNames
                familyName
              }
            }
            mother {
              name {
                use
                firstNames
                familyName
              }
            }
            spouse {
              name {
                use
                firstNames
                familyName
              }
            }
            registration {
              contact
              contactRelationship
              contactPhoneNumber
              attachments {
                data
                type
                contentType
                subject
              }
              status {
                type
                timestamp
              }
              type
              trackingId
              registrationNumber
            }
            eventLocation {
              type
              address {
                type
                line
                district
                state
                city
                postalCode
                country
              }
            }
            mannerOfDeath
            causeOfDeath
          }
        }
      `,
      undefined,
      { Authorization: request.headers.authorization },
      {
        fromDate: query.fromDate,
        toDate: query.toDate
      }
    )

    return stringify(response?.data?.searchDeathRegistrations?.map(flatten), {
      header: true
    })
  },
  config: {
    tags: ['api'],
    validate: {
      query: Joi.object({
        fromDate: Joi.date(),
        toDate: Joi.date()
      })
    },
    description:
      'Exports all collected metrics data in a zip containing a CSV file for each measurement'
  }
}
