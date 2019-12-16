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
  path: '/registrations/birth/export',
  handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const query = request.query as {
      fromDate: string
      toDate: string
    }

    const response = await graphql(
      getExecutableSchema(),
      `
        query data($fromDate: Date!, $toDate: Date!) {
          searchBirthRegistrations(fromDate: $fromDate, toDate: $toDate) {
            id
            child {
              multipleBirth
              name {
                use
                firstNames
                familyName
              }
              birthDate
              gender
            }
            mother {
              name {
                use
                firstNames
                familyName
              }
              birthDate
              maritalStatus
              dateOfMarriage
              educationalAttainment
              nationality
              identifier {
                id
                type
                otherType
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
              telecom {
                system
                value
              }
            }
            father {
              id
              name {
                use
                firstNames
                familyName
              }
              birthDate
              maritalStatus
              dateOfMarriage
              educationalAttainment
              nationality
              identifier {
                id
                type
                otherType
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
              telecom {
                system
                value
              }
            }
            informant {
              id
              individual {
                id
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
            primaryCaregiver {
              parentDetailsType
              primaryCaregiver {
                name {
                  use
                  firstNames
                  familyName
                }
                telecom {
                  system
                  value
                  use
                }
              }
              reasonsNotApplying {
                primaryCaregiverType
                reasonNotApplying
                isDeceased
              }
            }
            registration {
              id
              contact
              contactPhoneNumber
              attachments {
                data
                type
                contentType
                subject
              }
              status {
                comments {
                  comment
                }
                type
                timestamp
                location {
                  name
                  alias
                }
                office {
                  name
                  alias
                  address {
                    district
                    state
                  }
                }
              }
              trackingId
              registrationNumber
            }
            attendantAtBirth
            weightAtBirth
            birthType
            eventLocation {
              type
              address {
                line
                district
                state
                city
                postalCode
                country
              }
            }
            presentAtBirthRegistration
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

    return stringify(response?.data?.searchBirthRegistrations?.map(flatten), {
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
