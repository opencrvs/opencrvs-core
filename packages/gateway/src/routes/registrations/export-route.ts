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
import * as archiver from 'archiver'
import { unauthorized } from 'boom'

export default {
  method: 'GET',
  path: '/registrations/export',
  handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const auth = request.auth as Hapi.RequestAuth & {
      token: string
    }

    if (!auth.credentials.scope?.includes('api')) {
      throw unauthorized()
    }

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
      { Authorization: `Bearer ${auth.token}` },
      {
        fromDate: query.fromDate,
        toDate: query.toDate
      }
    )

    if (response.errors?.length) {
      throw response.errors[0]
    }

    const birthRows =
      response?.data?.searchBirthRegistrations?.map(flatten) ?? []

    const deathRows =
      response?.data?.searchDeathRegistrations?.map(flatten) ?? []

    const birthCSV = stringify(birthRows, {
      header: true
    })
    const deathCSV = stringify(deathRows, {
      header: true
    })
    const archive = archiver('zip', {
      // Sets the compression level.
      zlib: { level: 9 }
    })

    archive.append(birthCSV, { name: 'birth-registrations.csv' })
    archive.append(deathCSV, { name: 'death-registrations.csv' })

    archive.finalize()

    return archive
  },
  config: {
    tags: ['api'],
    validate: {
      query: Joi.object({
        fromDate: Joi.date(),
        toDate: Joi.date(),
        token: Joi.string()
      })
    },
    description:
      'Exports both birth and death registrations from the selected time period as a CSV'
  }
}
