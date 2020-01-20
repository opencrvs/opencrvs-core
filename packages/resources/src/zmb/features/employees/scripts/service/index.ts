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
import { ORG_URL } from '@resources/constants'
import { getFromFhir, sendToFhir } from '@resources/zmb/features/utils'
import chalk from 'chalk'
import { logger } from '@resources/logger'
import User, { IUserModel } from '@opencrvs/user-mgnt/src/model/user'
import {
  generateSaltedHash,
  convertToMSISDN,
  ISaltedHash
} from '@resources/utils'
import {
  createUsers,
  getScope
} from '@resources/zmb/features/employees/scripts/manage-users'

interface ITestPractitioner {
  facilityId: string
  environment: string
  username: string
  givenNames: string
  familyName: string
  gender: string
  role: string
  type: string
  mobile: string
  email: string
  signature?: string
}

const composeFhirPractitioner = (practitioner: ITestPractitioner): any => {
  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        use: 'official',
        system: 'mobile',
        value: practitioner.mobile
      }
    ],
    telecom: [{ system: 'phone', value: practitioner.mobile }],
    name: [
      {
        use: 'en',
        family: [practitioner.familyName],
        given: practitioner.givenNames.split(' ')
      }
    ],
    gender: practitioner.gender,
    extension: practitioner.signature
      ? [
          {
            url: 'http://opencrvs.org/specs/extension/employee-signature',
            valueSignature: {
              type: [
                {
                  system: 'urn:iso-astm:E1762-95:2013',
                  code: '1.2.840.10065.1.12.1.13',
                  display: 'Review Signature'
                }
              ],
              when: new Date().toISOString(),
              contentType: 'image/png',
              blob: practitioner.signature
            }
          }
        ]
      : []
  }
}

const composeFhirPractitionerRole = (
  role: string,
  practitioner: string,
  location: fhir.Reference[]
): fhir.PractitionerRole => {
  return {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: practitioner
    },
    code: [
      {
        coding: [
          {
            system: `${ORG_URL}/specs/roles`,
            code: role
          }
        ]
      }
    ],
    location
  }
}

export async function composeAndSavePractitioners(
  practitioners: ITestPractitioner[],
  testUserPassword: string,
  notificationApiUserPassword: string,
  validatorApiUserPassword: string
): Promise<boolean> {
  const users: IUserModel[] = []
  for (const practitioner of practitioners) {
    const locations: fhir.Reference[] = []
    const catchmentAreaIds: string[] = []
    let facilityResource: any
    // get location FHIR references for catchment area and PractitionerRole locations prop
    if (!practitioner.facilityId) {
      throw Error(
        'Cannot save practitioner as no facilityId exists to map practitioner to an office'
      )
    }
    const facility = await getFromFhir(
      `/Location?identifier=${encodeURIComponent(practitioner.facilityId)}`
    )
    facilityResource = facility.entry[0].resource
    const primaryOfficeId = facilityResource.id
    locations.push({ reference: `Location/${primaryOfficeId}` })
    let partOf: fhir.Reference = facilityResource.partOf
    let parentLocation: fhir.Location = {}
    while (partOf.reference !== 'Location/0') {
      parentLocation = await getFromFhir(`/${partOf.reference}`)
      locations.push({ reference: `Location/${parentLocation.id}` })
      if (parentLocation.id && parentLocation.partOf) {
        catchmentAreaIds.push(parentLocation.id)
        partOf = parentLocation.partOf
      }
    }

    // Create and save Practitioner
    const newPractitioner: fhir.Practitioner = composeFhirPractitioner(
      practitioner
    )
    const savedPractitionerResponse = await sendToFhir(
      newPractitioner,
      '/Practitioner',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner to FHIR')
    })

    const practitionerLocationHeader = savedPractitionerResponse.headers.get(
      'location'
    ) as string
    const practitionerId = practitionerLocationHeader.split('/')[3]
    const practitionerReference = `Practitioner/${practitionerId}`

    logger.info(`Practitioner saved to fhir: ${practitionerReference}`)

    // Create and save PractitionerRole
    const newPractitionerRole: fhir.PractitionerRole = composeFhirPractitionerRole(
      practitioner.role,
      practitionerReference,
      locations
    )

    logger.info(
      `PractitionerRole saved to fhir: ${JSON.stringify(newPractitionerRole)}`
    )

    const savedPractitionerRoleResponse = await sendToFhir(
      newPractitionerRole,
      '/PractitionerRole',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner role to FHIR')
    })

    const practitionerRoleLocationHeader = savedPractitionerRoleResponse.headers.get(
      'location'
    ) as string
    const practitionerRoleReference = `PractitionerRole/${
      practitionerRoleLocationHeader.split('/')[3]
    }`

    logger.info(`PractitionerRole saved to fhir: ${practitionerRoleReference}`)

    // create user account

    // create user account
    let pass: ISaltedHash
    if (practitioner.role === 'NOTIFICATION_API_USER') {
      pass = generateSaltedHash(notificationApiUserPassword)
    } else if (practitioner.role === 'VALIDATOR_API_USER') {
      pass = generateSaltedHash(validatorApiUserPassword)
    } else {
      pass = generateSaltedHash(testUserPassword)
    }
    const user = new User({
      name: [
        {
          use: 'en',
          given: [practitioner.givenNames],
          family: practitioner.familyName
        }
      ],
      username: practitioner.username,
      email: practitioner.email,
      mobile: convertToMSISDN(practitioner.mobile, 'zmb'),
      passwordHash: pass.hash,
      salt: pass.salt,
      role: practitioner.role,
      type: practitioner.type,
      scope: getScope(practitioner.role, practitioner.environment),
      status: 'active',
      practitionerId,
      primaryOfficeId,
      catchmentAreaIds,
      securityQuestionAnswers: []
    })
    users.push(user)
  }
  // Create users
  createUsers(users)

  logger.info(
    `${chalk.blueBright(
      '/////////////////////////// FINISHED SAVING TEST USERS ///////////////////////////'
    )}`
  )
  return true
}
