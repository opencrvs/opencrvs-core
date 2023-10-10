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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { badRequest, badImplementation } from '@hapi/boom'
import {
  fetchFHIR,
  fetchFromHearth,
  findExtension
} from '@gateway/features/fhir/utils'
import { Code } from '@gateway/features/restLocation/locationHandler'
import * as lookup from 'country-code-lookup'
import { DEFAULT_COUNTRY } from '@gateway/constants'
import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'
import {
  Address,
  Bundle,
  Encounter,
  Patient,
  Resource,
  Task
} from '@opencrvs/commons/types'
const RESOURCE_TYPES = ['Patient', 'RelatedPerson', 'Encounter', 'Observation']

const resourceSchema = Joi.object({
  resourceType: Joi.string()
    .required()
    .valid(...RESOURCE_TYPES)
})

const compositionSchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: Joi.object({
    resourceType: Joi.string().required().valid('Composition')
  })
    .required()
    .unknown()
})

const taskSchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: Joi.object({
    resourceType: Joi.string().required().valid('Task')
  })
    .required()
    .unknown()
})

const entrySchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: resourceSchema.required().unknown()
})

export const fhirBundleSchema = Joi.object({
  resourceType: Joi.string().required().valid('Bundle'),
  type: Joi.string().required().valid('document'),
  meta: Joi.object({
    lastUpdated: Joi.date().iso().required()
  }).required(),
  entry: Joi.array()
    .ordered(compositionSchema, taskSchema)
    .items(entrySchema)
    .required()
})

export function validationFailedAction(
  _: Hapi.Request,
  _2: Hapi.ResponseToolkit,
  e: Joi.ValidationError
) {
  throw e
}

async function validateTask(bundle: Bundle) {
  const taskEntry = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'Task'
  )
  const compositionEntry = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'Composition'
  )
  if (!taskEntry) {
    throw new Error('Task entry not found! in bundle')
  }
  if (!compositionEntry) {
    throw new Error('Composition entry not found! in bundle')
  }
  const task = taskEntry.resource as Task
  if (task.status !== 'draft') {
    throw new Error('Task status should be draft')
  }
  if (task.focus?.reference !== compositionEntry.fullUrl) {
    throw new Error('Task must reference the composition entry')
  }

  if (!task.extension) {
    throw new Error('Task extensions not found')
  }

  // validate office id and office location
  const regLastOfficeIdRef = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
    task.extension
  )?.valueReference?.reference

  const regLastOfficeLocationRef = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
    task.extension
  )?.valueReference?.reference

  if (!regLastOfficeLocationRef) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as office's location was not provided`
    )
  }
  if (!regLastOfficeIdRef) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as office id was not provided`
    )
  }

  // check if the office location is valid
  const officeLocation = await fetchFromHearth(`/${regLastOfficeLocationRef}`)
  if (
    !officeLocation ||
    !officeLocation.type ||
    officeLocation.type.coding?.[0]?.code !== Code.ADMIN_STRUCTURE
  ) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as the provided office location with id ${regLastOfficeLocationRef} was not found`
    )
  }

  // check if the office id is valid and it is part of the provided office location

  const office = await fetchFromHearth(`/${regLastOfficeIdRef}`)
  if (
    !office ||
    !officeLocation.type ||
    office.type.coding?.[0]?.code !== Code.CRVS_OFFICE
  ) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as the provided office with id ${regLastOfficeIdRef} was not found`
    )
  }
  if (!office.partOf || office.partOf.reference !== regLastOfficeLocationRef) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as the provided office isn't part of the provided office location`
    )
  }
}

export async function eventNotificationHandler(
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = req.payload as Bundle
    await validateTask(bundle)
    await validateAddressesOfTask(bundle)
  } catch (e) {
    if (e.isBoom) {
      return h
        .response({
          statusCode: e.output.payload.statusCode,
          error: e.output.payload.message,
          message: e.output.payload.boomCustomMessage
        })
        .code(e.output.payload.statusCode)
    }
    return badRequest(e)
  }
  return fetchFHIR(
    '',
    { Authorization: req.headers.authorization },
    'POST',
    JSON.stringify(req.payload)
  )
}

export async function validateAddressesOfTask(bundle: Bundle) {
  //validate the patient addresses
  const patientEntries = bundle.entry
    .map(({ resource }) => resource)
    .filter(isPatient)

  if (!patientEntries || patientEntries.length === 0) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as there were no Person found!`
    )
  }

  for (const patient of patientEntries) {
    const addresses = (patient as Patient).address

    if (addresses) {
      for (const address of addresses) {
        await validateLocationLevelsAndCountry(address)
      }
    }
  }

  // validate event encounter
  const encounter = getResourceByType<Encounter>(bundle, 'Encounter')
  if (!encounter) {
    throw BoomErrorWithCustomMessage('Encounter entry not found!!')
  }

  const locationId = encounter.location?.[0].location.reference
  if (!locationId) {
    throw BoomErrorWithCustomMessage('Encounter location not found! in bundle!')
  }

  const location = await fetchFromHearth(`/${locationId}`)

  if (!location || !location.type) {
    throw BoomErrorWithCustomMessage(
      `Encounter location with id ${locationId} not found!`
    )
  }

  if (location.type.coding?.[0]?.code !== Code.HEALTH_FACILITY) {
    await validateLocationLevelsAndCountry(location.address)
  }
}

export function getResourceByType<T = Resource>(
  bundle: Bundle,
  type: string
): T | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find((entry) => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === type
      }
    })
  return bundleEntry && (bundleEntry.resource as T)
}

export async function validateLocationLevelsAndCountry(address: Address) {
  const isCountryValid =
    address.country === 'FAR' ||
    (address?.country && lookup.byIso(address?.country))

  if (!isCountryValid) {
    throw BoomErrorWithCustomMessage(
      `Could not process the Event Notification, as the supplied country code ${address.country} was incorrect`
    )
  }

  if (address.country === DEFAULT_COUNTRY) {
    const locationLevels = [
      address.line?.[12],
      address.line?.[11],
      address.line?.[10],
      address.district,
      address.state
    ]

    for (let i = 0; i < locationLevels.length - 1; i++) {
      if (locationLevels[i]) {
        const location = await fetchFromHearth(`/Location/${locationLevels[i]}`)
        if (!location || !location.type) {
          throw BoomErrorWithCustomMessage(
            `Could not process the Event Notification, as the location with id ${locationLevels[i]} not found!`
          )
        }
        const partOf = location.partOf.reference

        if (!partOf || partOf !== `Location/${locationLevels[i + 1]}`) {
          throw BoomErrorWithCustomMessage(
            `Could not process the Event Notification, as the supplied location hierarchy was incorrect`
          )
        }
      }
    }
  }
}

export function BoomErrorWithCustomMessage(message: string) {
  const boomError = badImplementation()
  boomError.output.payload.boomCustomMessage = message
  return boomError
}
function isPatient(
  value: Resource,
  index: number,
  array: Resource[]
): value is Resource {
  throw new Error('Function not implemented.')
}
